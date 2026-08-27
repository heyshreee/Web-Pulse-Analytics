import supabase from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import usageService from '../services/usage.service.js';
import ActivityLogService from '../services/activity.service.js';
import cloudinaryPkg from 'cloudinary';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../errors/AppError.js';

const cloudinary = cloudinaryPkg.v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const getUsageStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const usage = await usageService.calculateUsage(userId);
    res.json(usage);
});

export const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { name, bio, timezone, language, job_title } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (timezone !== undefined) updates.timezone = timezone;
    if (language !== undefined) updates.language = language;
    if (job_title !== undefined) updates.job_title = job_title;

    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;

    await ActivityLogService.log(
        null,
        userId,
        'user.profile_update',
        'Updated profile details',
        'info',
        req.ip
    );

    res.json({ success: true, user: data });
});

export const updateAvatar = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
        throw AppError.badRequest('No file uploaded');
    }

    // Upload to Cloudinary
    const b64 = Buffer.from(file.buffer).toString('base64');
    let dataURI = "data:" + file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'obs-tracker/avatars',
        public_id: `user_${userId}`,
        overwrite: true,
        transformation: [{ width: 400, height: 400, crop: 'fill' }]
    });

    // Update Supabase
    const { data, error } = await supabase
        .from('users')
        .update({ avatar_url: result.secure_url })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;

    await ActivityLogService.log(
        null,
        userId,
        'user.avatar_update',
        'Updated profile picture',
        'info',
        req.ip
    );

    res.json({ success: true, avatar_url: result.secure_url });
});

export const updatePassword = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const { data: user } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single();

    if (!user || !user.password_hash) {
        throw AppError.badRequest('User not found or no password set');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
        throw AppError.badRequest('Incorrect current password');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const { error } = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('id', userId);

    if (error) throw error;

    await ActivityLogService.log(
        null,
        userId,
        'user.password_change',
        'Changed password',
        'warning',
        req.ip
    );

    res.json({ success: true, message: 'Password updated successfully' });
});

export const getSessions = asyncHandler(async (req, res) => {
    // Mock sessions for now as we don't track them in DB yet
    // In a real app, we would query a sessions table
    const sessions = [
        {
            id: 'current',
            device: req.headers['user-agent'],
            ip: req.ip,
            lastActive: new Date(),
            isCurrent: true,
            location: 'Unknown'
        }
    ];
    res.json(sessions);
});

export const revokeSession = asyncHandler(async (req, res) => {
    // Mock revocation
    const { sessionId } = req.params;
    res.json({ success: true, message: 'Session revoked' });
});

export const updateNotificationPreferences = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { preferences } = req.body;

    const { data, error } = await supabase
        .from('users')
        .update({ notification_preferences: preferences })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;

    res.json({ success: true, preferences: data.notification_preferences });
});

export default { getUsageStats, updateProfile, updateAvatar, updatePassword, getSessions, revokeSession, updateNotificationPreferences };
