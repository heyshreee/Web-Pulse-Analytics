import { Eye, Users, Database, Activity, Smartphone, Tablet, Monitor, ChevronRight, Search } from 'lucide-react';

export default function OverviewTab({ stats, overviewStats, onShowActivity }) {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="card card-pad">
          <div className="flex items-center justify-between mb-6">
            <h3 className="eyebrow">Total Pulses</h3>
            <div className="p-3 rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <Eye className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{stats?.total_views?.toLocaleString() || 0}</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="badge-green">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Live Feed
            </span>
          </div>
        </div>

        <div className="card card-pad">
          <div className="flex items-center justify-between mb-6">
            <h3 className="eyebrow">Unique Entities</h3>
            <div className="p-3 rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{overviewStats.uniqueVisitors?.toLocaleString() || 0}</span>
          </div>
          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">Last 30 day window</p>
        </div>

        <div className="card card-pad">
          <div className="flex items-center justify-between mb-6">
            <h3 className="eyebrow">Active Now</h3>
            <div className="flex h-2.5 w-2.5 relative">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></div>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">
                {overviewStats.realTimeVisitors || 0}
            </span>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Live</span>
          </div>
          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">Synchronized real-time</p>
        </div>

        <div className="card card-pad">
          <div className="flex items-center justify-between mb-6">
            <h3 className="eyebrow">Storage Load</h3>
            <div className="p-3 rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <Database className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              {stats?.storageUsed < 1024 * 1024
                ? `${(stats?.storageUsed / 1024).toFixed(1)} KB`
                : stats?.storageUsed < 1024 * 1024 * 1024
                  ? `${(stats?.storageUsed / (1024 * 1024)).toFixed(1)} MB`
                  : `${(stats?.storageUsed / (1024 * 1024 * 1024)).toFixed(2)} GB`
              }
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-medium tracking-widest">used</span>
          </div>
          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">Relational data overhead</p>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card card-pad flex flex-col min-h-[420px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="section-title">Live Activity Feed</h3>
            <button
              onClick={onShowActivity}
              className="btn-ghost btn-sm"
            >
              Examine All <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-5 flex-1 overflow-y-auto pr-2">
            {overviewStats.recentActivity?.slice(0, 7).map((activity, i) => {
              const getDeviceIcon = (device) => {
                const type = (device || 'desktop').toLowerCase();
                if (type === 'mobile') return <Smartphone className="h-3.5 w-3.5" />;
                if (type === 'tablet') return <Tablet className="h-3.5 w-3.5" />;
                return <Monitor className="h-3.5 w-3.5" />;
              };

              return (
                <div key={i} className="flex gap-4 relative group">
                  <div className={`w-3 h-3 rounded-full mt-1.5 border-2 border-white dark:border-slate-900 z-10 flex-shrink-0 transition-transform group-hover:scale-125 duration-300 bg-violet-500`}></div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm text-slate-900 dark:text-white truncate font-medium tracking-tight" title={activity.title || 'Unknown Page'}>
                        {activity.title || 'Untitled Interaction'}
                      </p>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium tabular-nums">
                         {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                       <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          {getDeviceIcon(activity.device)} {activity.device || 'Desktop'}
                       </span>
                       <span className="text-xs text-violet-600 dark:text-violet-400 truncate max-w-[200px]">{activity.path}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {(!overviewStats.recentActivity || overviewStats.recentActivity.length === 0) && (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-600">
                <Activity className="h-10 w-10 mb-3" />
                <p className="text-xs font-medium">Waiting for pulses...</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="card card-pad min-h-[420px] flex flex-col">
          <h3 className="section-title mb-6">Ingress Sources</h3>
          <div className="space-y-6 flex-1">
            {overviewStats.topReferrers?.map((referrer, i) => (
              <div key={i} className="group">
                <div className="flex justify-between text-sm mb-2 items-baseline">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: referrer.color }}></div>
                    <span className="text-slate-900 dark:text-white font-medium truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" title={referrer.name}>{referrer.name}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold tabular-nums">{referrer.value.toLocaleString()} <span className="opacity-40 font-normal">Pulses</span></span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min((referrer.value / (overviewStats.topReferrers[0]?.value || 1)) * 100, 100)}%`, backgroundColor: referrer.color }}
                  ></div>
                </div>
              </div>
            ))}
            {(!overviewStats.topReferrers || overviewStats.topReferrers.length === 0) && (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-600">
                <Search className="h-10 w-10 mb-3" />
                <p className="text-xs font-medium">No ingress data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
