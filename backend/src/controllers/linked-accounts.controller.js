import supabase from '../config/supabase.js';
import usageService from '../services/usage.service.js';
import TelegramService from '../services/telegram.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../errors/AppError.js';

export const getLinkedAccounts = asyncHandler(async (req, res) => {
    const { data, error } = await supabase
        .from('users')
        .select('linked_accounts')
        .eq('id', req.user.id)
        .single();

    if (error) throw error;
    res.json(data.linked_accounts || {});
});

export const linkTelegram = asyncHandler(async (req, res) => {
    const { chat_id, username, bot_token } = req.body;

    if (!chat_id) {
        throw AppError.badRequest('Chat ID is required');
    }

    // Check Plan - Telegram is Pro only
    const usage = await usageService.calculateUsage(req.user.id);
    const PLAN_LEVELS = { free: 0, basic: 1, pro: 2, business: 3 };
    const currentLevel = PLAN_LEVELS[usage.plan] || 0;

    if (currentLevel < PLAN_LEVELS.pro) {
        return res.status(403).json({
            error: 'Telegram integration is available on Pro plan and above.',
            required_plan: 'pro'
        });
    }

    // Fetch existing
    const { data: user } = await supabase
        .from('users')
        .select('linked_accounts')
        .eq('id', req.user.id)
        .single();

    const existing = user?.linked_accounts || {};

    const newData = {
        ...existing,
        telegram: {
            chat_id,
            username,
            bot_token: bot_token || null, // Store custom token if provided
            linked_at: new Date().toISOString()
        }
    };

    const { error } = await supabase
        .from('users')
        .update({ linked_accounts: newData })
        .eq('id', req.user.id);

    if (error) throw error;

    await TelegramService.send(
        chat_id,
        'Welcome to OBS Tracker! Your Telegram account has been successfully linked.',
        bot_token
    );

    res.json({ success: true, linked_accounts: newData });
});

export const unlinkAccount = asyncHandler(async (req, res) => {
    const { platform } = req.params; // telegram

    if (!['telegram'].includes(platform)) {
        throw AppError.badRequest('Invalid platform');
    }

    const { data: user } = await supabase
        .from('users')
        .select('linked_accounts')
        .eq('id', req.user.id)
        .single();

    const existing = user?.linked_accounts || {};

    if (existing[platform]) {
        delete existing[platform];

        const { error } = await supabase
            .from('users')
            .update({ linked_accounts: existing })
            .eq('id', req.user.id);

        if (error) throw error;
    }

    res.json({ success: true, linked_accounts: existing });
});

export default { getLinkedAccounts, linkTelegram, unlinkAccount };
