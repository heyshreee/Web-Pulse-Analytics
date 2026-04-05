import { Eye, Users, Database, Activity, Smartphone, Tablet, Monitor, ChevronRight, Search } from 'lucide-react';

export default function OverviewTab({ stats, overviewStats, onShowActivity, onShowPages, onRefresh }) {
  return (
    <div className="space-y-8 pb-20">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[2rem] p-8 shadow-sm transition-all hover:shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Total Pulses</h3>
            <Eye className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{stats?.total_views?.toLocaleString() || 0}</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Live Feed
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[2rem] p-8 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Unique Entities</h3>
            <Users className="h-5 w-5 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{overviewStats.uniqueVisitors?.toLocaleString() || 0}</span>
          </div>
          <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Last 30 day window</p>
        </div>

        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-blue-500/30 rounded-[2rem] p-8 shadow-xl shadow-blue-500/5 relative overflow-hidden ring-1 ring-blue-500/10 transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em]">Active Now</h3>
            <div className="flex h-2.5 w-2.5 relative">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm">
                {overviewStats.realTimeVisitors || 0}
            </span>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Live</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-4 font-black uppercase tracking-widest opacity-60">Synchronized real-time</p>
        </div>

        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[2rem] p-8 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Storage Load</h3>
            <Database className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              {stats?.storageUsed < 1024 * 1024
                ? `${(stats?.storageUsed / 1024).toFixed(1)} KB`
                : stats?.storageUsed < 1024 * 1024 * 1024
                  ? `${(stats?.storageUsed / (1024 * 1024)).toFixed(1)} MB`
                  : `${(stats?.storageUsed / (1024 * 1024 * 1024)).toFixed(2)} GB`
              }
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest opacity-60">used</span>
          </div>
          <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Relational data overhead</p>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[2rem] p-8 flex flex-col shadow-sm min-h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">Live Activity Feed</h3>
            <button 
              onClick={onShowActivity} 
              className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 px-4 py-2 rounded-xl transition-all uppercase tracking-widest border border-blue-500/10"
            >
              Examine All
            </button>
          </div>
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {overviewStats.recentActivity?.slice(0, 7).map((activity, i) => {
              const getDeviceIcon = (device) => {
                const type = (device || 'desktop').toLowerCase();
                if (type === 'mobile') return <Smartphone className="h-3.5 w-3.5" />;
                if (type === 'tablet') return <Tablet className="h-3.5 w-3.5" />;
                return <Monitor className="h-3.5 w-3.5" />;
              };

              return (
                <div key={i} className="flex gap-5 relative group">
                  <div className={`w-3.5 h-3.5 rounded-full mt-1 border-2 border-white dark:border-slate-900 z-10 flex-shrink-0 transition-transform group-hover:scale-125 duration-300 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]`}></div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm text-slate-900 dark:text-white truncate font-black tracking-tight" title={activity.title || 'Unknown Page'}>
                        {activity.title || 'Untitled Interaction'}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black tabular-nums uppercase">
                         {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-60 flex items-center gap-1">
                          {getDeviceIcon(activity.device)} {activity.device || 'Desktop'}
                       </span>
                       <span className="text-[10px] text-blue-500 dark:text-blue-400 font-black truncate max-w-[200px] tracking-widest">{activity.path}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {(!overviewStats.recentActivity || overviewStats.recentActivity.length === 0) && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 opacity-30">
                <Activity className="h-10 w-10 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Waiting for pulses...</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[2rem] p-8 shadow-sm min-h-[450px] flex flex-col">
          <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] mb-10">Ingress Sources</h3>
          <div className="space-y-8 flex-1">
            {overviewStats.topReferrers?.map((referrer, i) => (
              <div key={i} className="group">
                <div className="flex justify-between text-[10px] mb-3 items-baseline">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: referrer.color }}></div>
                    <span className="text-slate-900 dark:text-white font-black uppercase tracking-tight truncate group-hover:text-blue-500 transition-colors" title={referrer.name}>{referrer.name}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-black tabular-nums tracking-widest">{referrer.value.toLocaleString()} <span className="opacity-40">PULSES</span></span>
                </div>
                <div className="h-2 bg-slate-50 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min((referrer.value / (overviewStats.topReferrers[0]?.value || 1)) * 100, 100)}%`, backgroundColor: referrer.color }}
                  ></div>
                </div>
              </div>
            ))}
            {(!overviewStats.topReferrers || overviewStats.topReferrers.length === 0) && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 opacity-30">
                <Search className="h-10 w-10 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">No ingress data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
