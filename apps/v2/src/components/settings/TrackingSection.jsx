import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardHead, CardTitle, CardSub, CardBody } from '../ui/Card';
import { Badge } from '../ui/Display';
import { Select, Switch, SettingRow } from '../ui/Field';
import { CodeBlock, CopyButton } from '../ui/Page';
import { useToast } from '../../context/ToastContext';
import { apiRequest, getApiUrl } from '../../utils/api';
import { getSnippets } from '../../utils/snippetGenerator';

const SNIPPET_TYPES = [
  { value: 'vanilla', label: 'HTML (vanilla)' },
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'node', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'php', label: 'PHP' },
  { value: 'curl', label: 'cURL' }
];

const UNAVAILABLE = [
  { title: 'SPA route changes', desc: 'Automatically record client-side navigations.' },
  { title: 'Custom event configuration', desc: 'Configure named events from the dashboard.' },
  { title: 'Exclude internal traffic', desc: 'Ignore visits from your team and test environments.' },
  { title: 'Bot & crawler filtering', desc: 'Drop automated traffic before storage.' },
  { title: 'Cross-domain tracking', desc: 'Follow visitors across multiple domains.' },
  { title: 'Debug mode', desc: 'Log raw payloads and see the last received event.' }
];

export default function TrackingSection({ project, user, onSaved }) {
  const { toast } = useToast();
  const [snippetType, setSnippetType] = useState('vanilla');
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState(null);
  const [savingStatus, setSavingStatus] = useState(false);

  const trackingId = project?.tracking_id;
  const isActive = project?.is_active !== false;

  const trackingUrl = useMemo(() => {
    if (!project) return '';
    const apiUrl = getApiUrl();
    if (apiUrl.startsWith('/')) {
      return `${window.location.protocol}//${window.location.host}${apiUrl}/track/${trackingId}`;
    }
    return `${apiUrl}/track/${trackingId}`;
  }, [project, trackingId]);

  const snippet = useMemo(() => {
    if (!project) return '';
    const snippets = getSnippets({ trackingId, trackingUrl, user, project });
    return snippets[snippetType] || '';
  }, [project, trackingId, trackingUrl, user, snippetType]);

  useEffect(() => {
    setVerification(null);
  }, [project?.id]);

  if (!project) return null;

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const data = await apiRequest(`/projects/${project.id}/verify`);
      setVerification(data);
      toast({
        title: data.verified ? 'Installation verified' : 'No events received yet',
        tone: data.verified ? 'success' : 'warning'
      });
    } catch (err) {
      toast({ title: err.message || 'Verification failed', tone: 'error' });
    } finally {
      setVerifying(false);
    }
  };

  const handleToggleTracking = async (next) => {
    setSavingStatus(true);
    try {
      await apiRequest(`/projects/${project.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: next })
      });
      await onSaved?.();
      toast({ title: next ? 'Tracking resumed' : 'Tracking paused', tone: 'success' });
    } catch (err) {
      toast({ title: err.message || 'Failed to update tracking', tone: 'error' });
    } finally {
      setSavingStatus(false);
    }
  };

  const lastSeen = verification?.lastSeen
    ? new Date(verification.lastSeen).toLocaleString()
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHead>
          <div>
            <CardTitle>Tracking status</CardTitle>
            <CardSub>Live state of your analytics ingestion</CardSub>
          </div>
          <div className="card-actions">
            <Badge tone={isActive ? 'success' : 'warning'}>
              {isActive ? 'Active' : 'Paused'}
            </Badge>
          </div>
        </CardHead>
        <CardBody className="divide-y divide-border">
          <SettingRow
            title="Enable tracking"
            description="When paused, the tracking endpoint stops accepting events for this project."
            control={
              <Switch
                checked={isActive}
                disabled={savingStatus}
                onChange={handleToggleTracking}
                label="Enable tracking"
              />
            }
          />
          <SettingRow
            title="Installation"
            description={
              verification
                ? verification.message
                : 'Verify that the snippet is sending real events.'
            }
            control={
              <Button variant="outline" icon="refresh" loading={verifying} onClick={handleVerify}>
                Verify installation
              </Button>
            }
          >
            {verification?.verified ? (
              <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground">
                <span>Page views: <strong>{verification.views}</strong></span>
                <span>Visitors: <strong>{verification.visitors}</strong></span>
                {lastSeen ? <span>Last event: {lastSeen}</span> : null}
              </div>
            ) : null}
          </SettingRow>
        </CardBody>
      </Card>

      <Card>
        <CardHead>
          <div>
            <CardTitle>Installation snippet</CardTitle>
            <CardSub>Add this to every page you want to measure</CardSub>
          </div>
          <div className="card-actions">
            <Select
              aria-label="Snippet language"
              value={snippetType}
              onChange={(e) => setSnippetType(e.target.value)}
              options={SNIPPET_TYPES}
            />
          </div>
        </CardHead>
        <CardBody className="space-y-4">
          <CodeBlock
            lang={snippetType === 'vanilla' ? 'html' : 'javascript'}
            code={snippet}
            action={<CopyButton value={snippet} label="Copy snippet" />}
          />
          <div className="field">
            <span className="label">Tracking ID</span>
            <div className="input-group">
              <input className="input" value={trackingId || ''} readOnly />
              <CopyButton value={trackingId || ''} label="Copy tracking ID" />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHead>
          <div>
            <CardTitle>Advanced tracking</CardTitle>
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
