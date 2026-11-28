import React from 'react';
import {
  ChevronRight, Smartphone, Tablet, Monitor, Search, RefreshCw
} from 'lucide-react';
import AnimatedNumber from '../../AnimatedNumber';
import TrafficTrendsChart from '../../TrafficTrendsChart';

export default function OverviewTab({
  stats,
  overviewStats,
  loadingChart,
  timeRange,
  setTimeRange,
  onShowActivity,
  onShowPages,
}) {
  const getDeviceIcon = (device) => {
    const type = (device || 'desktop').toLowerCase();
    if (type === 'mobile') return <Smartphone className="h-3 w-3" />;
    if (type === 'tablet') return <Tablet className="h-3 w-3" />;
    return <Monitor className="h-3 w-3" />;
  };

  return (
    <div className="space-y-3 font-sans">
      {/* 1. Unified 4-Column KPI Bar (Exact Dashboard Design) */}
      <div className="wp-panel grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[var(--wp-border-subtle)] bg-[var(--wp-bg-surface)] min-h-[82px]">
        {/* Col 1: Live Visitors */}
        <div className="p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px]">
            <span className="wp-label-section uppercase">Live visitors</span>
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-mono text-[var(--wp-text-secondary)]">
              <span className="wp-live-dot" />
              Live
            </span>
          </div>
          <div className="mt-1">
            <span className="wp-kpi-value text-2xl font-bold tracking-tight text-[var(--wp-text-primary)] tabular-nums font-mono">
              <AnimatedNumber end={overviewStats?.realTimeVisitors || 0} duration={1.0} />
            </span>
          </div>
          <div className="text-[11px] font-mono text-[var(--wp-text-muted)] mt-1 truncate">
            {overviewStats?.realTimeVisitors > 0 ? 'Concurrent active streams' : 'No active streams'}
          </div>
        </div>

        {/* Col 2: Total Events */}
        <div className="p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px]">
            <span className="wp-label-section uppercase">Total events</span>
            <span className="text-[10.5px] font-mono text-[var(--wp-text-muted)]">All-time</span>
          </div>
          <div className="mt-1">
            <span className="wp-kpi-value text-2xl font-bold tracking-tight text-[var(--wp-text-primary)] tabular-nums font-mono">
              <AnimatedNumber end={stats?.total_views || 0} duration={1.2} />
            </span>
          </div>
          <div className="text-[11px] font-mono text-[var(--wp-text-muted)] mt-1 truncate">
            Recorded telemetry hits
          </div>
        </div>

        {/* Col 3: Unique Visitors */}
        <div className="p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px]">
            <span className="wp-label-section uppercase">Unique visitors</span>
            <span className="text-[10.5px] font-mono text-[var(--wp-text-muted)]">{timeRange || '7d'}</span>
          </div>
          <div className="mt-1">
            <span className="wp-kpi-value text-2xl font-bold tracking-tight text-[var(--wp-text-primary)] tabular-nums font-mono">
              <AnimatedNumber end={overviewStats?.uniqueVisitors || 0} duration={1.2} />
            </span>
          </div>
          <div className="text-[11px] font-mono text-[var(--wp-text-muted)] mt-1 truncate">
            Distinct client fingerprints
          </div>
        </div>

        {/* Col 4: Storage Used */}
        <div className="p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px]">
            <span className="wp-label-section uppercase">Storage used</span>
            <span className="text-[10.5px] font-mono text-[var(--wp-text-muted)]">Quota</span>
          </div>
          <div className="mt-1">
            <span className="wp-kpi-value text-2xl font-bold tracking-tight text-[var(--wp-text-primary)] tabular-nums font-mono">
              {stats?.storageUsed < 1024 * 1024
                ? `${(stats?.storageUsed / 1024 || 0).toFixed(1)} KB`
                : stats?.storageUsed < 1024 * 1024 * 1024
                  ? `${((stats?.storageUsed || 0) / (1024 * 1024)).toFixed(1)} MB`
                  : `${((stats?.storageUsed || 0) / (1024 * 1024 * 1024)).toFixed(2)} GB`
              }
            </span>
          </div>
          <div className="text-[11px] font-mono text-[var(--wp-text-muted)] mt-1 truncate">
            Used of allocated quota
          </div>
        </div>
      </div>

      {/* 2. Studio Split Workspace (7 / 5 Columns, Exact Dashboard Structure) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[460px]">
        {/* Col 7: Traffic Momentum */}
        <div className="lg:col-span-7 wp-panel flex flex-col bg-[var(--wp-bg-surface)]">
          <div className="wp-panel-header">
            <div className="flex items-center gap-2">
              <span className="wp-title-card">Traffic momentum</span>
              <div className="flex items-center rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-surface)] p-0.5 text-xs font-mono ml-2">
                {['24h', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setTimeRange(range)}
                    className={`h-5 px-2 rounded text-[10.5px] font-mono transition-colors ${
                      timeRange === range
                        ? 'bg-[var(--wp-bg-active)] text-[var(--wp-text-primary)] font-medium'
                        : 'text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)]'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-[11px] font-mono text-[var(--wp-text-muted)]">
              {overviewStats?.trafficData?.length || 0} data points
            </div>
          </div>

          <div className="wp-studio-canvas flex-1 min-h-[380px] p-2.5 sm:p-3 flex flex-col justify-between">
            {overviewStats?.trafficData && overviewStats.trafficData.length > 0 ? (
              <div className="w-full h-full min-h-[360px]">
                <TrafficTrendsChart data={overviewStats.trafficData} loading={loadingChart} />
              </div>
            ) : (
              <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-6 space-y-2">
                <div className="text-xs font-mono text-[var(--wp-text-secondary)]">No traffic recorded yet</div>
                <p className="text-[11.5px] text-[var(--wp-text-muted)] max-w-sm">
                  Once your tracking snippet emits events, your momentum curve will render here in real time.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Col 5: Live Activity Feed */}
        <div className="lg:col-span-5 wp-panel flex flex-col bg-[var(--wp-bg-surface)]">
          <div className="wp-panel-header">
            <div className="flex items-center gap-2">
              <span className="wp-title-card">Live activity feed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-mono text-[var(--wp-text-secondary)]">
                <span className="wp-live-dot" />
                {overviewStats?.realTimeVisitors || 0} active
              </span>
              <button
                onClick={onShowActivity}
                className="text-[11px] font-mono text-[var(--wp-text-muted)] hover:text-[var(--wp-text-primary)] transition-colors inline-flex items-center gap-0.5 ml-1"
              >
                All <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="wp-studio-canvas flex-1 min-h-[380px] p-3 overflow-y-auto">
            {overviewStats?.recentActivity && overviewStats.recentActivity.length > 0 ? (
              <div className="space-y-1.5">
                {overviewStats.recentActivity.slice(0, 8).map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-surface)] text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="wp-live-dot shrink-0" />
                      <div className="min-w-0">
                        <p className="truncate font-mono text-[11px] text-[var(--wp-text-primary)]" title={activity.title || activity.path}>
                          {activity.title || activity.path || 'Page view'}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--wp-text-muted)] font-mono mt-0.5">
                          <span className="flex items-center gap-1">
                            {getDeviceIcon(activity.device)} {activity.device || 'Desktop'}
                          </span>
                          <span>•</span>
                          <span className="truncate">{activity.path}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--wp-text-muted)] shrink-0 ml-2">
                      {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full min-h-[360px] flex items-center justify-center p-4">
                <div className="w-full max-w-sm border border-dashed border-[var(--wp-border-strong)] rounded-lg p-4 text-center space-y-2 bg-[var(--wp-bg-surface)]/90 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-[var(--wp-text-secondary)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--wp-border-strong)] animate-pulse" />
                    <span>Ready to stream</span>
                  </div>
                  <p className="text-[11px] text-[var(--wp-text-muted)] leading-relaxed">
                    Waiting for pulse events from this domain.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Secondary Metrics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Ingress Sources */}
        <div className="wp-panel flex flex-col min-h-[260px] bg-[var(--wp-bg-surface)]">
          <div className="wp-panel-header">
            <span className="wp-title-card">Ingress sources</span>
            <span className="text-[10.5px] text-[var(--wp-text-muted)] font-mono">Sorted by volume</span>
          </div>
          <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
            {overviewStats?.topReferrers && overviewStats.topReferrers.length > 0 ? (
              overviewStats.topReferrers.map((referrer, i) => {
                const maxVal = overviewStats.topReferrers[0]?.value || 1;
                const pct = Math.min((referrer.value / maxVal) * 100, 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs items-baseline gap-2">
                      <span className="text-[var(--wp-text-primary)] font-medium truncate text-[11.5px]" title={referrer.name}>{referrer.name}</span>
                      <span className="text-[var(--wp-text-secondary)] font-mono text-[11px] tabular-nums shrink-0">
                        {referrer.value.toLocaleString()} <span className="text-[var(--wp-text-muted)]">pulses</span>
                      </span>
                    </div>
                    <div className="wp-meter-track">
                      <div className="wp-meter-bar" style={{ width: `${Math.max(pct, 2)}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-[var(--wp-text-muted)]">
                <Search className="h-5 w-5 mb-1.5 opacity-40" />
                <p className="text-xs font-mono">No ingress sources recorded</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Pages */}
        <div className="wp-panel flex flex-col min-h-[260px] bg-[var(--wp-bg-surface)]">
          <div className="wp-panel-header">
            <span className="wp-title-card">Top pages</span>
            <button
              onClick={onShowPages}
              className="inline-flex items-center gap-1 text-[11px] text-[var(--wp-text-muted)] hover:text-[var(--wp-text-primary)] transition-colors font-mono"
            >
              All Pages <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
            {overviewStats?.topPages && overviewStats.topPages.length > 0 ? (
              overviewStats.topPages.slice(0, 5).map((page, i) => {
                const maxViews = overviewStats.topPages[0]?.views || 1;
                const pct = Math.min(100, Math.round(((page.views || 0) / maxViews) * 100));
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs items-baseline gap-2">
                      <span className="text-[var(--wp-text-primary)] font-mono text-[11.5px] truncate" title={page.title || page.path}>
                        {page.title || page.path || '/'}
                      </span>
                      <span className="text-[var(--wp-text-secondary)] font-mono text-[11px] tabular-nums shrink-0">
                        {page.views?.toLocaleString()} <span className="text-[var(--wp-text-muted)]">views</span>
                      </span>
                    </div>
                    <div className="wp-meter-track">
                      <div className="wp-meter-bar" style={{ width: `${Math.max(pct, 2)}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-[var(--wp-text-muted)]">
                <Search className="h-5 w-5 mb-1.5 opacity-40" />
                <p className="text-xs font-mono">No page views recorded</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
