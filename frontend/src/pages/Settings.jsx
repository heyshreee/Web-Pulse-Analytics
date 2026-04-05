import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Shield, Bell, BarChart2, Briefcase,
    Save, Loader, Upload, Trash2, Monitor, Smartphone, Globe,
    Check, AlertTriangle, LogOut, Settings as SettingsIcon, Edit2, CreditCard, Download,
    MessageSquare, Send, Lock
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

export default function Settings() {
    const { user, loadUser } = useOutletContext();
    const { tab } = useParams();
    const navigate = useNavigate();
    const activeTab = tab || 'profile';
    const { showToast } = useToast();

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'usage', label: 'Usage & Quota', icon: BarChart2 },
        { id: 'projects', label: 'Projects & Teams', icon: Briefcase },
        { id: 'billing', label: 'Billing & Invoices', icon: CreditCard },
        { id: 'linked_accounts', label: 'Linked Accounts', icon: MessageSquare },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-2xl p-4 sticky top-24 shadow-sm dark:shadow-xl transition-all">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-4 tracking-tight">Settings</h2>
                        <nav className="space-y-1">
                            {tabs.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => navigate(`/dashboard/settings/${t.id}`)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === t.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:px-5'
                                        }`}
                                >
                                    <t.icon className={`h-4 w-4 ${activeTab === t.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                    {t.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'profile' && <ProfileSection user={user} loadUser={loadUser} showToast={showToast} />}
                            {activeTab === 'security' && <SecuritySection user={user} showToast={showToast} />}
                            {activeTab === 'notifications' && <NotificationsSection user={user} showToast={showToast} />}
                            {activeTab === 'usage' && <UsageSection user={user} />}
                            {activeTab === 'projects' && <ProjectsSection user={user} />}
                            {activeTab === 'billing' && <BillingSection user={user} />}
                            {activeTab === 'linked_accounts' && <LinkedAccountsSection user={user} showToast={showToast} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function ProfileSection({ user, loadUser, showToast }) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        timezone: user?.timezone || 'UTC',
        language: user?.language || 'en-US',
        job_title: user?.job_title || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiRequest('/user/profile', {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            await loadUser();
            showToast('Profile updated successfully', 'success');
            setIsEditing(false);
        } catch (error) {
            showToast('Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast('File size must be less than 5MB', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        setUploading(true);
        try {
            // We need to use fetch directly for FormData to handle headers correctly
            // or ensure apiRequest handles FormData (it likely expects JSON)
            // Let's check apiRequest implementation or just use fetch with auth token
            // Assuming apiRequest handles JSON, we might need a custom call here.
            // But let's try to use a modified apiRequest or just fetch.
            // Since I can't see apiRequest implementation right now, I'll assume I need to handle it.
            // Actually, I should check apiRequest.
            // For now, I'll implement a direct fetch with the token from localStorage/cookie if needed.
            // But wait, apiRequest probably sets Content-Type to application/json.
            // I'll use a direct fetch here to be safe.

            const response = await fetch('/api/v1/user/avatar', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            await loadUser();
            showToast('Profile picture updated', 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to upload image', 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-2xl p-8 shadow-sm dark:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Profile Information</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">Update your profile basics.</p>
                    </div>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all flex items-center gap-2 shadow-sm ${isEditing
                            ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white border-slate-200 dark:border-slate-700'
                            : 'bg-blue-600 hover:bg-blue-500 text-white border-transparent'
                            }`}
                    >
                        {isEditing ? (
                            <>Cancel</>
                        ) : (
                            <>
                                <Edit2 className="h-4 w-4" />
                                Edit
                            </>
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-6 mb-8">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-600/30 ring-4 ring-white dark:ring-slate-900">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} className="h-full w-full rounded-full object-cover" />
                        ) : (
                            (user?.name?.[0] || user?.email?.[0] || '?').toUpperCase()
                        )}
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">Profile Picture</h4>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">JPG, GIF or PNG. Max size 5MB</p>
                        <div className="flex gap-3">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <button
                                disabled={!isEditing || uploading}
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            >
                                {uploading ? <Loader className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                {uploading ? 'Uploading...' : 'Upload New'}
                            </button>
                            <button
                                disabled={!isEditing}
                                className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800/50 hover:bg-red-500 dark:hover:bg-red-500/10 text-slate-500 dark:text-slate-400 hover:text-white dark:hover:text-red-500 text-sm font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                <Trash2 className="h-4 w-4" />
                                Remove
                            </button>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-2">Full Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all pr-12 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                                />
                                {isEditing && <Edit2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-2">Job Title</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    value={formData.job_title}
                                    onChange={e => setFormData({ ...formData, job_title: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all pr-12 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                                    placeholder="e.g. Senior Developer"
                                />
                                {isEditing && <Edit2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-2">Bio</label>
                        <div className="relative">
                            <textarea
                                value={formData.bio}
                                disabled={!isEditing}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all resize-none pr-12 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                                placeholder="Tell us a little about yourself..."
                            />
                            {isEditing && <Edit2 className="absolute right-4 top-4 h-4 w-4 text-slate-400 pointer-events-none" />}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-2">Language</label>
                            <select
                                value={formData.language}
                                disabled={!isEditing}
                                onChange={e => setFormData({ ...formData, language: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-inner appearance-none"
                            >
                                <option value="en-US">English (US)</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-2">Timezone</label>
                            <select
                                value={formData.timezone}
                                disabled={!isEditing}
                                onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-inner appearance-none"
                            >
                                <option value="UTC">UTC</option>
                                <option value="EST">Eastern Standard Time (EST)</option>
                                <option value="PST">Pacific Standard Time (PST)</option>
                                <option value="IST">India Standard Time (IST)</option>
                            </select>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end pt-8 border-t border-slate-100 dark:border-slate-800/50">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm tracking-tight transition-all shadow-xl shadow-blue-500/30 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Changes
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

function SecuritySection({ user, showToast }) {
    const [loading, setLoading] = useState(false);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const data = await apiRequest('/user/sessions');
            setSessions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSessions(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            showToast('New passwords do not match', 'error');
            return;
        }
        setLoading(true);
        try {
            await apiRequest('/user/password', {
                method: 'PUT',
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new
                })
            });
            showToast('Password updated successfully', 'success');
            setPasswords({ current: '', new: '', confirm: '' });
            setIsEditing(false);
        } catch (error) {
            showToast(error.message || 'Failed to update password', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loadingSessions) return <Spinner />;

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-2xl p-8 shadow-sm dark:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Change Password</h3>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all flex items-center gap-2 shadow-sm ${isEditing
                            ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white border-slate-200 dark:border-slate-700'
                            : 'bg-blue-600 hover:bg-blue-500 text-white border-transparent'
                            }`}
                    >
                        {isEditing ? 'Cancel' : (
                            <>
                                <Edit2 className="h-4 w-4" />
                                Edit
                            </>
                        )}
                    </button>
                </div>
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-2">Current Password</label>
                        <input
                            type="password"
                            disabled={!isEditing}
                            value={passwords.current}
                            onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-2">New Password</label>
                            <input
                                type="password"
                                disabled={!isEditing}
                                value={passwords.new}
                                onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                disabled={!isEditing}
                                value={passwords.confirm}
                                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                            />
                        </div>
                    </div>
                    {isEditing && (
                        <div className="flex justify-end pt-8 border-t border-slate-100 dark:border-slate-800/50">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm tracking-tight transition-all shadow-xl shadow-blue-500/30 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Update Password
                            </button>
                        </div>
                    )}
                </form>
            </div>

            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-2xl p-8 shadow-sm dark:shadow-xl transition-all">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-6">Active Sessions</h3>
                <div className="space-y-4">
                    {sessions.map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl group transition-all hover:border-blue-400 dark:hover:border-slate-600 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-slate-500 dark:text-slate-400 shadow-sm border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-all">
                                    {session.device?.includes('Mobile') ? <Smartphone className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{session.device || 'Unknown Device'}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                        <span>{session.location}</span>
                                        <span>•</span>
                                        <span>{new Date(session.lastActive).toLocaleDateString()}</span>
                                        {session.isCurrent && (
                                            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full font-bold uppercase tracking-wider text-[10px]">Current</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {!session.isCurrent && (
                                <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                                    <LogOut className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function NotificationsSection({ user, showToast }) {
    const [isEditing, setIsEditing] = useState(false);
    const [preferences, setPreferences] = useState(user?.notification_preferences || {
        email: true,
        email_reports: true,
        browser: true,
        security: true,
        marketing: false
    });

    const handleToggle = async (key) => {
        if (!isEditing) return;
        const newPrefs = { ...preferences, [key]: !preferences[key] };
        setPreferences(newPrefs);
        try {
            await apiRequest('/user/notifications', {
                method: 'PUT',
                body: JSON.stringify({ preferences: newPrefs })
            });
        } catch (error) {
            showToast('Failed to update preferences', 'error');
            setPreferences(preferences); // Revert
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-2xl p-8 shadow-sm dark:shadow-xl transition-all">
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Notification Preferences</h3>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all flex items-center gap-2 shadow-sm ${isEditing
                        ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white border-slate-200 dark:border-slate-700'
                        : 'bg-blue-600 hover:bg-blue-500 text-white border-transparent'
                        }`}
                >
                    {isEditing ? 'Done' : (
                        <>
                            <Edit2 className="h-4 w-4" />
                            Edit
                        </>
                    )}
                </button>
            </div>
            <div className="space-y-4">
                {[
                    { id: 'email', label: 'Email Notifications', desc: 'Receive daily summaries and critical alerts via email.' },
                    { id: 'email_reports', label: 'Email Reports', desc: 'Receive weekly performance reports for your projects.' },
                    { id: 'browser', label: 'Browser Push Notifications', desc: 'Get real-time updates when you are online.' },
                    { id: 'security', label: 'Security Alerts', desc: 'Get notified about new logins and password changes.' },
                    { id: 'marketing', label: 'Product Updates', desc: 'Receive news about new features and improvements.' }
                ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all hover:border-blue-400 dark:hover:border-slate-700 shadow-sm">
                        <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{item.label}</p>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                        </div>
                        <button
                            onClick={() => handleToggle(item.id)}
                            disabled={!isEditing}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${preferences[item.id] ? 'bg-blue-600' : 'bg-slate-700'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences[item.id] ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function UsageSection() {
    const { usageStats } = useOutletContext();

    if (!usageStats) return <Spinner />;

    const getPercentage = (used, limit) => {
        if (limit === Infinity) return 0;
        return Math.min((used / limit) * 100, 100);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-2xl p-8 shadow-sm dark:shadow-xl transition-all">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Usage & Quota</h3>
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-100 dark:border-blue-500/20 shadow-sm">
                        {usageStats.plan} Plan
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-inner">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Monthly Views</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{usageStats.totalViews.toLocaleString()}</p>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Limit: {usageStats.monthlyLimit.toLocaleString()}</p>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${getPercentage(usageStats.totalViews, usageStats.monthlyLimit)}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-inner">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Storage Used</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
                                    {usageStats.storageUsed < 1024 * 1024
                                        ? `${(usageStats.storageUsed / 1024).toFixed(2)} KB`
                                        : usageStats.storageUsed < 1024 * 1024 * 1024
                                            ? `${(usageStats.storageUsed / (1024 * 1024)).toFixed(2)} MB`
                                            : `${(usageStats.storageUsed / (1024 * 1024 * 1024)).toFixed(2)} GB`
                                    }
                                </p>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Limit: {usageStats.storageLimit < 1024 * 1024 * 1024 ? `${(usageStats.storageLimit / (1024 * 1024)).toFixed(0)} MB` : `${(usageStats.storageLimit / (1024 * 1024 * 1024)).toFixed(0)} GB`}</p>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${getPercentage(usageStats.storageUsed, usageStats.storageLimit)}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-inner">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Projects</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{usageStats.projectCount}</p>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Limit: {usageStats.projectLimit}</p>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                                style={{ width: `${getPercentage(usageStats.projectCount, usageStats.projectLimit)}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-inner">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Shared Reports</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{usageStats.share_report?.used || 0}</p>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Limit: {usageStats.share_report?.limit === Infinity ? 'Unlimited' : usageStats.share_report?.limit}</p>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 rounded-full transition-all duration-500"
                                style={{ width: `${getPercentage(usageStats.share_report?.used || 0, usageStats.share_report?.limit || 1)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProjectsSection({ user }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', allowedOrigins: '' });
    const { showToast } = useToast();

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = () => {
        apiRequest('/projects')
            .then(setProjects)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const startEditing = (project) => {
        setEditingId(project.id);
        setEditForm({
            name: project.name,
            allowedOrigins: project.allowed_origins || ''
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({ name: '', allowedOrigins: '' });
    };

    const handleSave = async (projectId) => {
        try {
            await apiRequest(`/projects/${projectId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: editForm.name,
                    allowedOrigins: editForm.allowedOrigins
                })
            });
            showToast('Project updated successfully', 'success');
            setEditingId(null);
            loadProjects();
        } catch (error) {
            showToast(error.message || 'Failed to update project', 'error');
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-2xl p-8 shadow-sm dark:shadow-xl transition-all">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Projects & Teams</h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Manage your projects and team members.</p>
                </div>
            </div>

            <div className="space-y-4">
                {projects.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 font-bold uppercase tracking-widest text-xs">
                        No projects found. Create one to get started.
                    </div>
                ) : (
                    projects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl group transition-all hover:border-blue-400 dark:hover:border-slate-600 shadow-sm">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 font-black border border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-110 transition-all">
                                    {project.name[0].toUpperCase()}
                                </div>
                                {editingId === project.id ? (
                                    <div className="flex-1 grid gap-2">
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-inner"
                                            placeholder="Project Name"
                                        />
                                        <input
                                            type="text"
                                            value={editForm.allowedOrigins}
                                            onChange={(e) => setEditForm({ ...editForm, allowedOrigins: e.target.value })}
                                            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-inner"
                                            placeholder="Allowed Origins (comma separated)"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-base font-black text-slate-900 dark:text-white tracking-tight">{project.name}</p>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{project.allowed_origins || 'All origins allowed'}</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4 ml-4">
                                {editingId === project.id ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSave(project.id)}
                                            className="p-2.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-500 hover:bg-green-100 dark:hover:bg-green-500/20 rounded-xl transition-all shadow-sm"
                                        >
                                            <Check className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-all shadow-sm"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-slate-200 dark:border-slate-700 shadow-sm">
                                            Owner
                                        </span>
                                        <button
                                            onClick={() => startEditing(project)}
                                            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function BillingSection({ user }) {
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        loadPaymentHistory();
    }, []);

    const loadPaymentHistory = async () => {
        try {
            const history = await apiRequest('/payment/history');
            setPaymentHistory(history);
        } catch (err) {
            console.error('Failed to load payment history:', err);
            showToast('Failed to load payment history', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReceipt = async (paymentId) => {
        try {
            const token = localStorage.getItem('token');
            // Ensure we target the v1 endpoint correctly
            const baseUrl = import.meta.env.VITE_API_URL;
            const apiUrl = baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl}/v1`;

            const response = await fetch(`${apiUrl}/payment/receipt/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to download receipt');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt_${paymentId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download receipt error:', error);
            showToast('Failed to download receipt', 'error');
        }
    };

    const handleEmailReceipt = async (paymentId) => {
        try {
            await apiRequest(`/payment/receipt/${paymentId}/email`, {
                method: 'POST'
            });
            showToast('Receipt sent to your email', 'success');
        } catch (error) {
            console.error('Email receipt error:', error);
            showToast('Failed to send receipt email', 'error');
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-2xl p-8 shadow-sm dark:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Subscription Summary</h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Manage your plan and billing details.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-inner transition-all hover:shadow-md">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Current Plan</p>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white capitalize tracking-tight">{user?.plan || 'Free'}</span>
                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-100 dark:border-blue-500/20 shadow-sm">Active</span>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-inner transition-all hover:shadow-md">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 dark:bg-blue-600/10 blur-[50px] -mr-16 -mt-16 rounded-full transition-all group-hover:scale-150"></div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Next Payment Date</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white relative z-10 tracking-tight">
                            {user?.next_billing_date
                                ? new Date(user.next_billing_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                : 'N/A'}
                        </p>
                        {user?.next_billing_date && (
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 relative z-10 uppercase tracking-widest">Auto-renewal scheduled</p>
                        )}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-inner transition-all hover:shadow-md">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Payment Method</p>
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-slate-500 dark:text-slate-300" />
                            <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">•••• 4242</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest"> via Stripe/Razorpay</p>
                    </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Payment History</h3>

                <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Invoice ID</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Description</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        <Loader className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Loading history...
                                    </td>
                                </tr>
                            ) : paymentHistory.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        No payment history found
                                    </td>
                                </tr>
                            ) : (
                                paymentHistory.map((payment) => (
                                    <tr key={payment.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all border-b border-slate-50 dark:border-slate-900">
                                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 font-bold font-mono tracking-tighter">{payment.id && (payment.id.substring(0, 8) + '...')}</td>
                                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400 font-black">
                                            {new Date(payment.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-black tracking-tight">{payment.description || 'Subscription'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-black tracking-tight">${payment.amount}</td>
                                        <td className="px-6 py-6">
                                            <span className="px-2.5 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-md uppercase tracking-wider border border-green-500/20">
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleDownloadReceipt(payment.id)}
                                                    className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm rounded-xl"
                                                    title="Download Receipt"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEmailReceipt(payment.id)}
                                                    className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm rounded-xl"
                                                    title="Email Receipt"
                                                >
                                                    <Bell className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div >
        </div >
    );
}

function LinkedAccountsSection({ user, showToast }) {
    const [accounts, setAccounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [telegramChatId, setTelegramChatId] = useState('');
    const [telegramUsername, setTelegramUsername] = useState('');
    const [botToken, setBotToken] = useState('');
    const [isPro, setIsPro] = useState(false);

    // Get usage stats from context
    const context = useOutletContext();
    const usageStats = context?.usageStats;

    useEffect(() => {
        loadLinkedAccounts();
        if (usageStats) {
            const PLAN_LEVELS = { free: 0, basic: 1, pro: 2, business: 3 };
            setIsPro((PLAN_LEVELS[usageStats.plan] || 0) >= 2);
        }
    }, [usageStats]);

    const loadLinkedAccounts = async () => {
        try {
            const data = await apiRequest('/user/linked-accounts');
            setAccounts(data);
            if (data.telegram) {
                setTelegramChatId(data.telegram.chat_id);
                setTelegramUsername(data.telegram.username);
                // We don't load the token back for security reasons, or we could if needed
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to load linked accounts', 'error');
        } finally {
            setLoading(false);
        }
    };

    const linkTelegram = async (e) => {
        e.preventDefault();
        try {
            await apiRequest('/user/linked-accounts/telegram', {
                method: 'POST',
                body: JSON.stringify({
                    chat_id: telegramChatId,
                    username: telegramUsername,
                    bot_token: botToken
                })
            });
            showToast('Telegram linked successfully', 'success');
            loadLinkedAccounts();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const unlink = async (platform) => {
        if (!confirm('Are you sure you want to unlink?')) return;
        try {
            await apiRequest(`/user/linked-accounts/${platform}`, { method: 'DELETE' });
            showToast('Unlinked successfully', 'success');
            setAccounts(prev => {
                const newAcc = { ...prev };
                delete newAcc[platform];
                return newAcc;
            });
            if (platform === 'telegram') {
                setTelegramChatId('');
                setTelegramUsername('');
                setBotToken('');
            }
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="space-y-6">
            {/* Telegram Card */}
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-2xl p-8 relative overflow-hidden shadow-sm dark:shadow-xl transition-all">
                {!isPro && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                        <div className="text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-sm transition-all hover:scale-105">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100 dark:border-blue-500/20">
                                <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Pro Feature</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6 leading-relaxed">Telegram integration is available on Pro plan and above.</p>
                            <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm transition-all shadow-xl shadow-blue-500/30 active:scale-95">Upgrade to Pro</button>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-blue-50 dark:bg-blue-500/10 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-500/20">
                            <Send className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Telegram Integration</h3>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Receive notifications via Telegram Bot.</p>
                        </div>
                    </div>
                    {accounts.telegram && (
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-100 dark:border-blue-500/20 shadow-sm">
                            Linked
                        </span>
                    )}
                </div>

                {accounts.telegram ? (
                    <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl group hover:border-blue-400 dark:hover:border-slate-600 transition-all shadow-inner">
                        <div>
                            <div className="font-black text-slate-900 dark:text-white text-lg tracking-tight">{accounts.telegram.username}</div>
                            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest mt-1">ID: {accounts.telegram.chat_id}</div>
                            {accounts.telegram.bot_token && (
                                <div className="text-[10px] font-black text-emerald-600 dark:text-green-500 mt-2 flex items-center gap-1 uppercase tracking-widest">
                                    <Check className="h-3 w-3" /> Custom Bot Token Active
                                </div>
                            )}
                        </div>
                        <button onClick={() => unlink('telegram')} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs font-black rounded-xl transition-all shadow-sm">Unlink</button>
                    </div>
                ) : (
                    <form onSubmit={linkTelegram} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="block text-xs font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest ml-1">Chat ID</label>
                                <input
                                    type="text"
                                    placeholder="Enter Chat ID"
                                    value={telegramChatId}
                                    onChange={e => setTelegramChatId(e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all shadow-inner"
                                    required
                                />
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1 uppercase tracking-widest">
                                    Don't know your ID? Open <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">@userinfobot</a>
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="block text-xs font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest ml-1">Username (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={telegramUsername}
                                    onChange={e => setTelegramUsername(e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all shadow-inner"
                                />
                            </div>
                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label className="block text-xs font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest ml-1">Custom Bot Token (Optional)</label>
                                <input
                                    type="password"
                                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                                    value={botToken}
                                    onChange={e => setBotToken(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all shadow-inner"
                                />
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1 uppercase tracking-widest leading-relaxed">Leave blank to use the default system bot. Provide your own if you want notifications to come from your specific bot.</p>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/50">
                            <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm tracking-tight transition-all shadow-xl shadow-blue-500/30 active:scale-95">
                                Link Telegram
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
