import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, Info, AlertTriangle, CheckCircle, AlertCircle, Shield, Activity, Settings, ChevronRight } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeTab, setActiveTab] = useState('all');
    const dropdownRef = useRef(null);
    const { showToast, notificationSpotlight, triggerNotificationSpotlight } = useToast();

    useEffect(() => {
        loadNotifications();

        const handleNewNotification = (e) => {
            loadNotifications();
            // Trigger spotlight effect
            if (e.detail) {
                // We could show a toast here too if desired
                showToast(e.detail.title || 'New Notification', 'info');
            }
            // Trigger visual spotlight
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

    const loadNotifications = async () => {
        try {
            const data = await apiRequest('/notifications');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        }
    };

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

        // Optimistic update
        const previousNotifications = [...notifications];
        setNotifications([]);
        setUnreadCount(0);
        showToast('All notifications cleared', 'success');

        try {
            // Delete all notifications one by one since we don't have a bulk delete endpoint yet
            await Promise.all(previousNotifications.map(n =>
                apiRequest(`/notifications/${n.id}`, { method: 'DELETE' })
            ));
        } catch (err) {
            // Revert on error
            setNotifications(previousNotifications);
            setUnreadCount(previousNotifications.filter(n => !n.is_read).length);
            showToast('Failed to clear notifications', 'error');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'security': return <Shield className="h-5 w-5 text-amber-500" />;
            case 'activity': return <Activity className="h-5 w-5 text-sky-500" />;
            case 'system': return <Settings className="h-5 w-5 text-violet-500" />;
            default: return <Info className="h-5 w-5 text-slate-500" />;
        }
    };

    const getFilteredNotifications = () => {
        if (activeTab === 'all') return notifications;
        return notifications.filter(n => n.type === activeTab);
    };

    const filteredNotifications = getFilteredNotifications();

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Backdrop Blur - Active when open or spotlighted */}
            {(isOpen || notificationSpotlight) && (
                <div
                    className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm z-40 transition-all duration-500"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2.5 rounded-xl transition-all duration-300 z-50 group
                    ${isOpen ? 'bg-slate-900 dark:bg-violet-500 text-white shadow-lg shadow-slate-900/20 dark:shadow-violet-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'}
                    ${notificationSpotlight ? 'bg-slate-900 dark:bg-violet-500 text-white ring-4 ring-violet-500/30 animate-pulse' : ''}
                `}
            >
                <Bell className={`h-5 w-5 ${notificationSpotlight ? 'animate-bounce' : 'group-hover:rotate-12 transition-transform'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-600 border-2 border-white dark:border-slate-950 shadow-sm"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-4 w-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/5 dark:ring-white/5 animate-fade-in">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="badge-violet text-[10px] font-bold uppercase tracking-wider">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="eyebrow">Manage your system alerts and signals</p>

                        {/* Tabs */}
                        <div className="flex items-center gap-1 p-1 mt-5 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
                            {['all', 'system', 'security', 'activity'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize whitespace-nowrap ${activeTab === tab
                                        ? 'bg-slate-900 dark:bg-violet-500 text-white shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <button
                            onClick={markAllAsRead}
                            className="btn-ghost btn-sm text-violet-600 dark:text-violet-400"
                        >
                            <Check className="h-3.5 w-3.5" /> Mark all read
                        </button>
                        <button
                            onClick={clearAll}
                            className="btn-ghost btn-sm text-slate-500 hover:text-red-500"
                        >
                            <Trash2 className="h-3.5 w-3.5" /> Clear all
                        </button>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[420px] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                        {filteredNotifications.length > 0 ? (
                            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {filteredNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => !notification.is_read && markAsRead(notification.id)}
                                        className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group relative ${!notification.is_read ? 'bg-violet-50/40 dark:bg-violet-500/5' : ''}`}
                                    >
                                        <div className="flex gap-3.5">
                                            <div className={`mt-0.5 flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105 duration-300 ${!notification.is_read ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60 opacity-60'}`}>
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2 mb-1">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className={`text-[10px] font-semibold uppercase tracking-widest ${notification.type === 'security' ? 'text-amber-600 dark:text-amber-400' :
                                                            notification.type === 'system' ? 'text-violet-600 dark:text-violet-400' :
                                                                notification.type === 'error' ? 'text-red-600 dark:text-red-400' :
                                                                    notification.type === 'activity' ? 'text-sky-600 dark:text-sky-400' :
                                                                        'text-emerald-600 dark:text-emerald-400'
                                                            }`}>
                                                            {notification.type}
                                                        </span>
                                                        {!notification.is_read && (
                                                            <span className="h-2 w-2 rounded-full bg-violet-500 flex-shrink-0"></span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tabular-nums flex-shrink-0">
                                                        {getTimeAgo(new Date(notification.created_at))}
                                                    </span>
                                                </div>
                                                <h4 className={`text-sm font-semibold mb-0.5 tracking-tight leading-tight transition-colors ${!notification.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                    {notification.title}
                                                </h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                                    {notification.message}
                                                </p>

                                                {/* Action Link (Example) */}
                                                {notification.type === 'usage' && (
                                                    <button className="mt-2 text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1 uppercase tracking-widest transition-colors">
                                                        Upgrade Analytics Hub <ChevronRight className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Delete button (visible on hover) */}
                                        <button
                                            onClick={(e) => deleteNotification(notification.id, e)}
                                            className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0"
                                            title="Remove signal"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 px-8 text-center">
                                <Bell className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Zero Signals</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[220px] mx-auto leading-relaxed">System status is nominal. No urgent signals to report.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                        <button className="btn-secondary btn-sm w-full">
                            Telemetric Pipeline History <ChevronRight className="h-3.5 w-3.5" />
                        </button>
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