import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import {
    User, Shield, Bell, BarChart2, Briefcase,
    Save, Loader, Upload, Trash2, Monitor, Smartphone,
    Check, Edit2, CreditCard, Download,
    MessageSquare, Send, Lock, X
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { formatINR, getPlanById } from '../data/plans';

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
        <div className="space-y-3 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <div>
                    <h1 className="wp-title-page">Account Settings</h1>
                    <p className="text-[11.5px] text-[var(--wp-text-muted)] mt-0.5">
                        Manage your profile, security, and workspace preferences.
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-start">
                {/* Control Rail / Sidebar */}
                <div className="w-full md:w-52 flex-shrink-0">
                    <div className="wp-panel p-1.5 space-y-0.5 sticky top-20 bg-[var(--wp-bg-surface)]">
                        <div className="px-2.5 py-1 wp-label-section uppercase">
                            Preferences
                        </div>
                        <nav className="space-y-0.5">
                            {tabs.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => navigate(`/dashboard/settings/${t.id}`)}
                                    className={`flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs transition-colors ${
                                        activeTab === t.id
                                            ? 'bg-[var(--wp-bg-active)] text-[var(--wp-text-primary)] font-medium border border-[var(--wp-border-default)]'
                                            : 'text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)] hover:bg-[var(--wp-bg-hover)]'
                                    }`}
                                >
                                    <t.icon className={`h-3.5 w-3.5 ${activeTab === t.id ? 'text-[var(--wp-text-primary)]' : 'text-[var(--wp-text-muted)]'}`} />
                                    <span>{t.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    {activeTab === 'profile' && <ProfileSection user={user} loadUser={loadUser} showToast={showToast} />}
                    {activeTab === 'security' && <SecuritySection showToast={showToast} />}
                    {activeTab === 'notifications' && <NotificationsSection user={user} showToast={showToast} />}
                    {activeTab === 'usage' && <UsageSection />}
                    {activeTab === 'projects' && <ProjectsSection />}
                    {activeTab === 'billing' && <BillingSection user={user} />}
                    {activeTab === 'linked_accounts' && <LinkedAccountsSection showToast={showToast} />}
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

        const data = new FormData();
        data.append('avatar', file);

        setUploading(true);
        try {
            const response = await fetch('/api/v1/user/avatar', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: data
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
        <div className="space-y-3">
            <div className="wp-panel bg-[var(--wp-bg-surface)]">
                <div className="wp-panel-header">
                    <span className="wp-title-card">Profile Information</span>
                    <button
                        type="button"
                        onClick={() => setIsEditing(!isEditing)}
                        className="wp-btn wp-btn-secondary h-7 px-2.5 text-xs inline-flex items-center gap-1.5"
                    >
                        {isEditing ? (
                            <>
                                <X className="h-3 w-3" />
                                <span>Cancel</span>
                            </>
                        ) : (
                            <>
                                <Edit2 className="h-3 w-3" />
                                <span>Edit</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="p-3.5 sm:p-4 space-y-4">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[var(--wp-border-default)] bg-[var(--wp-bg-subtle)] text-base font-bold text-[var(--wp-text-primary)] font-mono shrink-0">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                (user?.name?.[0] || user?.email?.[0] || '?').toUpperCase()
                            )}
                        </div>
                        <div>
                            <span className="wp-label-section uppercase block mb-0.5">Avatar Image</span>
                            <p className="text-[11px] text-[var(--wp-text-muted)] font-mono mb-2">JPG, GIF or PNG. Max size 5MB</p>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                <button
                                    type="button"
                                    disabled={!isEditing || uploading}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="wp-btn wp-btn-secondary h-6 px-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {uploading ? <Loader className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                                    <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                                </button>
                                <button
                                    type="button"
                                    disabled={!isEditing}
                                    className="wp-btn wp-btn-secondary h-6 px-2 text-xs inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 hover:border-rose-500/40 disabled:opacity-50"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    <span>Remove</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-[var(--wp-border-subtle)]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="wp-label-section uppercase block mb-1">Full Name</label>
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-8 px-2.5 text-xs font-mono rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] text-[var(--wp-text-primary)] focus:border-[var(--wp-border-strong)] focus:outline-none disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="wp-label-section uppercase block mb-1">Job Title</label>
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    value={formData.job_title}
                                    onChange={e => setFormData({ ...formData, job_title: e.target.value })}
                                    className="w-full h-8 px-2.5 text-xs font-mono rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] text-[var(--wp-text-primary)] focus:border-[var(--wp-border-strong)] focus:outline-none disabled:opacity-50"
                                    placeholder="e.g. Senior Developer"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="wp-label-section uppercase block mb-1">Bio</label>
                            <textarea
                                value={formData.bio}
                                disabled={!isEditing}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                rows={3}
                                className="w-full p-2.5 text-xs font-mono rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] text-[var(--wp-text-primary)] focus:border-[var(--wp-border-strong)] focus:outline-none disabled:opacity-50 resize-none"
                                placeholder="Tell us a little about yourself..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="wp-label-section uppercase block mb-1">Language</label>
                                <select
                                    value={formData.language}
                                    disabled={!isEditing}
                                    onChange={e => setFormData({ ...formData, language: e.target.value })}
                                    className="w-full h-8 px-2.5 text-xs font-mono rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] text-[var(--wp-text-primary)] focus:border-[var(--wp-border-strong)] focus:outline-none disabled:opacity-50"
                                >
                                    <option value="en-US">English (US)</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                </select>
                            </div>
                            <div>
                                <label className="wp-label-section uppercase block mb-1">Timezone</label>
                                <select
                                    value={formData.timezone}
                                    disabled={!isEditing}
                                    onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                                    className="w-full h-8 px-2.5 text-xs font-mono rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] text-[var(--wp-text-primary)] focus:border-[var(--wp-border-strong)] focus:outline-none disabled:opacity-50"
                                >
                                    <option value="UTC">UTC</option>
                                    <option value="EST">Eastern Standard Time (EST)</option>
                                    <option value="PST">Pacific Standard Time (PST)</option>
                                    <option value="IST">India Standard Time (IST)</option>
                                </select>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex justify-end pt-3 border-t border-[var(--wp-border-subtle)]">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="wp-btn wp-btn-primary h-7 px-3 text-xs inline-flex items-center gap-1.5"
                                >
                                    {loading ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                    <span>Save Changes</span>
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

function SecuritySection({ showToast }) {
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

    const handleRevokeSession = async (sessionId) => {
        try {
            await apiRequest(`/user/sessions/${sessionId}`, { method: 'DELETE' });
            showToast('Session revoked', 'success');
            await loadSessions();
        } catch (error) {
            showToast(error.message || 'Failed to revoke session', 'error');
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

    if (loadingSessions) {
        return (
            <div className="space-y-3 animate-pulse">
                <div className="wp-panel bg-[var(--wp-bg-surface)] p-4 space-y-3">
                    <div className="h-4 w-32 bg-[var(--wp-border-subtle)] rounded" />
                    <div className="h-8 w-full bg-[var(--wp-bg-subtle)] rounded" />
                </div>
                <div className="wp-panel bg-[var(--wp-bg-surface)] p-4 space-y-2">
                    <div className="h-4 w-28 bg-[var(--wp-border-subtle)] rounded" />
                    {[1, 2].map((n) => (
                        <div key={n} className="h-10 bg-[var(--wp-bg-subtle)] rounded" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="wp-panel bg-[var(--wp-bg-surface)]">
                <div className="wp-panel-header">
                    <span className="wp-title-card">Change Password</span>
                    <button
                        type="button"
                        onClick={() => setIsEditing(!isEditing)}
                        className="wp-btn wp-btn-secondary h-7 px-2.5 text-xs inline-flex items-center gap-1.5"
                    >
                        {isEditing ? (
                            <>
                                <X className="h-3 w-3" />
                                <span>Cancel</span>
                            </>
                        ) : (
                            <>
                                <Edit2 className="h-3 w-3" />
                                <span>Edit</span>
                            </>
                        )}
                    </button>
                </div>
                <div className="p-3.5 sm:p-4">
                    <form onSubmit={handlePasswordUpdate} className="space-y-3">
                        <div>
                            <label className="wp-label-section uppercase block mb-1">Current Password</label>
                            <input
                                type="password"
                                disabled={!isEditing}
                                value={passwords.current}
                                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                className="w-full h-8 px-2.5 text-xs font-mono rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] text-[var(--wp-text-primary)] focus:border-[var(--wp-border-strong)] focus:outline-none disabled:opacity-50"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="wp-label-section uppercase block mb-1">New Password</label>
                                <input
                                    type="password"
                                    disabled={!isEditing}
                                    value={passwords.new}
                                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                    className="w-full h-8 px-2.5 text-xs font-mono rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] text-[var(--wp-text-primary)] focus:border-[var(--wp-border-strong)] focus:outline-none disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="wp-label-section uppercase block mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    disabled={!isEditing}
                                    value={passwords.confirm}
                                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                    className="w-full h-8 px-2.5 text-xs font-mono rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] text-[var(--wp-text-primary)] focus:border-[var(--wp-border-strong)] focus:outline-none disabled:opacity-50"
                                />
                            </div>
                        </div>
                        {isEditing && (
                            <div className="flex justify-end pt-3 border-t border-[var(--wp-border-subtle)]">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="wp-btn wp-btn-primary h-7 px-3 text-xs inline-flex items-center gap-1.5"
                                >
                                    {loading ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                    <span>Update Password</span>
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <div className="wp-panel bg-[var(--wp-bg-surface)]">
                <div className="wp-panel-header">
                    <span className="wp-title-card">Active Sessions</span>
                    <span className="wp-metric-mono text-[10.5px] text-[var(--wp-text-muted)]">
                        {sessions.length} registered
                    </span>
                </div>
                <div className="p-3.5 sm:p-4 space-y-2">
                    {sessions.map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-2.5 border border-[var(--wp-border-subtle)] rounded bg-[var(--wp-bg-surface)]">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-subtle)] text-[var(--wp-text-muted)]">
                                    {session.device?.includes('Mobile') ? <Smartphone className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-[var(--wp-text-primary)]">{session.device || 'Unknown Device'}</p>
                                    <div className="flex items-center gap-2 text-[11px] text-[var(--wp-text-muted)] mt-0.5 font-mono">
                                        <span>{session.location}</span>
                                        <span>•</span>
                                        <span>{new Date(session.lastActive).toLocaleDateString()}</span>
                                        {session.isCurrent && (
                                            <span className="text-emerald-400 font-mono text-[10.5px] flex items-center gap-1">
                                                <span className="wp-live-dot" /> Current
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {!session.isCurrent && (
                                <button
                                    type="button"
                                    onClick={() => handleRevokeSession(session.id)}
                                    aria-label={`Revoke session for ${session.device || 'this device'}`}
                                    className="wp-btn wp-btn-secondary h-6 px-2 text-xs text-rose-400 hover:text-rose-300 hover:border-rose-500/40"
                                >
                                    Revoke
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const defaultNotificationPreferences = {
    email: true,
    email_reports: true,
    browser: true,
    security: true,
    marketing: false
};

function parseSafePreferences(raw) {
    if (!raw) return defaultNotificationPreferences;
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            return typeof parsed === 'object' && parsed !== null
                ? { ...defaultNotificationPreferences, ...parsed }
                : defaultNotificationPreferences;
        } catch {
            return defaultNotificationPreferences;
        }
    }
    if (typeof raw === 'object' && raw !== null) {
        return { ...defaultNotificationPreferences, ...raw };
    }
    return defaultNotificationPreferences;
}

function NotificationsSection({ user, showToast }) {
    const [isEditing, setIsEditing] = useState(false);
    const [preferences, setPreferences] = useState(() => parseSafePreferences(user?.notification_preferences));

    useEffect(() => {
        if (user?.notification_preferences) {
            setPreferences(parseSafePreferences(user.notification_preferences));
        }
    }, [user?.notification_preferences]);

    const handleToggle = async (key) => {
        if (!isEditing) return;
        const currentPrefs = preferences || defaultNotificationPreferences;
        const newPrefs = { ...currentPrefs, [key]: !currentPrefs[key] };
        setPreferences(newPrefs);
        try {
            await apiRequest('/user/notifications', {
                method: 'PUT',
                body: JSON.stringify({ preferences: newPrefs })
            });
        } catch (error) {
            showToast('Failed to update preferences', 'error');
            setPreferences(currentPrefs); // Revert
        }
    };

    const currentPreferences = preferences || defaultNotificationPreferences;

    return (
        <div className="wp-panel bg-[var(--wp-bg-surface)]">
            <div className="wp-panel-header">
                <span className="wp-title-card">Notification Preferences</span>
                <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="wp-btn wp-btn-secondary h-7 px-2.5 text-xs inline-flex items-center gap-1.5"
                >
                    {isEditing ? (
                        <>
                            <Check className="h-3 w-3" />
                            <span>Done</span>
                        </>
                    ) : (
                        <>
                            <Edit2 className="h-3 w-3" />
                            <span>Edit</span>
                        </>
                    )}
                </button>
            </div>
            <div className="p-3.5 sm:p-4 space-y-2 divide-y divide-[var(--wp-border-subtle)]">
                {[
                    { id: 'email', label: 'Email Notifications', desc: 'Receive daily summaries and critical alerts via email.' },
                    { id: 'email_reports', label: 'Email Reports', desc: 'Receive weekly performance reports for your projects.' },
                    { id: 'browser', label: 'Browser Push Notifications', desc: 'Get real-time updates when you are online.' },
                    { id: 'security', label: 'Security Alerts', desc: 'Get notified about new logins and password changes.' },
                    { id: 'marketing', label: 'Product Updates', desc: 'Receive news about new features and improvements.' }
                ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                        <div>
                            <p className="text-xs font-medium text-[var(--wp-text-primary)]">{item.label}</p>
                            <p className="text-[11px] text-[var(--wp-text-muted)] mt-0.5">{item.desc}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleToggle(item.id)}
                            disabled={!isEditing}
                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                                currentPreferences[item.id] ? 'bg-[var(--wp-accent-solid)]' : 'bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-default)]'
                            }`}
                        >
                            <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full transition-transform ${
                                    currentPreferences[item.id] ? 'bg-[var(--wp-text-inverted)] translate-x-4' : 'bg-[var(--wp-text-muted)] translate-x-1'
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

    if (!usageStats) {
        return (
            <div className="wp-panel bg-[var(--wp-bg-surface)] p-4 space-y-3 animate-pulse">
                <div className="h-4 w-36 bg-[var(--wp-border-subtle)] rounded" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="h-20 bg-[var(--wp-bg-subtle)] rounded" />
                    <div className="h-20 bg-[var(--wp-bg-subtle)] rounded" />
                </div>
            </div>
        );
    }

    const getPercentage = (used, limit) => {
        if (!limit || limit === Infinity) return 0;
        return Math.min((used / limit) * 100, 100);
    };

    return (
        <div className="wp-panel bg-[var(--wp-bg-surface)]">
            <div className="wp-panel-header">
                <span className="wp-title-card">Usage & Quota</span>
                <span className="wp-metric-mono text-[10.5px] uppercase px-1.5 py-0.5 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] text-[var(--wp-text-primary)]">
                    {usageStats.plan} Plan
                </span>
            </div>

            <div className="p-3.5 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Monthly Views */}
                <div className="p-3 rounded border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-surface)]">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <span className="wp-label-section uppercase">Monthly views</span>
                            <div className="wp-kpi-value text-base font-medium text-[var(--wp-text-primary)] mt-0.5 tabular-nums">
                                {usageStats.totalViews.toLocaleString()}
                            </div>
                        </div>
                        <p className="wp-metric-mono text-[11px] text-[var(--wp-text-muted)] tabular-nums">
                            Limit: {usageStats.monthlyLimit.toLocaleString()}
                        </p>
                    </div>
                    <div className="wp-meter-track">
                        <div
                            className="wp-meter-bar"
                            style={{ width: `${Math.max(getPercentage(usageStats.totalViews, usageStats.monthlyLimit), usageStats.totalViews > 0 ? 2 : 0)}%` }}
                        />
                    </div>
                </div>

                {/* Storage Used */}
                <div className="p-3 rounded border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-surface)]">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <span className="wp-label-section uppercase">Storage used</span>
                            <div className="wp-kpi-value text-base font-medium text-[var(--wp-text-primary)] mt-0.5 tabular-nums">
                                {usageStats.storageUsed < 1024 * 1024
                                    ? `${(usageStats.storageUsed / 1024).toFixed(2)} KB`
                                    : usageStats.storageUsed < 1024 * 1024 * 1024
                                        ? `${(usageStats.storageUsed / (1024 * 1024)).toFixed(2)} MB`
                                        : `${(usageStats.storageUsed / (1024 * 1024 * 1024)).toFixed(2)} GB`
                                }
                            </div>
                        </div>
                        <p className="wp-metric-mono text-[11px] text-[var(--wp-text-muted)]">
                            Limit: {usageStats.storageLimit < 1024 * 1024 * 1024 ? `${(usageStats.storageLimit / (1024 * 1024)).toFixed(0)} MB` : `${(usageStats.storageLimit / (1024 * 1024 * 1024)).toFixed(0)} GB`}
                        </p>
                    </div>
                    <div className="wp-meter-track">
                        <div
                            className="wp-meter-bar"
                            style={{ width: `${Math.max(getPercentage(usageStats.storageUsed, usageStats.storageLimit), usageStats.storageUsed > 0 ? 2 : 0)}%` }}
                        />
                    </div>
                </div>

                {/* Total Projects */}
                <div className="p-3 rounded border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-surface)]">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <span className="wp-label-section uppercase">Total projects</span>
                            <div className="wp-kpi-value text-base font-medium text-[var(--wp-text-primary)] mt-0.5 tabular-nums">
                                {usageStats.projectCount}
                            </div>
                        </div>
                        <p className="wp-metric-mono text-[11px] text-[var(--wp-text-muted)]">
                            Limit: {usageStats.projectLimit}
                        </p>
                    </div>
                    <div className="wp-meter-track">
                        <div
                            className="wp-meter-bar"
                            style={{ width: `${Math.max(getPercentage(usageStats.projectCount, usageStats.projectLimit), usageStats.projectCount > 0 ? 2 : 0)}%` }}
                        />
                    </div>
                </div>

                {/* Shared Reports */}
                <div className="p-3 rounded border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-surface)]">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <span className="wp-label-section uppercase">Shared reports</span>
                            <div className="wp-kpi-value text-base font-medium text-[var(--wp-text-primary)] mt-0.5 tabular-nums">
                                {usageStats.share_report?.used || 0}
                            </div>
                        </div>
                        <p className="wp-metric-mono text-[11px] text-[var(--wp-text-muted)]">
                            Limit: {usageStats.share_report?.limit === Infinity ? 'Unlimited' : usageStats.share_report?.limit}
                        </p>
                    </div>
                    <div className="wp-meter-track">
                        <div
                            className="wp-meter-bar"
                            style={{ width: `${Math.max(getPercentage(usageStats.share_report?.used || 0, usageStats.share_report?.limit || 1), (usageStats.share_report?.used || 0) > 0 ? 2 : 0)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProjectsSection() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', allowedOrigins: '' });
    const { showToast } = useToast();

    const loadProjects = () => {
        apiRequest('/projects')
            .then(setProjects)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadProjects();
    }, []);

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

    if (loading) {
        return (
            <div className="wp-panel bg-[var(--wp-bg-surface)] p-4 space-y-3 animate-pulse">
                <div className="h-4 w-36 bg-[var(--wp-border-subtle)] rounded" />
                <div className="space-y-2">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-12 bg-[var(--wp-bg-subtle)] rounded" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="wp-panel bg-[var(--wp-bg-surface)]">
            <div className="wp-panel-header">
                <span className="wp-title-card">Projects & Teams</span>
                <span className="wp-metric-mono text-[10.5px] text-[var(--wp-text-muted)]">
                    {projects.length} active
                </span>
            </div>

            <div className="p-3.5 sm:p-4 space-y-2">
                {projects.length === 0 ? (
                    <div className="py-8 text-center text-[var(--wp-text-muted)] font-mono text-xs">
                        No projects found. Create one to get started.
                    </div>
                ) : (
                    projects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-2.5 border border-[var(--wp-border-subtle)] rounded bg-[var(--wp-bg-surface)]">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-subtle)] text-[var(--wp-text-primary)] text-xs font-mono font-medium">
                                    {project.name[0].toUpperCase()}
                                </div>
                                {editingId === project.id ? (
                                    <div className="flex-1 grid gap-1.5 mr-3">
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full h-7 px-2 text-xs font-mono rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] text-[var(--wp-text-primary)] focus:border-[var(--wp-border-strong)] focus:outline-none"
                                            placeholder="Project Name"
                                        />
                                        <input
                                            type="text"
                                            value={editForm.allowedOrigins}
                                            onChange={(e) => setEditForm({ ...editForm, allowedOrigins: e.target.value })}
                                            className="w-full h-7 px-2 text-xs font-mono rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] text-[var(--wp-text-primary)] focus:border-[var(--wp-border-strong)] focus:outline-none"
                                            placeholder="Allowed Origins (comma separated)"
                                        />
                                    </div>
                                ) : (
                                    <div className="truncate">
                                        <p className="text-xs font-medium text-[var(--wp-text-primary)] truncate">{project.name}</p>
                                        <p className="text-[11px] text-[var(--wp-text-muted)] font-mono truncate">{project.allowed_origins || 'All origins allowed'}</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 ml-3 shrink-0">
                                {editingId === project.id ? (
                                    <div className="flex gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => handleSave(project.id)}
                                            className="wp-btn wp-btn-primary h-6 w-6 p-0 justify-center"
                                            title="Save"
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelEditing}
                                            className="wp-btn wp-btn-secondary h-6 w-6 p-0 justify-center"
                                            title="Cancel"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="px-1.5 py-0.5 rounded border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-subtle)] text-[10px] font-mono text-[var(--wp-text-muted)]">
                                            Owner
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => startEditing(project)}
                                            className="wp-btn wp-btn-secondary h-6 w-6 p-0 justify-center"
                                            title="Edit project"
                                        >
                                            <Edit2 className="h-3 w-3" />
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
    const currentPlan = getPlanById(user?.plan) || getPlanById('free');

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
            const baseUrl = import.meta.env.VITE_API_URL;
            const apiUrl = baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl}/v1`;

            const response = await fetch(`${apiUrl}/payment/receipt/${paymentId}`, {
                credentials: 'include',
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
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

    if (loading) {
        return (
            <div className="wp-panel bg-[var(--wp-bg-surface)] p-4 space-y-3 animate-pulse">
                <div className="h-4 w-36 bg-[var(--wp-border-subtle)] rounded" />
                <div className="space-y-2">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-12 bg-[var(--wp-bg-subtle)] rounded" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="wp-panel bg-[var(--wp-bg-surface)]">
                <div className="wp-panel-header">
                    <span className="wp-title-card">Subscription Summary</span>
                    <span className="wp-metric-mono text-[10.5px] uppercase px-1.5 py-0.5 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] text-[var(--wp-text-primary)]">
                        {currentPlan.name} Tier
                    </span>
                </div>

                <div className="p-3.5 sm:p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <div className="p-3 rounded border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-surface)]">
                            <span className="wp-label-section uppercase mb-1">Current tier</span>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="wp-kpi-value text-base font-medium text-[var(--wp-text-primary)]">{currentPlan.name}</span>
                                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                                    <span className="wp-live-dot" />
                                    Active
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-[var(--wp-text-muted)] font-mono">
                                {formatINR(currentPlan.amount)} / month
                            </p>
                        </div>

                        <div className="p-3 rounded border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-surface)]">
                            <span className="wp-label-section uppercase mb-1">Billing terms</span>
                            <p className="text-xs font-medium text-[var(--wp-text-primary)] mt-0.5">One-time monthly order</p>
                            <p className="text-[11px] text-[var(--wp-text-muted)] mt-0.5 font-mono">No automatic renewal</p>
                        </div>

                        <div className="p-3 rounded border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-surface)]">
                            <span className="wp-label-section uppercase mb-1">Payment gateway</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <CreditCard className="h-3.5 w-3.5 text-[var(--wp-text-muted)]" />
                                <span className="text-xs font-medium text-[var(--wp-text-primary)]">Razorpay</span>
                            </div>
                            <p className="text-[11px] text-[var(--wp-text-muted)] mt-0.5 font-mono">INR · tax excluded</p>
                        </div>
                    </div>

                    <div className="mb-2">
                        <span className="wp-label-section uppercase">Payment History</span>
                    </div>

                    <div className="overflow-x-auto rounded border border-[var(--wp-border-subtle)]">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-[var(--wp-bg-subtle)] border-b border-[var(--wp-border-subtle)] text-[10px] font-mono uppercase tracking-wider text-[var(--wp-text-muted)]">
                                    <th className="px-3.5 py-2 font-medium">Invoice ID</th>
                                    <th className="px-3.5 py-2 font-medium">Date</th>
                                    <th className="px-3.5 py-2 font-medium">Description</th>
                                    <th className="px-3.5 py-2 font-medium">Amount</th>
                                    <th className="px-3.5 py-2 font-medium">Status</th>
                                    <th className="px-3.5 py-2 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--wp-border-subtle)]">
                                {paymentHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-[var(--wp-text-muted)] font-mono text-xs">
                                            No payment history found
                                        </td>
                                    </tr>
                                ) : (
                                    paymentHistory.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-[var(--wp-bg-hover)] transition-colors font-mono">
                                            <td className="px-3.5 py-2.5 text-[var(--wp-text-secondary)]">{payment.id && (payment.id.substring(0, 10) + '...')}</td>
                                            <td className="px-3.5 py-2.5 text-[var(--wp-text-muted)]">
                                                {new Date(payment.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-3.5 py-2.5 text-[var(--wp-text-primary)] font-sans font-medium">{payment.description || 'Subscription'}</td>
                                            <td className="px-3.5 py-2.5 text-[var(--wp-text-primary)] tabular-nums">{payment.amount != null ? formatINR(payment.amount) : '—'}</td>
                                            <td className="px-3.5 py-2.5">
                                                <span className="text-emerald-400 capitalize font-medium">{payment.status}</span>
                                            </td>
                                            <td className="px-3.5 py-2.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDownloadReceipt(payment.id)}
                                                        className="wp-btn wp-btn-secondary h-6 w-6 p-0 justify-center text-[var(--wp-text-muted)] hover:text-[var(--wp-text-primary)]"
                                                        title="Download Receipt"
                                                    >
                                                        <Download className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEmailReceipt(payment.id)}
                                                        className="wp-btn wp-btn-secondary h-6 w-6 p-0 justify-center text-[var(--wp-text-muted)] hover:text-[var(--wp-text-primary)]"
                                                        title="Email Receipt"
                                                    >
                                                        <Bell className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LinkedAccountsSection({ showToast }) {
    const [accounts, setAccounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [telegramChatId, setTelegramChatId] = useState('');
    const [telegramUsername, setTelegramUsername] = useState('');
    const [botToken, setBotToken] = useState('');
    const [isPro, setIsPro] = useState(false);

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

    if (loading) {
        return (
            <div className="wp-panel bg-[var(--wp-bg-surface)] p-4 space-y-3 animate-pulse">
                <div className="h-4 w-36 bg-[var(--wp-border-subtle)] rounded" />
                <div className="space-y-2">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-12 bg-[var(--wp-bg-subtle)] rounded" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="wp-panel bg-[var(--wp-bg-surface)] relative overflow-hidden">
                {!isPro && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10 p-4">
                        <div className="text-center p-6 bg-[var(--wp-bg-surface)] border border-[var(--wp-border-default)] rounded-lg shadow-2xl max-w-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-subtle)] mx-auto mb-3">
                                <Lock className="h-5 w-5 text-[var(--wp-text-primary)]" />
                            </div>
                            <h4 className="wp-title-card mb-1">Pro Feature</h4>
                            <p className="text-[var(--wp-text-muted)] text-xs mb-4">Telegram telemetry alerts are available on Pro and Business tiers.</p>
                            <button
                                type="button"
                                onClick={() => window.location.href = '/dashboard/billing'}
                                className="w-full wp-btn wp-btn-primary h-7 text-xs"
                            >
                                Upgrade Plan
                            </button>
                        </div>
                    </div>
                )}

                <div className="wp-panel-header">
                    <div className="flex items-center gap-2">
                        <Send className="h-3.5 w-3.5 text-[var(--wp-text-muted)]" />
                        <span className="wp-title-card">Telegram Integration</span>
                    </div>
                    {accounts.telegram && (
                        <span className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-subtle)] text-[10.5px] font-mono text-emerald-400">
                            <span className="wp-live-dot" />
                            Linked
                        </span>
                    )}
                </div>

                <div className="p-3.5 sm:p-4">
                    {accounts.telegram ? (
                        <div className="flex items-center justify-between p-2.5 border border-[var(--wp-border-subtle)] rounded bg-[var(--wp-bg-surface)]">
                            <div>
                                <div className="text-xs font-medium text-[var(--wp-text-primary)] font-mono">{accounts.telegram.username}</div>
                                <div className="text-[11px] text-[var(--wp-text-muted)] font-mono mt-0.5">Chat ID: {accounts.telegram.chat_id}</div>
                                {accounts.telegram.bot_token && (
                                    <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                                        <Check className="h-3 w-3" /> Custom Bot Token Active
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => unlink('telegram')}
                                className="wp-btn wp-btn-secondary h-6 px-2 text-xs text-rose-400 hover:text-rose-300 hover:border-rose-500/40"
                            >
                                Unlink
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={linkTelegram} className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="wp-label-section uppercase block mb-1">Chat ID</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Chat ID"
                                        value={telegramChatId}
                                        onChange={e => setTelegramChatId(e.target.value)}
                                        className="w-full h-8 px-2.5 text-xs font-mono rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] text-[var(--wp-text-primary)] focus:border-[var(--wp-border-strong)] focus:outline-none"
                                        required
                                    />
                                    <p className="text-[11px] text-[var(--wp-text-muted)] mt-1 font-mono">
                                        Need your ID? Message <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-[var(--wp-text-primary)] underline">@userinfobot</a>
                                    </p>
                                </div>
                                <div>
                                    <label className="wp-label-section uppercase block mb-1">Username (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={telegramUsername}
                                        onChange={e => setTelegramUsername(e.target.value)}
                                        className="w-full h-8 px-2.5 text-xs font-mono rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] text-[var(--wp-text-primary)] focus:border-[var(--wp-border-strong)] focus:outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="wp-label-section uppercase block mb-1">Custom Bot Token (Optional)</label>
                                    <input
                                        type="password"
                                        placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                                        value={botToken}
                                        onChange={e => setBotToken(e.target.value)}
                                        className="w-full h-8 px-2.5 text-xs font-mono rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] text-[var(--wp-text-primary)] focus:border-[var(--wp-border-strong)] focus:outline-none"
                                    />
                                    <p className="text-[11px] text-[var(--wp-text-muted)] mt-1 font-mono">Leave blank to use default WebPulse alerts, or enter custom bot token.</p>
                                </div>
                            </div>
                            <div className="flex justify-end pt-3 border-t border-[var(--wp-border-subtle)]">
                                <button type="submit" className="wp-btn wp-btn-primary h-7 px-3 text-xs">
                                    Link Telegram
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
