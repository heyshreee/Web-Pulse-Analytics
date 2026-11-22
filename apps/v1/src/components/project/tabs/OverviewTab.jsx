import { Eye, Users, Database, Activity, Smartphone, Tablet, Monitor, ChevronRight, Search } from 'lucide-react';
import AnimatedNumber from '../../AnimatedNumber';

export default function OverviewTab({ stats, overviewStats, onShowActivity }) {
  return (
    <div className="space-y-3 font-sans">
      {/* Unified 4-Column KPI Bar */}
      <div className="wp-panel min-h-[82px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--wp-border-default)] bg-[var(--wp-bg-surface)]">
        {/* Total Views */}
        <div className="p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[var(--wp-text-secondary)]">Total views</span>
            <Eye className="h-3.5 w-3.5 text-[var(--wp-text-muted)]" />
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-tight text-[var(--wp-text-primary)] tabular-nums font-mono">
              <AnimatedNumber end={stats?.total_views || 0} duration={1.2} />
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[var(--wp-text-muted)] font-mono">
              <span className="wp-live-dot" />
              <span>Live feed</span>
            </div>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[var(--wp-text-secondary)]">Unique visitors</span>
            <Users className="h-3.5 w-3.5 text-[var(--wp-text-muted)]" />
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-tight text-[var(--wp-text-primary)] tabular-nums font-mono">
              <AnimatedNumber end={overviewStats.uniqueVisitors || 0} duration={1.2} />
            </div>
            <p className="mt-1 text-[11px] text-[var(--wp-text-muted)] font-mono">Last 30-day window</p>
          </div>
        </div>

        {/* Active Now */}
        <div className="p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[var(--wp-text-secondary)]">Active now</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--wp-status-live)]" />
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-semibold tracking-tight text-[var(--wp-text-primary)] tabular-nums font-mono">
                <AnimatedNumber end={overviewStats.realTimeVisitors || 0} duration={1.0} />
              </div>
              <span className="text-xs text-[var(--wp-status-live)] font-mono">active</span>
            </div>
            <p className="mt-1 text-[11px] text-[var(--wp-text-muted)] font-mono">Real-time synchronized</p>
          </div>
        </div>

        {/* Storage Used */}
        <div className="p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[var(--wp-text-secondary)]">Storage used</span>
            <Database className="h-3.5 w-3.5 text-[var(--wp-text-muted)]" />
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-tight text-[var(--wp-text-primary)] tabular-nums font-mono">
              {stats?.storageUsed < 1024 * 1024
                ? `${(stats?.storageUsed / 1024 || 0).toFixed(1)} KB`
                : stats?.storageUsed < 1024 * 1024 * 1024
                  ? `${((stats?.storageUsed || 0) / (1024 * 1024)).toFixed(1)} MB`
                  : `${((stats?.storageUsed || 0) / (1024 * 1024 * 1024)).toFixed(2)} GB`
              }
            </div>
            <p className="mt-1 text-[11px] text-[var(--wp-text-muted)] font-mono">Used of allocated quota</p>
          </div>
        </div>
      </div>

      {/* 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Recent Activity */}
        <div className="wp-panel flex flex-col min-h-[380px]">
          <div className="wp-panel-header">
            <span className="wp-title-card">Live Activity Feed</span>
            <button
              onClick={onShowActivity}
              className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors font-mono"
            >
              Examine All <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {overviewStats.recentActivity?.slice(0, 7).map((activity, i) => {
              const getDeviceIcon = (device) => {
                const type = (device || 'desktop').toLowerCase();
                if (type === 'mobile') return <Smartphone className="h-3 w-3" />;
                if (type === 'tablet') return <Tablet className="h-3 w-3" />;
                return <Monitor className="h-3 w-3" />;
              };

              return (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-line last:border-b-0">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-ink shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-medium text-ink truncate" title={activity.title || 'Untitled'}>
                        {activity.title || 'Untitled Interaction'}
                      </p>
                      <span className="text-[10px] text-ink-muted font-mono tabular-nums shrink-0">
                        {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-ink-muted font-mono">
                      <span className="flex items-center gap-1">
                        {getDeviceIcon(activity.device)} {activity.device || 'Desktop'}
                      </span>
                      <span>•</span>
                      <span className="truncate text-ink-secondary">{activity.path}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {(!overviewStats.recentActivity || overviewStats.recentActivity.length === 0) && (
              <div className="flex flex-col items-center justify-center h-48 text-ink-muted">
                <Activity className="h-6 w-6 mb-2 opacity-40" />
                <p className="text-xs font-mono">Waiting for pulses...</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="wp-panel flex flex-col min-h-[380px]">
          <div className="wp-panel-header">
            <span className="wp-title-card">Ingress Sources</span>
            <span className="text-[10px] text-ink-muted font-mono">Sorted by pulse volume</span>
          </div>
          <div className="p-4 space-y-4 flex-1">
            {overviewStats.topReferrers?.map((referrer, i) => {
              const maxVal = overviewStats.topReferrers[0]?.value || 1;
              const pct = Math.min((referrer.value / maxVal) * 100, 100);
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs items-baseline gap-2">
                    <span className="text-ink font-medium truncate" title={referrer.name}>{referrer.name}</span>
                    <span className="text-ink-secondary font-mono text-[11.5px] tabular-nums shrink-0">
                      {referrer.value.toLocaleString()} <span className="text-ink-muted">pulses</span>
                    </span>
                  </div>
                  <div className="wp-meter-track">
                    <div
                      className="wp-meter-bar"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {(!overviewStats.topReferrers || overviewStats.topReferrers.length === 0) && (
              <div className="flex flex-col items-center justify-center h-48 text-ink-muted">
                <Search className="h-6 w-6 mb-2 opacity-40" />
                <p className="text-xs font-mono">No ingress data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
