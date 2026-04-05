import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, Info, AlertTriangle, CheckCircle, AlertCircle, Shield, Activity, Settings, ChevronRight } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeTab, setActiveTab] = useState('all');
    const dropdownRef = useRef(null);
    const { showToast, notificationSpotlight, triggerNotificationSpotlight } = useToast();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

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
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'security': return <Shield className="h-5 w-5 text-orange-500" />;
            case 'activity': return <Activity className="h-5 w-5 text-blue-500" />;
            case 'system': return <Settings className="h-5 w-5 text-purple-500" />;
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
                    className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm z-40 transition-all duration-500 animate-in fade-in"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2.5 rounded-xl transition-all duration-300 z-50 group
                    ${isOpen ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 ring-2 ring-blue-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'}
                    ${notificationSpotlight ? 'bg-blue-500 text-white ring-4 ring-blue-500/40 animate-pulse' : ''}
                `}
            >
                <Bell className={`h-5 w-5 ${notificationSpotlight ? 'animate-bounce' : 'group-hover:rotate-12 transition-transform'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border-2 border-white dark:border-slate-950 shadow-sm"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-4 w-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/5 dark:ring-white/5 animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tighter uppercase">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-500 text-[10px] font-black border border-red-500/20 tracking-widest uppercase">
                                        {unreadCount} NEW
                                    </span>
                                )}
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Manage your system alerts and signals</p>

                        {/* Tabs */}
                        <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar pb-1">
                            {['all', 'system', 'security', 'activity'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all capitalize tracking-[0.15em] whitespace-nowrap border ${activeTab === tab
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="px-6 py-3 bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <button
                            onClick={markAllAsRead}
                            className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 uppercase tracking-widest transition-colors"
                        >
                            <Check className="h-3 w-3" /> Mark all read
                        </button>
                        <button
                            onClick={clearAll}
                            className="text-[10px] font-black text-slate-500 hover:text-red-500 flex items-center gap-2 uppercase tracking-widest transition-colors"
                        >
                            <Trash2 className="h-3 w-3" /> Clear all
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
                                        className={`p-6 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all cursor-pointer group relative ${!notification.is_read ? 'bg-blue-50/30 dark:bg-blue-500/5' : ''}`}
                                    >
                                        <div className="flex gap-5">
                                            <div className={`mt-1 flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-105 duration-300 ${!notification.is_read ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800/50 opacity-60'}`}>
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2 mb-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${notification.type === 'security' ? 'text-orange-500' :
                                                            notification.type === 'system' ? 'text-purple-500' :
                                                                notification.type === 'error' ? 'text-red-500' :
                                                                    notification.type === 'activity' ? 'text-blue-500' :
                                                                        'text-emerald-500'
                                                            }`}>
                                                            {notification.type}
                                                        </span>
                                                        {!notification.is_read && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-500 font-bold tabular-nums">
                                                        {getTimeAgo(new Date(notification.created_at))}
                                                    </span>
                                                </div>
                                                <h4 className={`text-sm font-black mb-1 tracking-tight leading-tight transition-colors ${!notification.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                    {notification.title}
                                                </h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-500 font-medium leading-relaxed mt-1">
                                                    {notification.message}
                                                </p>

                                                {/* Action Link (Example) */}
                                                {notification.type === 'usage' && (
                                                    <button className="mt-4 text-[10px] font-black text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2 uppercase tracking-widest transition-all">
                                                        Upgrade Analytics Hub <ChevronRight className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Delete button (visible on hover) */}
                                        <button
                                            onClick={(e) => deleteNotification(notification.id, e)}
                                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0"
                                            title="Remove signal"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 px-8 text-center bg-white dark:bg-slate-900">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-100 dark:border-slate-800/50 opacity-40">
                                    <Bell className="h-8 w-8 text-slate-400 dark:text-slate-600" />
                                </div>
                                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tighter">Zero Signals</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-500 font-medium max-w-[200px] mx-auto leading-relaxed">System status is nominal. No urgent signals to report.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-xl">
                        <button className="w-full py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-sm">
                            Telemetric Pipeline History <ChevronRight className="h-3 w-3" />
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
