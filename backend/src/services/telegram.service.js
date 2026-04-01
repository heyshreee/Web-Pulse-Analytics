const fetch = require('node-fetch');

/**
 * Telegram Notification Service
 * Handles sending messages to Telegram via Bot API
 */
class TelegramService {
    /**
     * Send a Telegram message
     * @param {string} chatId - The recipient's chat ID
     * @param {string} message - The message content
     * @param {string} [token] - Optional custom bot token
     */
    static async send(chatId, message, token = null) {
        try {
            const botToken = token || process.env.TELEGRAM_BOT_TOKEN;

            if (!botToken) {
                console.warn('[Telegram] No bot token provided, and TELEGRAM_BOT_TOKEN not set.');
                return { success: false, error: 'Configuration Error: No Bot Token' };
            }

            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });

            const data = await response.json();

            if (!data.ok) {
                console.error(`[Telegram] API Error: ${data.description}`);
                throw new Error(data.description || 'Telegram API Error');
            }

            console.log(`[Telegram] Sent message to ${chatId} using ${token ? 'custom' : 'default'} token.`);
            return { success: true, messageId: data.result.message_id };
        } catch (error) {
            console.error('[Telegram] Failed to send message:', error.message);
            // Re-throw to let controller handle it (e.g. return 500)
            throw error;
        }
    }

    /**
     * Mock verification (In real app, user would send /start to bot)
     * This helper just sends a confirmation code
     */
    static async sendVerificationCode(chatId, code) {
        const message = `Your OBS Tracker verification code is: ${code}`;
        return this.send(chatId, message);
    }
}

module.exports = TelegramService;
