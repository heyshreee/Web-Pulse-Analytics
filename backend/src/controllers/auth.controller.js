import supabase from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import { generateToken, generateResetToken, verifyToken, TOKEN_PURPOSE } from '../utils/jwt.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import EmailService from '../services/email.service.js';
import { logAction } from '../services/audit.service.js';
import ActivityLogService from '../services/activity.service.js';
import sessionService from '../services/session.service.js';
import { getClientIp } from '../utils/ip.js';
import { randomUUID } from 'crypto';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../errors/AppError.js';

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (matches JWT TTL)

/**
 * Issues a session: a signed JWT carrying purpose=session and a unique jti,
 * plus the server-side row that makes it revocable.
 */
const issueSession = async (user, req) => {
    const tokenId = randomUUID();
    const token = generateToken(user.id, { tokenId });

    await sessionService.createSession({
        userId: user.id,
        tokenId,
        purpose: sessionService.SESSION_PURPOSE.SESSION,
        userAgent: req.headers['user-agent'] || null,
        ip: getClientIp(req),
        expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString()
    });

    return token;
};

const setSessionCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: SESSION_MAX_AGE_MS
    });
};

const publicUser = (user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    avatar_url: user.avatar_url
});

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

    // Compare against a dummy hash when the account does not exist so the
    // response time does not reveal which addresses are registered.
    let isMatch = false;
    try {
        const hash = user?.password_hash || '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
        isMatch = await bcrypt.compare(password, hash);
    } catch {
        isMatch = false;
    }

    if (!user || !isMatch) {
        throw AppError.unauthorized('Invalid credentials');
    }

    if (!user.is_verified) {
        return res.status(403).json({ error: 'Email not verified', requireVerification: true, email: user.email });
    }

    const token = await issueSession(user, req);

    // Audit Log
    await logAction(user.id, 'USER_LOGIN');

    // Activity Log
    await ActivityLogService.log(
        null,
        user.id,
        'auth.login',
        `User logged in: ${user.email}`,
        'success',
        req.ip,
        {
            resource: '/auth/login',
            http_method: 'POST',
            http_status: 200,
            user_agent: req.headers['user-agent']
        }
    );

    // Send New Login Email
    const loginDetails = {
        time: new Date().toLocaleString(),
        ip: req.ip,
        location: 'Unknown Location',
        device: req.headers['user-agent']
    };
    EmailService.sendNewLoginEmail(user.email, loginDetails, user.name || 'User').catch(console.error);

    setSessionCookie(res, token);

    // Deliver session token via HttpOnly cookie for web browsers, and return
    // in payload for clients and mobile/API consumers.
    res.json({ token, user: publicUser(user) });
});

