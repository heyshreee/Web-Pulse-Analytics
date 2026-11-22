import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, Info, AlertTriangle, CheckCircle, AlertCircle, Shield, Activity, Settings } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeTab, setActiveTab] = useState('all');
    const dropdownRef = useRef(null);
    const { showToast, triggerNotificationSpotlight } = useToast();

    const loadNotifications = async () => {
        try {
            const data = await apiRequest('/notifications');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        }
    };

    useEffect(() => {
        loadNotifications();

        const handleNewNotification = (e) => {
            loadNotifications();
            if (e.detail) {
                showToast(e.detail.title || 'New Notification', 'info');
            }
            triggerNotificationSpotlight();
        };

        window.addEventListener('notification_received', handleNewNotification);
        const interval = setInterval(loadNotifications, 60000);

        return () => {
            clearInterval(interval);
            window.removeEventListener('notification_received', handleNewNotification);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const markAsRead = async (id) => {
        try {
            await apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            showToast('Failed to mark as read', 'error');
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiRequest('/notifications/read-all', { method: 'PUT' });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            showToast('All notifications marked as read', 'success');
        } catch (err) {
            showToast('Failed to mark all as read', 'error');
        }
    };

    const deleteNotification = async (id, e) => {
        e.stopPropagation();
        try {
            await apiRequest(`/notifications/${id}`, { method: 'DELETE' });
            setNotifications(prev => prev.filter(n => n.id !== id));
            const notification = notifications.find(n => n.id === id);
            if (notification && !notification.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            showToast('Failed to delete notification', 'error');
        }
    };

    const clearAll = async () => {
        if (notifications.length === 0) return;

        const previousNotifications = [...notifications];
        setNotifications([]);
        setUnreadCount(0);
        showToast('All notifications cleared', 'success');

        try {
            await Promise.all(previousNotifications.map(n =>
                apiRequest(`/notifications/${n.id}`, { method: 'DELETE' })
            ));
        } catch (err) {
            setNotifications(previousNotifications);
            setUnreadCount(previousNotifications.filter(n => !n.is_read).length);
            showToast('Failed to clear notifications', 'error');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />;
            case 'warning': return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
            case 'error': return <AlertCircle className="h-3.5 w-3.5 text-rose-400" />;
            case 'security': return <Shield className="h-3.5 w-3.5 text-amber-400" />;
            case 'activity': return <Activity className="h-3.5 w-3.5 text-[var(--wp-text-secondary)]" />;
            case 'system': return <Settings className="h-3.5 w-3.5 text-[var(--wp-text-secondary)]" />;
            default: return <Info className="h-3.5 w-3.5 text-[var(--wp-text-muted)]" />;
        }
    };

    const getFilteredNotifications = () => {
        if (activeTab === 'all') return notifications;
        return notifications.filter(n => n.type === activeTab);
    };

    const filteredNotifications = getFilteredNotifications();

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative h-7 w-7 rounded-md border border-[var(--wp-border-default)] bg-[var(--wp-bg-surface)] flex items-center justify-center transition-colors ${
                    isOpen
                        ? 'bg-[var(--wp-bg-active)] text-[var(--wp-text-primary)] border-[var(--wp-border-strong)]'
                        : 'text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)] hover:bg-[var(--wp-bg-hover)]'
                }`}
                aria-label="Open notifications"
            >
                <Bell className="h-3.5 w-3.5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--wp-status-live)]"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-[360px] sm:w-[400px] wp-panel bg-[var(--wp-bg-surface)] border border-[var(--wp-border-default)] rounded-lg shadow-2xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="p-3 sm:p-3.5 border-b border-[var(--wp-border-subtle)] bg-[var(--wp-bg-surface)]">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <span className="wp-title-card">Notifications</span>
                                {unreadCount > 0 && (
                                    <span className="wp-metric-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] uppercase text-[var(--wp-text-primary)]">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Close notifications"
                                className="p-1 text-[var(--wp-text-muted)] hover:text-[var(--wp-text-primary)] hover:bg-[var(--wp-bg-hover)] rounded transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <p className="text-[11px] text-[var(--wp-text-muted)]">Manage your system alerts and activity signals.</p>

                        {/* Segmented Control Filter Tabs */}
                        <div className="inline-flex items-center p-0.5 rounded-md border border-[var(--wp-border-default)] bg-[var(--wp-bg-surface)] text-xs mt-2.5 w-full justify-between">
                            {['all', 'system', 'security', 'activity'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`h-5 flex-1 rounded text-[10.5px] font-mono transition-colors capitalize ${
                                        activeTab === tab
                                            ? 'bg-[var(--wp-bg-active)] text-[var(--wp-text-primary)] font-medium'
                                            : 'text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)]'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="px-3 py-1.5 bg-[var(--wp-bg-subtle)]/30 border-b border-[var(--wp-border-subtle)] flex items-center justify-between text-[11px] font-mono">
                        <button
                            onClick={markAllAsRead}
                            className="text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)] inline-flex items-center gap-1 transition-colors"
                        >
                            <Check className="h-3 w-3" />
                            <span>Mark all read</span>
                        </button>
                        <button
                            onClick={clearAll}
                            className="text-[var(--wp-text-muted)] hover:text-rose-400 inline-flex items-center gap-1 transition-colors"
                        >
                            <Trash2 className="h-3 w-3" />
                            <span>Clear all</span>
                        </button>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[360px] overflow-y-auto divide-y divide-[var(--wp-border-subtle)]">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                                    className={`p-3 hover:bg-[var(--wp-bg-hover)] transition-colors cursor-pointer group relative ${
                                        !notification.is_read ? 'bg-[var(--wp-bg-subtle)]/30' : ''
                                    }`}
                                >
                                    <div className="flex gap-2.5">
                                        <div className="h-6 w-6 rounded border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline gap-2 mb-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`text-[10px] font-mono uppercase tracking-wider font-medium ${
                                                        notification.type === 'security' ? 'text-amber-400' :
                                                        notification.type === 'error' ? 'text-rose-400' :
                                                        notification.type === 'activity' ? 'text-[var(--wp-text-secondary)]' :
                                                        'text-emerald-400'
                                                    }`}>
                                                        {notification.type}
                                                    </span>
                                                    {!notification.is_read && (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--wp-status-live)] shrink-0" />
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-[var(--wp-text-muted)] font-mono tabular-nums">
                                                    {getTimeAgo(new Date(notification.created_at))}
                                                </span>
                                            </div>
                                            <h4 className={`text-xs font-medium mb-0.5 ${!notification.is_read ? 'text-[var(--wp-text-primary)]' : 'text-[var(--wp-text-secondary)]'}`}>
                                                {notification.title}
                                            </h4>
                                            <p className="text-[11px] text-[var(--wp-text-muted)] leading-relaxed">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Delete button (visible on hover) */}
                                    <button
                                        onClick={(e) => deleteNotification(notification.id, e)}
                                        className="absolute top-2.5 right-2.5 p-1 text-[var(--wp-text-muted)] hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove notification"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-[var(--wp-text-muted)]">
                                <Bell className="h-5 w-5 mx-auto mb-1.5 opacity-30" />
                                <p className="wp-title-card mb-0.5">Zero Signals</p>
                                <p className="text-[11px] font-mono">System status is nominal. No alerts to report.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "Y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "MO";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "D";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "H";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "M";
    return "NOW";
}