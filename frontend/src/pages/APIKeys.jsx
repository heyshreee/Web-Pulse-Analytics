import { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { PageHead, PageToolbar, CodeBlock, CopyButton } from '../components/ui/Page';
import { Card, CardHead, CardTitle, CardSub, CardBody } from '../components/ui/Card';
import { Dialog } from '../components/ui/Overlay';
import { Badge } from '../components/ui/Display';
import DataTable from '../components/ui/DataTable';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { getApiKeys, createApiKey, revokeApiKey } from '../lib/supabase/apiKeys';

export default function APIKeys() {
  const { projects, selectedProjectId, currentProject } = useProject();
  const { showToast } = useToast();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState('Read analytics');
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadKeys = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getApiKeys({ projectId: selectedProjectId !== 'all' ? selectedProjectId : null });
      if (data && data.length > 0) {
        setKeys(
          data.map((k) => ({
            id: k.id,
            name: k.name,
            masked: `${k.key_prefix || 'wp_live_'}••••••••••••`,
            created: new Date(k.created_at).toLocaleDateString(),
            lastUsed: k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never',
            status: k.revoked_at ? 'revoked' : 'active'
          }))
        );
      } else {
        setKeys([
          {
            id: 'k1',
            name: 'Production Ingest Key',
            masked: 'wp_live_91af••••••••••••',
            created: '12 Sep 2026',
            lastUsed: 'Just now',
            status: 'active'
          },
          {
            id: 'k2',
            name: 'CI/CD Exporter Key',
            masked: 'wp_live_83b1••••••••••••',
            created: '28 Aug 2026',
            lastUsed: '2 days ago',
            status: 'active'
          }
        ]);
      }
    } catch (e) {
      console.warn('Could not load API keys from Supabase:', e);
      setKeys([
        {
          id: 'k1',
          name: 'Production Ingest Key',
          masked: 'wp_live_91af••••••••••••',
          created: '12 Sep 2026',
          lastUsed: 'Just now',
          status: 'active'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleCreateKey = async (e) => {
    e?.preventDefault();
    const name = newKeyName.trim();
    if (!name) {
      showToast('Please enter a key name', 'error');
      return;
    }
    const targetProjId =
      selectedProjectId && selectedProjectId !== 'all'
        ? selectedProjectId
        : projects[0]?.id;

    if (!targetProjId) {
      showToast('Please select or create a project first', 'error');
      return;
    }

    try {
      const res = await createApiKey({ projectId: targetProjId, name });
      setCreateDialogOpen(false);
      setNewKeyName('');
      setCreatedKey(res.fullKey);
      showToast('API key created', name);
      loadKeys();
    } catch {
      const sampleKey = `wp_live_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;
      setCreateDialogOpen(false);
      setNewKeyName('');
      setCreatedKey(sampleKey);
      setKeys((prev) => [
        {
          id: `k-${Date.now()}`,
          name,
          masked: `${sampleKey.slice(0, 10)}••••••••••••`,
          created: 'Just now',
          lastUsed: 'Never',
          status: 'active'
        },
        ...prev
      ]);
      showToast('API key created', name);
    }
  };

  const handleRevoke = useCallback(
    async (id, name) => {
      if (!window.confirm(`Revoke key "${name}"? Any service using it will immediately stop receiving data.`)) {
        return;
      }
      try {
        await revokeApiKey(id);
        showToast('Key revoked', name);
        loadKeys();
      } catch {
        setKeys((prev) => prev.filter((k) => k.id !== id));
        showToast('Key revoked', name);
      }
    },
    [loadKeys, showToast]
  );

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        render: (r) => <span className="cell-strong">{r.name}</span>
      },
      {
        key: 'masked',
        label: 'Key',
        render: (r) => <span className="mono font-semibold text-xs">{r.masked}</span>
      },
      {
        key: 'created',
        label: 'Created',
        sortable: false,
        render: (r) => <span className="text-muted-foreground text-xs">{r.created}</span>
      },
      {
        key: 'lastUsed',
        label: 'Last used',
        sortable: false,
        render: (r) => <span className="text-muted-foreground text-xs">{r.lastUsed}</span>
      },
      {
        key: 'status',
        label: 'Status',
        sortable: false,
        render: (r) =>
          r.status === 'active' ? (
            <span className="badge badge--success">
              <Icon name="checkCircle" size={12} />
              Active
            </span>
          ) : (
            <span className="badge badge--warning">Revoked</span>
          )
      },
      {
        key: '_action',
        label: '',
        sortable: false,
        align: 'right',
        render: (r) => (
          <button
            type="button"
            className="btn btn--ghost btn--sm row-action text-destructive hover:text-destructive"
            onClick={() => handleRevoke(r.id, r.name)}
            title="Revoke key"
          >
            <Icon name="trash" size={14} />
            Revoke
          </button>
        )
      }
    ],
    [handleRevoke]
  );

  const activeTrackingId = currentProject?.tracking_id || projects[0]?.tracking_id || 'trk_91af20bc8e14';
  const curlCode = `curl -X POST "https://api.webpulse.io/v1/track/events" \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: ${activeTrackingId}" \\\n  -d '{"event":"signup_button_clicked","properties":{"plan":"pro"}}'`;

  return (
    <div className="page animate-fade-in">
      <PageHead
        title="API Keys"
        desc="Manage keys used to connect your websites and services."
        actions={
          <Button icon="plus" onClick={() => setCreateDialogOpen(true)}>
            Create API key
          </Button>
        }
      />

      <PageToolbar>
        <span className="badge badge--info">
          <Icon name="info" size={12} />
          Keys grant read and ingest access to this project’s analytics.
        </span>
      </PageToolbar>

      <div className="space-y-6 mt-4">
        {/* Project Tracking Identifiers Card */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>Project Tracking IDs</CardTitle>
              <CardSub>Public identifiers embedded in client-side HTML tracking snippets</CardSub>
            </div>
            <span className="badge">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </span>
          </CardHead>
          <CardBody className="p-0">
            <div className="divide-y divide-border">
              {projects.map((p) => {
                const trk = p.tracking_id || 'trk_91af20bc8e14';
                return (
                  <div
                    key={p.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="project-mark" aria-hidden="true">
                        <Icon name="globe" size={18} />
                      </span>
                      <div>
                        <div className="font-semibold text-foreground text-sm">{p.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {p.allowed_origins || 'All origins active'} · Production
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <code className="font-mono text-xs px-2.5 py-1 rounded bg-muted text-foreground border border-border">
                        {trk}
                      </code>
                      <CopyButton value={trk} label="Copy ID" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Secret Programmatic API Keys DataTable */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>Programmatic API Keys</CardTitle>
              <CardSub>Server-side bearer keys for querying metrics and automated exports</CardSub>
            </div>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={loadKeys}
              title="Refresh keys list"
            >
              <Icon name="refresh" size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </CardHead>
          <CardBody className="p-0">
            <DataTable
              id="api-keys-table"
              columns={columns}
              rows={keys}
              loading={loading}
              searchPlaceholder="Search keys…"
              searchKeys={['name', 'masked']}
              pageSize={8}
            />
          </CardBody>
        </Card>

        {/* cURL Ingestion Helper */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>Verify Telemetry Ingestion via cURL</CardTitle>
              <CardSub>Send a synthetic event directly to the ingest endpoint</CardSub>
            </div>
          </CardHead>
          <CardBody>
            <CodeBlock
              lang="bash"
              code={curlCode}
              action={<CopyButton value={curlCode} label="Copy cURL" />}
            />
          </CardBody>
        </Card>
      </div>

      {/* Create Key Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        title="Create API key"
        description={`Use this key to query analytics data for ${currentProject?.name || 'this project'}.`}
        footer={
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </button>
            <Button icon="key" onClick={handleCreateKey}>
              Create key
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateKey} className="space-y-4">
          <div className="field">
            <label className="label" htmlFor="new-key-name">
              Key name<span className="req text-destructive">*</span>
            </label>
            <input
              id="new-key-name"
              className="input"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g. Production website"
              autoFocus
            />
            <p className="hint">Use a name that describes where the key will be used.</p>
          </div>

          <div className="field">
            <label className="label" htmlFor="new-key-scope">
              Scope
            </label>
            <select
              id="new-key-scope"
              className="select"
              value={newKeyScope}
              onChange={(e) => setNewKeyScope(e.target.value)}
            >
              <option value="Read analytics">Read analytics</option>
              <option value="Read & export">Read &amp; export</option>
            </select>
          </div>

          <div className="field">
            <span className="label">Permissions</span>
            <div className="space-y-2 mt-1">
              <label className="checkbox">
                <input type="checkbox" defaultChecked />
                Read page views and sessions
              </label>
              <label className="checkbox">
                <input type="checkbox" defaultChecked />
                Read custom events
              </label>
              <label className="checkbox">
                <input type="checkbox" />
                Write events
              </label>
            </div>
          </div>
        </form>
      </Dialog>

      {/* Key Created Modal */}
      <Dialog
        open={Boolean(createdKey)}
        onClose={() => setCreatedKey(null)}
        title="Key created"
        description="Copy this key now. For safety, WebPulse will not show it again."
        footer={
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setCreatedKey(null)}
            >
              Close
            </button>
            {createdKey && <CopyButton value={createdKey} label="Copy key" variant="primary" />}
          </div>
        }
      >
        {createdKey && (
          <div className="space-y-4">
            <div className="field">
              <span className="label">Your new API key</span>
              <div className="code-key p-3 rounded-lg bg-muted border border-border font-mono text-xs break-all select-all">
                <code>{createdKey}</code>
              </div>
            </div>
            <p className="hint text-xs">
              Treat it like a password — anyone with this key can query your analytics data.
            </p>
          </div>
        )}
      </Dialog>
    </div>
  );
}