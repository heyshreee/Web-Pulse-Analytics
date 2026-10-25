import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardHead, CardTitle, CardSub, CardBody } from '../ui/Card';
import { Badge } from '../ui/Display';
import { Alert, Select, Switch, SettingRow } from '../ui/Field';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../utils/api';

const RETENTION_OPTIONS = [
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '180', label: '6 months' },
  { value: '365', label: '1 year' },
  { value: '730', label: '2 years' },
  { value: '1095', label: '3 years' }
];

const TIMEOUT_OPTIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '60', label: '60 minutes' },
  { value: '120', label: '120 minutes' }
];

const UNAVAILABLE = [
  { title: 'URL query parameter filtering', desc: 'Strip sensitive parameters before storage.' },
  { title: 'Sensitive path masking', desc: 'Redact values in URLs such as /account/*.' },
  { title: 'Cookie & visitor identifier policy', desc: 'Choose how returning visitors are identified.' }
];

export default function PrivacySection({ project }) {
  const { toast } = useToast();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    if (!project) return () => {};
    setLoading(true);
    apiRequest(`/projects/${project.id}/settings`)
      .then((data) => {
        if (active) setSettings(data);
      })
      .catch((err) => {
        if (active) toast({ title: err.message || 'Failed to load privacy settings', tone: 'error' });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  if (!project) return null;

  const set = (key) => (value) => setSettings((s) => ({ ...s, [key]: value }));

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const updated = await apiRequest(`/projects/${project.id}/settings`, {
        method: 'PUT',
        body: JSON.stringify({
          anonymize_ip: settings.anonymize_ip,
          respect_dnt: settings.respect_dnt,
          session_timeout_minutes: Number(settings.session_timeout_minutes),
          retention_days: Number(settings.retention_days)
        })
      });
      setSettings(updated);
      toast({ title: 'Privacy settings saved', tone: 'success' });
    } catch (err) {
      toast({ title: err.message || 'Failed to save privacy settings', tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHead>
          <div>
            <CardTitle>Data &amp; privacy</CardTitle>
            <CardSub>Protect visitors and control stored data</CardSub>
          </div>
        </CardHead>
        <CardBody>
          {loading || !settings ? (
            <p className="text-sm text-muted-foreground">Loading settings…</p>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <Alert tone="info">
                These policies are stored per project now and will be enforced by the tracking
                pipeline in a later release.
              </Alert>

              <div className="divide-y divide-border">
                <SettingRow
                  title="Anonymize IP addresses"
                  description="Truncate the last octet of IPv4 addresses before storage."
                  control={
                    <Switch
                      checked={!!settings.anonymize_ip}
                      onChange={set('anonymize_ip')}
                      label="Anonymize IP addresses"
                    />
                  }
                />
                <SettingRow
                  title="Respect Do Not Track"
                  description="Exclude visitors whose browser sends the DNT header."
                  control={
                    <Switch
                      checked={!!settings.respect_dnt}
                      onChange={set('respect_dnt')}
                      label="Respect Do Not Track"
                    />
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <Select
                  label="Session timeout"
                  value={String(settings.session_timeout_minutes ?? 30)}
                  onChange={(e) => set('session_timeout_minutes')(e.target.value)}
                  options={TIMEOUT_OPTIONS}
                  hint="Inactivity window used to group page views."
                />
                <Select
                  label="Data retention"
                  value={String(settings.retention_days ?? 365)}
                  onChange={(e) => set('retention_days')(e.target.value)}
                  options={RETENTION_OPTIONS}
                  hint="How long raw events are kept."
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" loading={saving}>
                  Save changes
                </Button>
              </div>
            </form>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHead>
          <div>
            <CardTitle>Advanced privacy</CardTitle>
            <CardSub>Not enabled in this release</CardSub>
          </div>
        </CardHead>
        <CardBody className="divide-y divide-border">
          {UNAVAILABLE.map((item) => (
            <SettingRow
              key={item.title}
              title={item.title}
              description={item.desc}
              control={<Badge tone="neutral">Coming soon</Badge>}
            />
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
