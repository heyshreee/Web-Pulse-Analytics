import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardHead, CardTitle, CardSub, CardBody } from '../ui/Card';
import { Input, Select, Textarea, Switch, SettingRow } from '../ui/Field';
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

const ENVIRONMENTS = [
  { value: 'production', label: 'Production' },
  { value: 'staging', label: 'Staging' },
  { value: 'development', label: 'Development' }
];

function emptyForm(project) {
  return {
    name: project?.name || '',
    targetUrl: project?.target_url || project?.domain || '',
    allowedOrigins: project?.allowed_origins || '',
    timezone: project?.timezone || 'UTC',
    environment: project?.environment || 'production',
    description: project?.description || '',
    isActive: project?.is_active !== false
  };
}

export default function GeneralSection({ project, user, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(() => emptyForm(project));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(emptyForm(project));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  if (!project) return null;

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!form.name.trim()) {
      toast({ title: 'Project name is required', tone: 'error' });
      return;
    }
    setSaving(true);
    try {
      await apiRequest(`/projects/${project.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name.trim(),
          targetUrl: form.targetUrl.trim(),
          allowedOrigins: form.allowedOrigins,
          timezone: form.timezone,
          environment: form.environment,
          description: form.description,
          isActive: form.isActive
        })
      });
      await onSaved?.();
      toast({ title: 'Project settings saved', tone: 'success' });
    } catch (err) {
      toast({ title: err.message || 'Failed to save settings', tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const created = project.created_at
    ? new Date(project.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : '—';

  return (
    <Card>
      <CardHead>
        <div>
          <CardTitle>Project details</CardTitle>
          <CardSub>How this website appears across WebPulse Analytics</CardSub>
        </div>
      </CardHead>
      <CardBody>
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Project name"
            value={form.name}
            onChange={(e) => set('name')(e.target.value)}
            hint="Letters, numbers, hyphens, and underscores only."
          />

          <Input
            label="Primary domain"
            value={form.targetUrl}
            onChange={(e) => set('targetUrl')(e.target.value)}
            placeholder="https://example.com"
          />

          <Textarea
            label="Allowed domains"
            value={form.allowedOrigins}
            onChange={(e) => set('allowedOrigins')(e.target.value)}
            rows={2}
            placeholder="example.com, www.example.com"
            hint="Comma-separated list of domains allowed to send events."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Reporting timezone"
              value={form.timezone}
              onChange={(e) => set('timezone')(e.target.value)}
              options={TIMEZONES}
            />
            <Select
              label="Environment"
              value={form.environment}
              onChange={(e) => set('environment')(e.target.value)}
              options={ENVIRONMENTS}
            />
          </div>

          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => set('description')(e.target.value)}
            rows={2}
            placeholder="Optional notes about this project."
          />

          <div className="divide-y divide-border">
            <SettingRow
              title="Project status"
              description={form.isActive ? 'Active — collecting analytics.' : 'Paused — ingestion is stopped.'}
              control={
                <Switch checked={form.isActive} onChange={set('isActive')} label="Project status" />
              }
            />
            <SettingRow
              title="Project ID"
              description={<code>{project.tracking_id || '—'}</code>}
            />
            <SettingRow title="Created" description={created} />
            <SettingRow title="Owner" description={user?.email || '—'} />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setForm(emptyForm(project))}
              disabled={saving}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
