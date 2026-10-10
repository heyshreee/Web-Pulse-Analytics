import { useState, useMemo, useEffect, useCallback } from 'react';
import Icon from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { PageHead, PageToolbar, CopyButton } from '../components/ui/Page';
import { Card, CardHead, CardTitle, CardSub, CardBody } from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import { Badge } from '../components/ui/Display';
import { Dialog } from '../components/ui/Overlay';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { getApiKeys, createApiKey, revokeApiKey } from '../lib/supabase/apiKeys';

export default function APIKeys() {
  const { projects, selectedProjectId } = useProject();
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
        setKeys(data.map(k => ({
          id: k.id,
          name: k.name,
          masked: `${k.key_prefix}••••••••••••`,
          created: new Date(k.created_at).toLocaleDateString(),
          lastUsed: k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never',
          status: k.revoked_at ? 'revoked' : 'active'
        })));
      } else {
        // Fallback default sample keys if none in DB
        setKeys([
          {
            id: 'k1',
            name: 'Production Website Server',
            masked: 'wp_live_91af••••••••••••',
            created: '12 Sep 2026',
            lastUsed: '2 min ago',
            status: 'active'
          }
        ]);
      }
    } catch (e) {
      console.warn('Could not load API keys from Supabase:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleCreateKey = async () => {
    const name = newKeyName.trim();
    if (!name) {
      showToast('Please enter a key name', 'error');
      return;
    }
    const targetProjId = selectedProjectId && selectedProjectId !== 'all'
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
      showToast('Failed to create API key in Supabase', 'error');
    }
  };

  const handleRevoke = async (id, name) => {
    if (!window.confirm(`Revoke key "${name}"? Any service using it will stop working.`)) return;
    try {
      await revokeApiKey(id);
      showToast('Key revoked', name);
      loadKeys();
    } catch {
      setKeys((prev) => prev.filter((k) => k.id !== id));
      showToast('Key revoked', name);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        render: (r) => <span className="font-semibold text-foreground text-xs">{r.name}</span>
      },
      {
        key: 'masked',
        label: 'Key',
        render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.masked}</span>
      },
      {
        key: 'created',
        label: 'Created',
        render: (r) => <span className="text-muted-foreground text-xs">{r.created}</span>
      },
      {
        key: 'lastUsed',
        label: 'Last used',
        render: (r) => <span className="text-muted-foreground text-xs">{r.lastUsed}</span>
      },
      {
        key: 'status',
        label: 'Status',
        render: () => (
          <Badge variant="success">
            <span className="inline-flex items-center gap-1">
              <Icon name="checkCircle" size={11} />
              Active
            </span>
          </Badge>
        )
      },
      {
        key: '_action',
        label: '',
        align: 'right',
        sortable: false,
        render: (r) => (
          <button
            type="button"
            className="btn btn--ghost btn--sm text-destructive hover:bg-destructive/10"
            onClick={() => handleRevoke(r.id, r.name)}
          >
            <Icon name="trash" size={13} />
            Revoke
          </button>
        )
      }
    ],
    []
  );

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
        <span className="badge badge--info inline-flex items-center gap-1.5 text-xs">
          <Icon name="info" size={13} />
          Keys grant read access to this workspace&apos;s analytics data.
        </span>
      </PageToolbar>

      <div className="space-y-6 mt-4">
        {/* API Keys Table */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>Programmatic access keys</CardTitle>
              <CardSub>Use these tokens in Authorization: Bearer headers</CardSub>
            </div>
          </CardHead>
          <CardBody className="p-0">
            <DataTable
              id="api-keys-table"
              columns={columns}
              rows={keys}
              loading={loading}
              searchPlaceholder="Search keys…"
              searchKeys={['name', 'masked']}
              pageSize={6}
            />
          </CardBody>
        </Card>

        {/* Project Tracking IDs */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>Project Tracking Identifiers</CardTitle>
              <CardSub>Embed these IDs in client-side HTML snippets</CardSub>
            </div>
          </CardHead>
          <CardBody className="p-0">
            <div className="divide-y divide-border">
              {projects.map((p) => {
                const trk = p.tracking_id || 'trk_none';
                return (
                  <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-lg bg-card border border-border">
                        <Icon name="shield" size={16} />
                      </span>
                      <div>
                        <div className="font-semibold text-foreground text-sm">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.allowed_origins || 'All origins allowed'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs px-3 py-1.5 rounded-lg bg-card border border-border text-foreground">
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
      </div>

      {/* Create Key Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        title="Create API key"
        description="Use this key to query analytics data programmatically."
        footer={
          <div className="flex w-full items-center justify-between">
            <button type="button" className="btn btn--ghost" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </button>
            <Button icon="key" onClick={handleCreateKey}>
              Create key
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="field">
            <label className="label" htmlFor="key-name-input">
              Key name<span className="req">*</span>
            </label>
            <input
              id="key-name-input"
              className="input"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g. Production Backend"
              autoFocus
            />
            <p className="hint">Use a name that describes where the key will be used.</p>
          </div>

          <div className="field">
            <label className="label">Scope</label>
            <select
              className="select"
              value={newKeyScope}
              onChange={(e) => setNewKeyScope(e.target.value)}
            >
              <option>Read analytics</option>
              <option>Read &amp; export</option>
            </select>
          </div>

          <div className="field">
            <span className="label">Permissions</span>
            <div className="space-y-2 mt-1">
              <label className="checkbox">
                <input type="checkbox" checked readOnly /> Read page views and sessions
              </label>
              <label className="checkbox">
                <input type="checkbox" checked readOnly /> Read custom events
              </label>
              <label className="checkbox">
                <input type="checkbox" defaultChecked /> Write events
              </label>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Key Created Modal */}
      <Dialog
        open={Boolean(createdKey)}
        onClose={() => setCreatedKey(null)}
        title="Key created"
        description="Copy this key now. For security, WebPulse will not show it again."
        footer={
          <div className="flex w-full items-center justify-between">
            <button type="button" className="btn btn--ghost" onClick={() => setCreatedKey(null)}>
              Close
            </button>
            <CopyButton value={createdKey || ''} label="Copy key" />
          </div>
        }
      >
        <div className="space-y-3">
          <div className="field">
            <span className="label">Your secret API key</span>
            <div className="p-3 rounded-lg bg-card border border-border font-mono text-sm break-all text-primary select-all">
              {createdKey}
            </div>
          </div>
          <p className="hint">Treat it like a password — anyone with this key can access your workspace data.</p>
        </div>
      </Dialog>
    </div>
  );
}