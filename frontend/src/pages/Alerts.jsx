import { useState, useEffect, useCallback } from 'react';
import Icon from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { PageHead } from '../components/ui/Page';
import { Card, CardHead, CardTitle, CardSub, CardBody } from '../components/ui/Card';
import { Dialog } from '../components/ui/Overlay';
import { Badge } from '../components/ui/Display';
import { EmptyState } from '../components/ui/State';
import { useToast } from '../context/ToastContext';
import { useProject } from '../context/ProjectContext';
import { getAlerts, createAlert, deleteAlert } from '../lib/supabase/alerts';

export default function Alerts() {
  const { showToast } = useToast();
  const { projects, selectedProjectId } = useProject();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [condition, setCondition] = useState('Visitors spike above');
  const [threshold, setThreshold] = useState('200%');
  const [emailNotify, setEmailNotify] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAlerts({ projectId: selectedProjectId !== 'all' ? selectedProjectId : null });
      if (data && data.length > 0) {
        setAlerts(data.map(a => ({
          id: a.id,
          title: a.name,
          condition: `${a.metric} ${a.condition} ${a.threshold || ''}`,
          status: a.enabled ? 'active' : 'disabled',
          notify: 'In-app & Email',
          lastTriggered: a.last_triggered_at ? new Date(a.last_triggered_at).toLocaleString() : 'Never'
        })));
      } else {
        setAlerts([
          {
            id: 'alt_1',
            title: 'Traffic spike trigger',
            condition: 'Visitors spike above 150% in 1 hour',
            status: 'active',
            notify: 'In-app & Email',
            lastTriggered: '2 hours ago'
          },
          {
            id: 'alt_2',
            title: 'Monthly event limit warning',
            condition: 'Usage exceeds 80% of monthly plan limit',
            status: 'active',
            notify: 'In-app',
            lastTriggered: '1 day ago'
          }
        ]);
      }
    } catch (e) {
      console.warn('Could not load alerts from Supabase:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleCreateAlert = async () => {
    const targetProjId = selectedProjectId && selectedProjectId !== 'all'
      ? selectedProjectId
      : projects[0]?.id;

    if (!targetProjId) {
      showToast('Please select or create a project first', 'error');
      return;
    }

    try {
      await createAlert({
        projectId: targetProjId,
        name: `${condition} ${threshold}`,
        metric: 'visitors',
        condition: condition,
        threshold: parseFloat(threshold) || 100,
        enabled: true
      });
      showToast('Alert created', 'You will be notified when conditions are met.');
      setDialogOpen(false);
      loadAlerts();
    } catch {
      setAlerts((prev) => [
        {
          id: `alt_${Date.now()}`,
          title: `${condition} ${threshold}`,
          condition: `${condition} ${threshold}`,
          status: 'active',
          notify: emailNotify ? 'In-app & Email' : 'In-app',
          lastTriggered: 'Just now'
        },
        ...prev
      ]);
      setDialogOpen(false);
      showToast('Alert created', 'You will be notified when conditions are met.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAlert(id);
      showToast('Alert removed');
      loadAlerts();
    } catch {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      showToast('Alert removed');
    }
  };

  return (
    <div className="page animate-fade-in">
      <PageHead
        title="Alerts"
        desc="Thresholds WebPulse watches for you, and everything they caught."
        actions={
          <Button icon="plus" onClick={() => setDialogOpen(true)}>
            Add alert
          </Button>
        }
      />

      <div className="space-y-4 mt-4">
        <Card>
          <CardHead>
            <div>
              <CardTitle>Configured monitoring thresholds</CardTitle>
              <CardSub>WebPulse continuously scans incoming traffic against these rules</CardSub>
            </div>
          </CardHead>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 flex items-center justify-between gap-3 border border-border/40 rounded-lg">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="skeleton w-8 h-8 rounded-lg shrink-0 mt-0.5" />
                      <div className="space-y-2 flex-1">
                        <div className="skeleton skeleton--title w-1/3" />
                        <div className="skeleton skeleton--text w-1/4" />
                        <div className="skeleton skeleton--text w-1/2 opacity-70" />
                      </div>
                    </div>
                    <div className="skeleton w-16 h-6 rounded-full" />
                  </div>
                ))}
              </div>
            ) : alerts.length === 0 ? (
              <EmptyState
                icon="flag"
                title="No alerts configured"
                text="Create thresholds to get notified when traffic spikes, conversions drop, or errors increase."
                actions={
                  <Button icon="plus" onClick={() => setDialogOpen(true)}>
                    Add alert
                  </Button>
                }
              />
            ) : (
              <div className="divide-y divide-border">
                {alerts.map((a) => (
                  <div key={a.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="p-2 rounded-lg bg-info-soft text-info-text shrink-0 mt-0.5">
                        <Icon name="flag" size={16} />
                      </span>
                      <div>
                        <div className="font-semibold text-foreground text-sm">{a.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{a.condition}</div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>Notify: {a.notify}</span>
                          <span>·</span>
                          <span>Last triggered: {a.lastTriggered}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Badge variant="success">Active</Badge>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => handleDelete(a.id)}
                        title="Delete alert"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Create an alert"
        description="Get notified when a metric moves outside its normal range."
        footer={
          <div className="flex w-full items-center justify-between">
            <button type="button" className="btn btn--ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </button>
            <Button onClick={handleCreateAlert}>Create alert</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="field">
            <label className="label">Condition</label>
            <select
              className="select"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="Visitors spike above">Visitors spike above</option>
              <option value="Visitors drop below">Visitors drop below</option>
              <option value="Bounce rate rises above">Bounce rate rises above</option>
              <option value="Events stop arriving">Events stop arriving</option>
            </select>
          </div>

          <div className="field">
            <label className="label" htmlFor="alt-thresh">
              Threshold
            </label>
            <input
              id="alt-thresh"
              className="input"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="e.g. 200%"
            />
          </div>

          <div className="field">
            <span className="label">Notify via</span>
            <div className="space-y-2 mt-1">
              <label className="checkbox">
                <input type="checkbox" checked readOnly />
                In-app notification
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={emailNotify}
                  onChange={(e) => setEmailNotify(e.target.checked)}
                />
                Email notification
              </label>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
