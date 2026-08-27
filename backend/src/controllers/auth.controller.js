import supabase from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import EmailService from '../services/email.service.js';
import { logAction } from '../services/audit.service.js';
import ActivityLogService from '../services/activity.service.js';
import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../errors/AppError.js';

export const register = asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;

    if (!validateEmail(email)) {
        throw AppError.badRequest('Invalid email');
    }
    if (!validatePassword(password)) {
        throw AppError.badRequest('Password must be at least 6 characters');
    }

    // Check if user exists
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (existingUser) {
        throw AppError.badRequest('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: newUser, error } = await supabase
        .from('users')
        .insert({
            email,
            password_hash: passwordHash,
            plan: 'free',
            name: name
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP
    await supabase
        .from('users')
        .update({
            otp_code: otpCode,
            otp_expires_at: otpExpiresAt,
            is_verified: false
        })
        .eq('id', newUser.id);

    // Send Verification Email
    await EmailService.sendVerificationEmail(newUser.email, otpCode);

    // Do NOT send token yet
    res.status(201).json({
        requireVerification: true,
        email: newUser.email,
        message: 'Registration successful. Please check your email for verification code.'
    });
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (!user) {
        throw AppError.unauthorized('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw AppError.unauthorized('Invalid credentials');
    }

    if (!user.is_verified) {
        return res.status(403).json({ error: 'Email not verified', requireVerification: true, email: user.email });
    }

    const token = generateToken(user.id);

    // Audit Log
    await logAction(user.id, 'USER_LOGIN');

    // Activity Log
    await ActivityLogService.log(
        null, // No specific project for login
        user.id,
        'auth.login',
        `User logged in: ${user.email}`,
        'success',
        req.ip,
        {
            resource: '/auth/login',
            http_method: 'POST',
            http_status: 200,
            user_agent: req.headers['user-agent'],
            plan: user.plan
        }
    );

    // Send New Login Email
    const loginDetails = {
        time: new Date().toLocaleString(),
        ip: req.ip,
        location: 'Unknown Location', // GeoIP lookup would go here
        device: req.headers['user-agent']
    };
    // Don't await to avoid blocking response
    EmailService.sendNewLoginEmail(user.email, loginDetails, user.name || 'User').catch(console.error);

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            plan: user.plan,
            avatar_url: user.avatar_url
        }
    });
});

export const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
    res.json(req.user);
};

export const verifyEmail = asyncHandler(async (req, res) => {
    console.log('Verify Email Request Body:', req.body);
    const { code, email } = req.body; // Email is needed to find user if not authenticated

    if (!code || code.length !== 6) {
        throw AppError.badRequest('Invalid code format');
    }

    // Find user by email (if provided) or if we had a temporary session (not applicable here as we don't issue token)
    // We need email from frontend
    if (!email) {
        throw AppError.badRequest('Email is required');
    }

    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (!user) {
        throw AppError.notFound('User not found');
    }

    if (user.is_verified) {
        return res.json({ success: true, message: 'Email already verified' });
    }

    if (user.otp_code !== code) {
        throw AppError.badRequest('Invalid verification code');
    }

    if (new Date(user.otp_expires_at) < new Date()) {
        throw AppError.badRequest('Verification code expired');
    }

    // Verify User
    await supabase
        .from('users')
        .update({
            is_verified: true,
            otp_code: null,
            otp_expires_at: null
        })
        .eq('id', user.id);

    // Generate Token and Login
    const token = generateToken(user.id);

    // Send Welcome Email NOW (after verification)
    await EmailService.sendWelcomeEmail(user.email, user.name || 'User');

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({
        success: true,
        message: 'Email verified successfully',
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            plan: user.plan,
            avatar_url: user.avatar_url
        }
    });
});

export const resendVerification = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw AppError.badRequest('Email is required');
    }

    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (!user) {
        throw AppError.notFound('User not found');
    }

    if (user.is_verified) {
        return res.json({ success: true, message: 'Email already verified' });
    }

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP
    const { error } = await supabase
        .from('users')
        .update({
            otp_code: otpCode,
            otp_expires_at: otpExpiresAt
        })
        .eq('id', user.id);

    if (error) throw error;

    // Send Verification Email
    await EmailService.sendVerificationEmail(user.email, otpCode);

    res.json({ success: true, message: 'Verification code sent' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    // Check if user exists
    const { data: user } = await supabase.from('users').select('id').eq('email', email).single();

    if (!user) {
        throw AppError.notFound('No account found with this email address');
    }

    // Generate reset token (JWT or random string)
    const resetToken = generateToken(user.id); // Short lived token
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    await EmailService.sendPasswordResetEmail(email, resetLink);

    res.json({ success: true, message: 'Reset link sent to your email.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token) {
        throw AppError.badRequest('Token is required');
    }

    // Verify token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw AppError.badRequest('Invalid or expired token');
    }

    const userId = decoded.id;

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password in DB and verify user
    const { error } = await supabase
        .from('users')
        .update({
            password_hash: passwordHash,
            is_verified: true // Auto-verify since they have email access
        })
        .eq('id', userId);

    if (error) throw error;

    // Audit Log
    await logAction(userId, 'USER_PASSWORD_RESET');

    // Send Password Changed Email
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    EmailService.sendPasswordChangedEmail(decoded.email || 'User', date, time, 'User').catch(console.error);

    res.json({ success: true, message: 'Password reset successfully' });
});

export const googleLogin = asyncHandler(async (req, res) => {
    console.log('Google Login Request Body:', req.body);
    const { token } = req.body;

    if (!token) {
        console.log('Token missing in request');
        throw AppError.badRequest('Token required');
    }

    // Verify token and get user info from Google
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
        console.log('Google UserInfo failed:', response.status, response.statusText);
        throw AppError.unauthorized('Invalid Google token');
    }

    const googleUser = await response.json();
    console.log('Google User Info:', googleUser);

    const { email, name, sub: googleId, picture: avatar } = googleUser;

    if (!email) {
        console.log('Email missing in Google User Info');
        throw AppError.badRequest('Email required from Google');
    }

    // Check if user exists
    let { data: user } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${email},google_id.eq.${googleId}`)
        .single();

    if (user) {
        // Update google_id if missing
        if (!user.google_id) {
            await supabase.from('users').update({ google_id: googleId, is_verified: true }).eq('id', user.id);
        }

        // Send New Login Email for existing users
        const loginDetails = {
            time: new Date().toLocaleString(),
            ip: req.ip,
            location: 'Unknown Location',
            device: req.headers['user-agent']
        };
        EmailService.sendNewLoginEmail(user.email, loginDetails, user.name || 'User').catch(console.error);
    } else {
        // Create new user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                email,
                name,
                google_id: googleId,
                avatar_url: avatar,
                is_verified: true, // Google emails are verified
                plan: 'free',
                password_hash: 'google_auth' // Placeholder
            })
            .select()
            .single();

        if (error) throw error;
        user = newUser;

        // Send Welcome Email for new Google users
        await EmailService.sendWelcomeEmail(user.email, user.name || 'User');
    }

    const jwtToken = generateToken(user.id);

    res.cookie('token', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({
        token: jwtToken,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            plan: user.plan,
            avatar_url: user.avatar_url
        }
    });
});

export default { register, login, logout, getMe, verifyEmail, resendVerification, forgotPassword, resetPassword, googleLogin };
