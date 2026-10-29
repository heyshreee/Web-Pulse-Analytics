import NotificationService from '../services/notification.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await NotificationService.getAll(req.user.id);
    res.json(notifications);
});

export const markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const notification = await NotificationService.markAsRead(id, req.user.id);
    res.json(notification);
});

export const markAllAsRead = asyncHandler(async (req, res) => {
    await NotificationService.markAllAsRead(req.user.id);
    res.json({ success: true });
});

export const deleteNotification = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await NotificationService.delete(id, req.user.id);
    res.json({ success: true });
});

export default { getNotifications, markAsRead, markAllAsRead, deleteNotification };
