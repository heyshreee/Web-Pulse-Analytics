import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import {
    User, Shield, Bell, BarChart2, Briefcase,
    Save, Loader, Upload, Trash2, Monitor, Smartphone,
    Check, Settings as SettingsIcon, Edit2, CreditCard, Download,
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-line">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded border border-line bg-subtle text-ink">
                        <SettingsIcon className="h-4 w-4" />
                    </div>
                    <div>
                        <h1 className="wp-title-page">Account Settings</h1>
                        <p className="text-[11.5px] text-[var(--wp-text-muted)] mt-0.5">Manage your profile, security, and project preferences.</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-start">
                {/* Control Rail / Sidebar */}
                <div className="w-full md:w-56 flex-shrink-0">
                    <div className="wp-panel p-1.5 space-y-0.5 sticky top-20">
                        <div className="px-2.5 py-1 text-[11px] font-medium text-ink-muted uppercase tracking-wider font-mono">
                            Preferences
                        </div>
                        <nav className="space-y-0.5">
                            {tabs.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => navigate(`/dashboard/settings/${t.id}`)}
                                    className={`flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                        activeTab === t.id
                                            ? 'bg-ink text-canvas font-semibold'
                                            : 'text-ink-secondary hover:text-ink hover:bg-hover'
                                    }`}
                                >
                                    <t.icon className={`h-3.5 w-3.5 ${activeTab === t.id ? 'text-canvas' : 'text-ink-muted'}`} />
                                    {t.label}
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
        <div className="space-y-4">
            <div className="wp-panel p-5">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-sm font-medium text-ink">Profile Information</h3>
                        <p className="text-xs text-ink-muted">Update your display information and account identity.</p>
                    </div>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="btn-secondary h-7 px-3 text-xs inline-flex items-center gap-1.5"
                    >
                        {isEditing ? (
                            <>
                                <X className="h-3.5 w-3.5" />
                                Cancel
                            </>
                        ) : (
                            <>
                                <Edit2 className="h-3.5 w-3.5" />
                                Edit
                            </>
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-line bg-subtle text-lg font-bold text-ink font-mono shrink-0">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                            (user?.name?.[0] || user?.email?.[0] || '?').toUpperCase()
                        )}
                    </div>
                    <div>
                        <h4 className="text-xs font-medium text-ink mb-0.5">Avatar Image</h4>
                        <p className="text-[11px] text-ink-muted mb-2 font-mono">JPG, GIF or PNG. Max size 5MB</p>
                        <div className="flex gap-2">
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
                                className="btn-secondary h-6 px-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {uploading ? <Loader className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                            <button
                                disabled={!isEditing}
                                className="btn-secondary h-6 px-2 text-xs inline-flex items-center gap-1.5 text-ink-muted hover:text-red-500 disabled:opacity-50"
                            >
                                <Trash2 className="h-3 w-3" />
                                Remove
                            </button>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-mono text-ink-secondary mb-1">Full Name</label>
                            <input
                                type="text"
                                disabled={!isEditing}
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="input font-mono text-xs h-8 disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-ink-secondary mb-1">Job Title</label>
                            <input
                                type="text"
                                disabled={!isEditing}
                                value={formData.job_title}
                                onChange={e => setFormData({ ...formData, job_title: e.target.value })}
                                className="input font-mono text-xs h-8 disabled:opacity-50"
                                placeholder="e.g. Senior Developer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-ink-secondary mb-1">Bio</label>
                        <textarea
                            value={formData.bio}
                            disabled={!isEditing}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            rows={3}
                            className="input font-mono text-xs resize-none disabled:opacity-50"
                            placeholder="Tell us a little about yourself..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-mono text-ink-secondary mb-1">Language</label>
                            <select
                                value={formData.language}
                                disabled={!isEditing}
                                onChange={e => setFormData({ ...formData, language: e.target.value })}
                                className="input font-mono text-xs h-8 disabled:opacity-50"
                            >
                                <option value="en-US">English (US)</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-ink-secondary mb-1">Timezone</label>
                            <select
                                value={formData.timezone}
                                disabled={!isEditing}
                                onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                                className="input font-mono text-xs h-8 disabled:opacity-50"
                            >
                                <option value="UTC">UTC</option>
                                <option value="EST">Eastern Standard Time (EST)</option>
                                <option value="PST">Pacific Standard Time (PST)</option>
                                <option value="IST">India Standard Time (IST)</option>
                            </select>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end pt-3 border-t border-line">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary h-7 px-3 text-xs inline-flex items-center gap-1.5"
                            >
                                {loading ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                Save Changes
                            </button>
                        </div>
                    )}
                </form>
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
            <div className="wp-panel p-5 space-y-3 animate-pulse">
                <div className="h-4 w-32 bg-subtle rounded" />
                <div className="space-y-2">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-12 bg-subtle/50 rounded" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="wp-panel p-5">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-sm font-medium text-ink">Change Password</h3>
                        <p className="text-xs text-ink-muted">Keep your account credentials secure.</p>
                    </div>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="btn-secondary h-7 px-3 text-xs inline-flex items-center gap-1.5"
                    >
                        {isEditing ? (
                            <>
                                <X className="h-3.5 w-3.5" />
                                Cancel
                            </>
                        ) : (
                            <>
                                <Edit2 className="h-3.5 w-3.5" />
                                Edit
                            </>
                        )}
                    </button>
                </div>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-mono text-ink-secondary mb-1">Current Password</label>
                        <input
                            type="password"
                            disabled={!isEditing}
                            value={passwords.current}
                            onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                            className="input font-mono text-xs h-8 disabled:opacity-50"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-mono text-ink-secondary mb-1">New Password</label>
                            <input
                                type="password"
                                disabled={!isEditing}
                                value={passwords.new}
                                onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                className="input font-mono text-xs h-8 disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-ink-secondary mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                disabled={!isEditing}
                                value={passwords.confirm}
                                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                className="input font-mono text-xs h-8 disabled:opacity-50"
                            />
                        </div>
                    </div>
                    {isEditing && (
                        <div className="flex justify-end pt-3 border-t border-line">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary h-7 px-3 text-xs inline-flex items-center gap-1.5"
                            >
                                {loading ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                Update Password
                            </button>
                        </div>
                    )}
                </form>
            </div>

            <div className="wp-panel p-5">
                <h3 className="text-sm font-medium text-ink mb-4">Active Sessions</h3>
                <div className="space-y-2">
                    {sessions.map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-line rounded bg-surface">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded border border-line bg-subtle text-ink-muted">
                                    {session.device?.includes('Mobile') ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-ink">{session.device || 'Unknown Device'}</p>
                                    <div className="flex items-center gap-2 text-[11px] text-ink-muted mt-0.5 font-mono">
                                        <span>{session.location}</span>
                                        <span>•</span>
                                        <span>{new Date(session.lastActive).toLocaleDateString()}</span>
                                        {session.isCurrent && (
                                            <span className="text-emerald-500 font-semibold">• Current</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {!session.isCurrent && (
                                <button
                                    type="button"
                                    onClick={() => handleRevokeSession(session.id)}
                                    aria-label={`Revoke session for ${session.device || 'this device'}`}
                                    className="btn-secondary h-6 px-2 text-xs text-ink-muted hover:text-red-500"
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
        <div className="wp-panel p-5">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-sm font-medium text-ink">Notification Preferences</h3>
                    <p className="text-xs text-ink-muted">Configure your event alerts and scheduled digests.</p>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="btn-secondary h-7 px-3 text-xs inline-flex items-center gap-1.5"
                >
                    {isEditing ? (
                        <>
                            <Check className="h-3.5 w-3.5" />
                            Done
                        </>
                    ) : (
                        <>
                            <Edit2 className="h-3.5 w-3.5" />
                            Edit
                        </>
                    )}
                </button>
            </div>
            <div className="space-y-2 divide-y divide-line">
                {[
                    { id: 'email', label: 'Email Notifications', desc: 'Receive daily summaries and critical alerts via email.' },
                    { id: 'email_reports', label: 'Email Reports', desc: 'Receive weekly performance reports for your projects.' },
                    { id: 'browser', label: 'Browser Push Notifications', desc: 'Get real-time updates when you are online.' },
                    { id: 'security', label: 'Security Alerts', desc: 'Get notified about new logins and password changes.' },
                    { id: 'marketing', label: 'Product Updates', desc: 'Receive news about new features and improvements.' }
                ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between pt-3 first:pt-0">
                        <div>
                            <p className="text-xs font-medium text-ink">{item.label}</p>
                            <p className="text-[11px] text-ink-muted">{item.desc}</p>
                        </div>
                        <button
                            onClick={() => handleToggle(item.id)}
                            disabled={!isEditing}
                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                                preferences[item.id] ? 'bg-ink' : 'bg-subtle border border-line'
                            }`}
                        >
                            <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full transition-transform ${
                                    preferences[item.id] ? 'bg-canvas translate-x-4' : 'bg-ink-muted translate-x-1'
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
            <div className="wp-panel p-5 space-y-4 animate-pulse">
                <div className="h-4 w-36 bg-subtle rounded" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="h-20 bg-subtle/50 rounded" />
                    <div className="h-20 bg-subtle/50 rounded" />
                </div>
            </div>
        );
    }

    const getPercentage = (used, limit) => {
        if (!limit || limit === Infinity) return 0;
        return Math.min((used / limit) * 100, 100);
    };

    return (
        <div className="space-y-4">
            <div className="wp-panel p-5">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-sm font-medium text-ink">Usage & Quota</h3>
                        <p className="text-xs text-ink-muted">Track resource consumption against your plan limits.</p>
                    </div>
                    <span className="px-2 py-0.5 rounded border border-line bg-subtle text-xs font-mono uppercase tracking-wider text-ink font-semibold">
                        {usageStats.plan} Plan
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Monthly Views */}
                    <div className="p-3.5 rounded border border-line bg-surface">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-[11px] text-ink-muted">Monthly views</p>
                                <p className="text-lg font-semibold text-ink font-mono tabular-nums">{usageStats.totalViews.toLocaleString()}</p>
                            </div>
                            <p className="text-xs text-ink-muted font-mono tabular-nums">Limit: {usageStats.monthlyLimit.toLocaleString()}</p>
                        </div>
                        <div className="wp-meter-track">
                            <div
                                className="wp-meter-bar"
                                style={{ width: `${Math.max(getPercentage(usageStats.totalViews, usageStats.monthlyLimit), usageStats.totalViews > 0 ? 2 : 0)}%` }}
                            />
                        </div>
                    </div>

                    {/* Storage Used */}
                    <div className="p-3.5 rounded border border-line bg-surface">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-[11px] text-ink-muted">Storage used</p>
                                <p className="text-lg font-semibold text-ink font-mono tabular-nums">
                                    {usageStats.storageUsed < 1024 * 1024
                                        ? `${(usageStats.storageUsed / 1024).toFixed(2)} KB`
                                        : usageStats.storageUsed < 1024 * 1024 * 1024
                                            ? `${(usageStats.storageUsed / (1024 * 1024)).toFixed(2)} MB`
                                            : `${(usageStats.storageUsed / (1024 * 1024 * 1024)).toFixed(2)} GB`
                                    }
                                </p>
                            </div>
                            <p className="text-xs text-ink-muted font-mono">Limit: {usageStats.storageLimit < 1024 * 1024 * 1024 ? `${(usageStats.storageLimit / (1024 * 1024)).toFixed(0)} MB` : `${(usageStats.storageLimit / (1024 * 1024 * 1024)).toFixed(0)} GB`}</p>
                        </div>
                        <div className="wp-meter-track">
                            <div
                                className="wp-meter-bar"
                                style={{ width: `${Math.max(getPercentage(usageStats.storageUsed, usageStats.storageLimit), usageStats.storageUsed > 0 ? 2 : 0)}%` }}
                            />
                        </div>
                    </div>

                    {/* Total Projects */}
                    <div className="p-3.5 rounded border border-line bg-surface">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-[11px] text-ink-muted">Total projects</p>
                                <p className="text-lg font-semibold text-ink font-mono tabular-nums">{usageStats.projectCount}</p>
                            </div>
                            <p className="text-xs text-ink-muted font-mono">Limit: {usageStats.projectLimit}</p>
                        </div>
                        <div className="wp-meter-track">
                            <div
                                className="wp-meter-bar"
                                style={{ width: `${Math.max(getPercentage(usageStats.projectCount, usageStats.projectLimit), usageStats.projectCount > 0 ? 2 : 0)}%` }}
                            />
                        </div>
                    </div>

                    {/* Shared Reports */}
                    <div className="p-3.5 rounded border border-line bg-surface">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-[11px] text-ink-muted">Shared reports</p>
                                <p className="text-lg font-semibold text-ink font-mono tabular-nums">{usageStats.share_report?.used || 0}</p>
                            </div>
                            <p className="text-xs text-ink-muted font-mono">Limit: {usageStats.share_report?.limit === Infinity ? 'Unlimited' : usageStats.share_report?.limit}</p>
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
            <div className="wp-panel p-5 space-y-3 animate-pulse">
                <div className="h-4 w-36 bg-subtle rounded" />
                <div className="space-y-2">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-12 bg-subtle/50 rounded" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="wp-panel p-5">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-sm font-medium text-ink">Projects & Teams</h3>
                    <p className="text-xs text-ink-muted">Manage your registered domains and telemetry access scopes.</p>
                </div>
            </div>

            <div className="space-y-2">
                {projects.length === 0 ? (
                    <div className="py-12 text-center text-ink-muted font-mono text-xs">
                        No projects found. Create one to get started.
                    </div>
                ) : (
                    projects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-3 border border-line rounded bg-surface">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-line bg-subtle text-ink text-xs font-mono font-bold">
                                    {project.name[0].toUpperCase()}
                                </div>
                                {editingId === project.id ? (
                                    <div className="flex-1 grid gap-2 mr-3">
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="input font-mono text-xs h-7"
                                            placeholder="Project Name"
                                        />
                                        <input
                                            type="text"
                                            value={editForm.allowedOrigins}
                                            onChange={(e) => setEditForm({ ...editForm, allowedOrigins: e.target.value })}
                                            className="input font-mono text-xs h-7"
                                            placeholder="Allowed Origins (comma separated)"
                                        />
                                    </div>
                                ) : (
                                    <div className="truncate">
                                        <p className="text-xs font-medium text-ink truncate">{project.name}</p>
                                        <p className="text-[11px] text-ink-muted font-mono truncate">{project.allowed_origins || 'All origins allowed'}</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 ml-3 shrink-0">
                                {editingId === project.id ? (
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => handleSave(project.id)}
                                            className="p-1 rounded bg-ink text-canvas hover:opacity-90 transition-opacity"
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className="p-1 rounded border border-line text-ink-muted hover:text-ink hover:bg-hover transition-colors"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="px-1.5 py-0.5 rounded border border-line bg-subtle text-[10px] font-mono text-ink-muted">
                                            Owner
                                        </span>
                                        <button
                                            onClick={() => startEditing(project)}
                                            className="p-1 rounded text-ink-muted hover:text-ink hover:bg-hover transition-colors"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
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
            <div className="wp-panel p-5 space-y-3 animate-pulse">
                <div className="h-4 w-36 bg-subtle rounded" />
                <div className="space-y-2">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-12 bg-subtle/50 rounded" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="wp-panel p-5">
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-ink">Subscription Summary</h3>
                    <p className="text-xs text-ink-muted">Manage your active billing tier and invoice records.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                    <div className="p-3.5 rounded border border-line bg-surface">
                        <p className="text-[11px] text-ink-muted mb-1 font-mono">Current tier</p>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-ink font-mono">{currentPlan.name}</span>
                            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Active
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-ink-secondary font-mono">
                            {formatINR(currentPlan.amount)} / month
                        </p>
                    </div>

                    <div className="p-3.5 rounded border border-line bg-surface">
                        <p className="text-[11px] text-ink-muted mb-1 font-mono">Billing terms</p>
                        <p className="text-xs font-medium text-ink">One-time monthly order</p>
                        <p className="text-[11px] text-ink-muted mt-0.5">No automatic renewal</p>
                    </div>

                    <div className="p-3.5 rounded border border-line bg-surface">
                        <p className="text-[11px] text-ink-muted mb-1 font-mono">Payment gateway</p>
                        <div className="flex items-center gap-1.5">
                            <CreditCard className="h-3.5 w-3.5 text-ink-muted" />
                            <span className="text-xs font-medium text-ink">Razorpay</span>
                        </div>
                        <p className="text-[11px] text-ink-muted mt-0.5 font-mono">INR · tax excluded</p>
                    </div>
                </div>

                <h4 className="text-xs font-semibold text-ink mb-3 font-mono uppercase tracking-wider">Payment History</h4>

                <div className="overflow-x-auto rounded border border-line">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-subtle border-b border-line text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                                <th className="px-3.5 py-2 font-medium">Invoice ID</th>
                                <th className="px-3.5 py-2 font-medium">Date</th>
                                <th className="px-3.5 py-2 font-medium">Description</th>
                                <th className="px-3.5 py-2 font-medium">Amount</th>
                                <th className="px-3.5 py-2 font-medium">Status</th>
                                <th className="px-3.5 py-2 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {paymentHistory.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-ink-muted font-mono text-xs">
                                        No payment history found
                                    </td>
                                </tr>
                            ) : (
                                paymentHistory.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-hover transition-colors font-mono">
                                        <td className="px-3.5 py-2.5 text-ink-secondary">{payment.id && (payment.id.substring(0, 10) + '...')}</td>
                                        <td className="px-3.5 py-2.5 text-ink-muted">
                                            {new Date(payment.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-3.5 py-2.5 text-ink font-sans font-medium">{payment.description || 'Subscription'}</td>
                                        <td className="px-3.5 py-2.5 text-ink tabular-nums">{payment.amount != null ? formatINR(payment.amount) : '—'}</td>
                                        <td className="px-3.5 py-2.5">
                                            <span className="text-emerald-500 capitalize font-medium">{payment.status}</span>
                                        </td>
                                        <td className="px-3.5 py-2.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleDownloadReceipt(payment.id)}
                                                    className="p-1 rounded text-ink-muted hover:text-ink hover:bg-hover transition-colors"
                                                    title="Download Receipt"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEmailReceipt(payment.id)}
                                                    className="p-1 rounded text-ink-muted hover:text-ink hover:bg-hover transition-colors"
                                                    title="Email Receipt"
                                                >
                                                    <Bell className="h-3.5 w-3.5" />
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
            <div className="wp-panel p-5 space-y-3 animate-pulse">
                <div className="h-4 w-36 bg-subtle rounded" />
                <div className="space-y-2">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-12 bg-subtle/50 rounded" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="wp-panel p-5 relative overflow-hidden">
                {!isPro && (
                    <div className="absolute inset-0 bg-canvas/80 backdrop-blur-sm flex items-center justify-center z-10 p-4">
                        <div className="text-center p-6 bg-surface border border-line rounded-lg shadow-2xl max-w-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded border border-line bg-subtle mx-auto mb-3">
                                <Lock className="h-5 w-5 text-ink" />
                            </div>
                            <h4 className="text-sm font-semibold text-ink mb-1">Pro Feature</h4>
                            <p className="text-ink-muted text-xs mb-4">Telegram telemetry alerts are available on Pro and Business tiers.</p>
                            <button className="w-full btn-primary h-7 text-xs">Upgrade Plan</button>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded border border-line bg-subtle text-ink">
                            <Send className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-ink">Telegram Integration</h3>
                            <p className="text-xs text-ink-muted">Receive live notifications directly through Telegram Bot.</p>
                        </div>
                    </div>
                    {accounts.telegram && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-line bg-subtle text-xs font-mono text-emerald-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Linked
                        </span>
                    )}
                </div>

                {accounts.telegram ? (
                    <div className="flex items-center justify-between p-3 border border-line rounded bg-surface">
                        <div>
                            <div className="text-xs font-medium text-ink font-mono">{accounts.telegram.username}</div>
                            <div className="text-[11px] text-ink-muted font-mono mt-0.5">Chat ID: {accounts.telegram.chat_id}</div>
                            {accounts.telegram.bot_token && (
                                <div className="text-[10px] text-emerald-500 font-mono mt-1 flex items-center gap-1">
                                    <Check className="h-3 w-3" /> Custom Bot Token Active
                                </div>
                            )}
                        </div>
                        <button onClick={() => unlink('telegram')} className="btn-secondary h-6 px-2 text-xs text-red-500">Unlink</button>
                    </div>
                ) : (
                    <form onSubmit={linkTelegram} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-mono text-ink-secondary mb-1">Chat ID</label>
                                <input
                                    type="text"
                                    placeholder="Enter Chat ID"
                                    value={telegramChatId}
                                    onChange={e => setTelegramChatId(e.target.value)}
                                    className="input font-mono text-xs h-8"
                                    required
                                />
                                <p className="text-[11px] text-ink-muted mt-1 font-mono">
                                    Need your ID? Message <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-ink underline">@userinfobot</a>
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-ink-secondary mb-1">Username (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={telegramUsername}
                                    onChange={e => setTelegramUsername(e.target.value)}
                                    className="input font-mono text-xs h-8"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-mono text-ink-secondary mb-1">Custom Bot Token (Optional)</label>
                                <input
                                    type="password"
                                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                                    value={botToken}
                                    onChange={e => setBotToken(e.target.value)}
                                    className="input font-mono text-xs h-8"
                                />
                                <p className="text-[11px] text-ink-muted mt-1 font-mono">Leave blank to use default WebPulse alerts, or enter custom bot token.</p>
                            </div>
                        </div>
                        <div className="flex justify-end pt-3 border-t border-line">
                            <button type="submit" className="btn-primary h-7 px-3 text-xs">
                                Link Telegram
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