export const logout = asyncHandler(async (req, res) => {
    // Revoke the session server-side so the token stops working even if it
    // was copied out of the browser before sign-out.
    if (req.tokenId) {
        await sessionService.revokeSessionByTokenId(req.user.id, req.tokenId);
    }
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

export const getMe = async (req, res) => {
    res.json(req.user);
};

export const verifyEmail = asyncHandler(async (req, res) => {
    const { code, email } = req.body;

    if (!code || code.length !== 6) {
        throw AppError.badRequest('Invalid code format');
    }

    if (!email) {
        throw AppError.badRequest('Email is required');
    }

    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    // A single generic failure for "no such account" and "wrong code" — the
    // endpoint must not be usable to discover which addresses are registered.
    if (!user) {
        throw AppError.badRequest('Invalid or expired verification code');
    }

    if (user.is_verified) {
        return res.json({ success: true, message: 'Email verified successfully' });
    }

    if (user.otp_code !== code) {
        throw AppError.badRequest('Invalid or expired verification code');
    }

    if (new Date(user.otp_expires_at) < new Date()) {
        throw AppError.badRequest('Invalid or expired verification code');
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

    const token = await issueSession(user, req);

    // Send Welcome Email
    await EmailService.sendWelcomeEmail(user.email, user.name || 'User');

    setSessionCookie(res, token);

    res.json({
        success: true,
        message: 'Email verified successfully',
        token,
        user: publicUser(user)
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

    // Generic response if account not found or already verified, preventing user enumeration
    if (!user || user.is_verified) {
        return res.json({ success: true, message: 'If an unverified account exists, a verification code was sent.' });
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
    const { data: user } = await supabase.from('users').select('id, email, name').eq('email', email).maybeSingle();

    if (!user) {
        // Return same success message so existence is not revealed
        return res.json({
            success: true,
            message: 'If an account exists for that address, a reset link is on its way.'
        });
    }

    // Generate single-use reset token and store in session store
    const resetTokenId = randomUUID();
    const resetToken = generateResetToken(user.id, { tokenId: resetTokenId });

    await sessionService.createSession({
        userId: user.id,
        tokenId: resetTokenId,
        purpose: sessionService.SESSION_PURPOSE.PASSWORD_RESET,
        userAgent: req.headers['user-agent'] || null,
        ip: getClientIp(req),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    });

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    await EmailService.sendPasswordResetEmail(user.email, resetLink, user.name || 'User');

    res.json({
        success: true,
        message: 'If an account exists for that address, a reset link is on its way.'
    });
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body || {};

    if (!token) {
        throw AppError.badRequest('Token is required');
    }

    if (!validatePassword(password)) {
        throw AppError.badRequest('Password must be at least 6 characters');
    }

    // Verify token
    let decoded;
    try {
        decoded = verifyToken(token);
    } catch (err) {
        throw AppError.badRequest('Invalid or expired token');
    }

    if (decoded.purpose !== TOKEN_PURPOSE.PASSWORD_RESET) {
        throw AppError.badRequest('Invalid or expired token');
    }

    // Single-use validation via session store
    const resetRecord = await sessionService.getSession(decoded.jti);
    const usable =
        resetRecord &&
        resetRecord.purpose === sessionService.SESSION_PURPOSE.PASSWORD_RESET &&
        !resetRecord.revoked_at &&
        (!resetRecord.expires_at || new Date(resetRecord.expires_at) > new Date());

    if (!usable) {
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
            is_verified: true
        })
        .eq('id', userId);

    if (error) throw error;

    // Burn the reset token and revoke all active sessions
    await sessionService.revokeSessionByTokenId(userId, decoded.jti);
    await sessionService.revokeAllSessions(userId);

    // Audit Log
    await logAction(userId, 'USER_PASSWORD_RESET');

    // Send Password Changed Email
    const { data: user } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', userId)
        .maybeSingle();

    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    EmailService.sendPasswordChangedEmail(user?.email || 'User', date, time, user?.name || 'User').catch(console.error);

    res.json({ success: true, message: 'Password reset successfully' });
});

export const googleLogin = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        throw AppError.badRequest('Token required');
    }

    // Verify token and get user info from Google
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
        throw AppError.unauthorized('Invalid Google token');
    }

    const googleUser = await response.json();
    const { email, name, sub: googleId, picture: avatar } = googleUser;

    if (!email) {
        throw AppError.badRequest('Email required from Google');
    }

    // Check if user exists
    let { data: user } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${email},google_id.eq.${googleId}`)
        .single();

    if (user) {
        if (!user.google_id) {
            await supabase.from('users').update({ google_id: googleId, is_verified: true }).eq('id', user.id);
        }

        const loginDetails = {
            time: new Date().toLocaleString(),
            ip: req.ip,
            location: 'Unknown Location',
            device: req.headers['user-agent']
        };
        EmailService.sendNewLoginEmail(user.email, loginDetails, user.name || 'User').catch(console.error);
    } else {
        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                email,
                name,
                google_id: googleId,
                avatar_url: avatar,
                is_verified: true,
                plan: 'free',
                password_hash: 'google_auth'
            })
            .select()
            .single();

        if (error) throw error;
        user = newUser;

        await EmailService.sendWelcomeEmail(user.email, user.name || 'User');
    }

    const jwtToken = await issueSession(user, req);

    setSessionCookie(res, jwtToken);

    res.json({ token: jwtToken, user: publicUser(user) });
});

export default { register, login, logout, getMe, verifyEmail, resendVerification, forgotPassword, resetPassword, googleLogin };
