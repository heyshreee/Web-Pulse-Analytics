import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardHead, CardTitle, CardSub, CardBody } from '../ui/Card';
import { Avatar, Badge } from '../ui/Display';
import { Alert, Input, Select, Switch, SettingRow, Textarea } from '../ui/Field';
import { IconButton } from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../utils/api';

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (GMT+00:00)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (GMT+05:30)' },
  { value: 'Europe/London', label: 'Europe/London (GMT+00:00)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (GMT+01:00)' },
  { value: 'America/New_York', label: 'America/New_York (GMT−05:00)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (GMT−08:00)' }
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt', label: 'Português' },
  { value: 'ja', label: '日本語' }
];

const DEFAULT_NOTIFICATIONS = {
  trafficSpikes: true,
  weeklyDigest: false,
  productUpdates: true
};

export default function AccountSection({ user, loadUser }) {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const fileRef = useRef(null);

  const [profile, setProfile] = useState({
    name: '',
    job_title: '',
    bio: '',
    timezone: 'UTC',
    language: 'en'
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [savingNotifications, setSavingNotifications] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile({
      name: user.name || '',
      job_title: user.job_title || '',
      bio: user.bio || '',
      timezone: user.timezone || 'UTC',
      language: user.language || 'en'
    });
    setNotifications({ ...DEFAULT_NOTIFICATIONS, ...(user.notification_preferences || {}) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    let active = true;
    setLoadingSessions(true);
    apiRequest('/user/sessions')
      .then((data) => {
        if (active) setSessions(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setSessions([]);
      })
      .finally(() => {
        if (active) setLoadingSessions(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const setProfileField = (key) => (value) => setProfile((p) => ({ ...p, [key]: value }));

  const handleUploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('avatar', file);
      await apiRequest('/user/avatar', { method: 'PUT', body: form });
      await loadUser?.();
      toast({ title: 'Profile picture updated', tone: 'success' });
    } catch (err) {
      toast({ title: err.message || 'Failed to upload image', tone: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    if (!profile.name.trim()) {
      toast({ title: 'Name is required', tone: 'error' });
      return;
    }
    setSavingProfile(true);
    try {
      await apiRequest('/user/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: profile.name.trim(),
          job_title: profile.job_title,
          bio: profile.bio,
          timezone: profile.timezone,
          language: profile.language
        })
      });
      await loadUser?.();
      toast({ title: 'Profile saved', tone: 'success' });
    } catch (err) {
      toast({ title: err.message || 'Failed to save profile', tone: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e?.preventDefault();
    if (passwords.next.length < 6) {
      toast({ title: 'New password must be at least 6 characters', tone: 'error' });
      return;
    }
    if (passwords.next !== passwords.confirm) {
      toast({ title: 'New passwords do not match', tone: 'error' });
      return;
    }
    setSavingPassword(true);
    try {
      await apiRequest('/user/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.next
        })
      });
      setPasswords({ current: '', next: '', confirm: '' });
      toast({ title: 'Password updated', tone: 'success' });
    } catch (err) {
      toast({ title: err.message || 'Failed to update password', tone: 'error' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRevokeSession = async (id) => {
    try {
      await apiRequest(`/user/sessions/${id}`, { method: 'DELETE' });
      setSessions((list) => list.filter((s) => s.id !== id));
      toast({ title: 'Session revoked', tone: 'success' });
    } catch (err) {
      toast({ title: err.message || 'Failed to revoke session', tone: 'error' });
    }
  };

  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    try {
      await apiRequest('/user/notifications', {
        method: 'PUT',
        body: JSON.stringify({ preferences: notifications })
      });
      await loadUser?.();
      toast({ title: 'Notification preferences saved', tone: 'success' });
    } catch (err) {
      toast({ title: err.message || 'Failed to save preferences', tone: 'error' });
    } finally {
      setSavingNotifications(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHead>
          <div>
            <CardTitle>Profile</CardTitle>
            <CardSub>Your personal information across WebPulse</CardSub>
          </div>
        </CardHead>
        <CardBody>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={user?.name || 'Account'} src={user?.avatar_url} size="lg" />
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadAvatar}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  Change photo
                </Button>
                <p className="hint mt-1">PNG or JPG, up to 400×400.</p>
              </div>
            </div>

            <Input
              label="Full name"
              value={profile.name}
              onChange={(e) => setProfileField('name')(e.target.value)}
            />

            <Input
              label="Email"
              value={user?.email || ''}
              readOnly
              disabled
              hint="Contact support to change your email address."
            />

            <Input
              label="Job title"
              value={profile.job_title}
              onChange={(e) => setProfileField('job_title')(e.target.value)}
              placeholder="e.g. Product Analyst"
            />

            <Textarea
              label="Bio"
              value={profile.bio}
              onChange={(e) => setProfileField('bio')(e.target.value)}
              rows={3}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Timezone"
                value={profile.timezone}
                onChange={(e) => setProfileField('timezone')(e.target.value)}
                options={TIMEZONES}
              />
              <Select
                label="Language"
                value={profile.language}
                onChange={(e) => setProfileField('language')(e.target.value)}
                options={LANGUAGES}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" loading={savingProfile}>
                Save profile
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHead>
          <div>
            <CardTitle>Password</CardTitle>
            <CardSub>Change the password for your account</CardSub>
          </div>
        </CardHead>
        <CardBody>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              type="password"
              label="Current password"
              value={passwords.current}
              onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              autoComplete="current-password"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                type="password"
                label="New password"
                value={passwords.next}
                onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                autoComplete="new-password"
              />
              <Input
                type="password"
                label="Confirm new password"
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                autoComplete="new-password"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" loading={savingPassword} disabled={!passwords.current || !passwords.next}>
                Update password
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHead>
          <div>
            <CardTitle>Active sessions</CardTitle>
            <CardSub>Devices currently signed in to your account</CardSub>
          </div>
        </CardHead>
        <CardBody className="p-0">
          {loadingSessions ? (
            <p className="p-4 text-sm text-muted-foreground">Loading sessions…</p>
          ) : sessions.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No active sessions found.</p>
          ) : (
            <div className="divide-y divide-border">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {s.location || 'Unknown location'}
                      </span>
                      {s.isCurrent ? <Badge tone="success">This device</Badge> : null}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{s.device || 'Unknown device'}</p>
                    {s.ip ? <p className="text-xs text-muted-foreground">IP: {s.ip}</p> : null}
                  </div>
                  {!s.isCurrent ? (
                    <IconButton
                      icon="trash"
                      label="Revoke session"
                      size="sm"
                      onClick={() => handleRevokeSession(s.id)}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHead>
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardSub>Email alerts about your workspace</CardSub>
          </div>
        </CardHead>
        <CardBody>
          <div className="divide-y divide-border">
            <SettingRow
              title="Traffic spikes"
              description="Email me when traffic increases significantly."
              control={
                <Switch
                  checked={!!notifications.trafficSpikes}
                  onChange={(v) => setNotifications((n) => ({ ...n, trafficSpikes: v }))}
                  label="Traffic spikes"
                />
              }
            />
            <SettingRow
              title="Weekly digest"
              description="A weekly summary of visitors and top pages."
              control={
                <Switch
                  checked={!!notifications.weeklyDigest}
                  onChange={(v) => setNotifications((n) => ({ ...n, weeklyDigest: v }))}
                  label="Weekly digest"
                />
              }
            />
            <SettingRow
              title="Product updates"
              description="Occasional news about new WebPulse features."
              control={
                <Switch
                  checked={!!notifications.productUpdates}
                  onChange={(v) => setNotifications((n) => ({ ...n, productUpdates: v }))}
                  label="Product updates"
                />
              }
            />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <Button loading={savingNotifications} onClick={handleSaveNotifications}>
              Save preferences
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHead>
          <div>
            <CardTitle>Appearance</CardTitle>
            <CardSub>How WebPulse looks for you</CardSub>
          </div>
        </CardHead>
        <CardBody>
          <SettingRow
            title="Dark theme"
            description="Use the dark color scheme across the dashboard."
            control={
              <Switch
                checked={theme === 'dark'}
                onChange={toggleTheme}
                label="Dark theme"
              />
            }
          />
        </CardBody>
      </Card>

      <Alert tone="info">
        Multi-factor authentication is not available in this release.
      </Alert>
    </div>
  );
}
