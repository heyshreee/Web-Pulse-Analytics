import { useState, useEffect, useCallback } from 'react';
import Icon from '../components/ui/Icon';
import { PageHead } from '../components/ui/Page';
import { Card, CardHead, CardTitle, CardSub, CardBody } from '../components/ui/Card';
import { TrafficChart } from '../components/ui/Charts';
import { FeedItem } from '../components/ui/Blocks';
import { LiveChip } from '../components/ui/Display';
import { BlockSkeleton } from '../components/ui/State';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { fetchAnalyticsData } from '../lib/dataService';
import { fmtInt } from '../lib/format';

export default function LiveActivity() {
  const { selectedProjectId } = useProject();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);

  const loadData = useCallback(async (showSpin = true) => {
    if (showSpin) setLoading(true);
    try {
      const res = await fetchAnalyticsData({ projectId: selectedProjectId, range: '24h' });
      setData(res);
    } catch {
      showToast('Failed to load live activity', 'error');
    } finally {
      if (showSpin) setLoading(false);
    }
  }, [selectedProjectId, showToast]);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(false), 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const liveSeries = (data?.trafficData || []).slice(-12).map((d) => ({
    name: d.name,
    views: d.views
  }));

  const stream = data?.liveActivity || [];

  return (
    <div className="page animate-fade-in">
      <PageHead
        title="Live Activity"
        desc="Monitor visitors and events happening on your website right now."
        meta={
          <div className="flex items-center gap-3">
            <LiveChip live label="Real-time stream" />
            <span className="text-xs text-muted-foreground">Polling every 5 seconds</span>
          </div>
        }
      />

      <div className="space-y-4 mt-4">
        {/* Live Visitors Card */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>Live visitors</CardTitle>
              <CardSub>Active traffic right now</CardSub>
            </div>
          </CardHead>
          <CardBody>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-4xl font-bold font-mono text-foreground">
                {data?.realTimeVisitors || 0}
              </span>
              <span className="live-chip" style={{ color: 'var(--live)' }}>
                <span className="live-dot" aria-hidden="true" />
                active sessions
              </span>
            </div>

            {loading ? (
              <BlockSkeleton height={180} />
            ) : (
              <TrafficChart data={liveSeries} dataKey="views" height={180} seriesLabel="Active visitors" />
            )}

            <div className="space-y-2 mt-4 pt-4 border-t border-border">
              <p className="eyebrow">Active pages</p>
              {(data?.pages || []).slice(0, 4).map((p) => (
                <div key={p.path} className="flex items-center justify-between text-xs py-1">
                  <span className="font-mono text-muted-foreground truncate">{p.path}</span>
                  <span className="font-mono font-semibold text-foreground">{fmtInt(p.views)}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Activity Stream Feed */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>Activity stream</CardTitle>
              <CardSub>Chronological event log across connected websites</CardSub>
            </div>
          </CardHead>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40">
                    <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="skeleton skeleton--text w-1/3" />
                      <div className="skeleton skeleton--text w-1/2 opacity-70" />
                    </div>
                    <div className="skeleton skeleton--text w-14" />
                  </div>
                ))}
              </div>
            ) : stream.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-sm">
                No recent activity recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {stream.slice(0, visibleCount).map((a) => (
                  <FeedItem
                    key={a.id}
                    icon={a.type === 'click' ? 'click' : a.type === 'identify' ? 'user' : 'eye'}
                    primary={
                      <span>
                        {a.verb}{' '}
                        {a.type === 'click' ? <strong>{a.label} on </strong> : null}
                        <code className="font-mono text-foreground font-semibold">{a.page}</code>
                      </span>
                    }
                    meta={`${a.flag} ${a.country} · ${a.device} · ${a.browser} · ${a.os}`}
                    time={`${a.secondsAgo || 12}s ago`}
                  />
                ))}
              </div>
            )}
          </CardBody>
          {stream.length > visibleCount ? (
            <div className="card-foot justify-center">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setVisibleCount((prev) => prev + 12)}
              >
                Load more activity
              </button>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
