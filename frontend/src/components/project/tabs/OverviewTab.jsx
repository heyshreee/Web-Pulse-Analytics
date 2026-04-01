import React from 'react';
import { Eye, Users, Database, Activity, Smartphone, Tablet, Monitor, ChevronRight } from 'lucide-react';
import WorldMap from './WorldMap';

export default function OverviewTab({ stats, overviewStats, onShowActivity, onShowPages, onRefresh }) {
  return (
    <div className="space-y-6 pb-20">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-[#0B0D16] border border-[#1E293B] rounded-xl p-6 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">Total Views</h3>
            <Eye className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{stats?.total_views?.toLocaleString() || 0}</span>
            <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Activity className="h-2 w-2" /> Live
            </span>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-blue-500/20 w-full">
             <div className="h-full bg-blue-500 w-1/3 animate-pulse"></div>
          </div>
        </div>

        <div className="bg-[#0B0D16] border border-[#1E293B] rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">Unique Visitors</h3>
            <Users className="h-4 w-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{overviewStats.uniqueVisitors?.toLocaleString() || 0}</span>
            <span className="text-xs font-medium text-slate-500">last 30d</span>
          </div>
        </div>

        <div className="bg-[#0B0D16] border border-[#3B82F6]/30 rounded-xl p-6 shadow-xl relative overflow-hidden ring-1 ring-blue-500/20 shadow-blue-500/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-blue-400 font-bold">Active Now</h3>
            <div className="flex h-2 w-2 relative">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></div>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                {overviewStats.realTimeVisitors || 0}
            </span>
            <span className="text-xs font-bold text-slate-400 tracking-wider">VISITORS</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-medium">Tracking live across all pages</p>
        </div>

        <div className="bg-[#0B0D16] border border-[#1E293B] rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">Data Storage</h3>
            <Database className="h-4 w-4 text-green-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {stats?.storageUsed < 1024 * 1024
                ? `${(stats?.storageUsed / 1024).toFixed(1)} KB`
                : stats?.storageUsed < 1024 * 1024 * 1024
                  ? `${(stats?.storageUsed / (1024 * 1024)).toFixed(1)} MB`
                  : `${(stats?.storageUsed / (1024 * 1024 * 1024)).toFixed(2)} GB`
              }
            </span>
            <span className="text-[10px] text-slate-500">used</span>
          </div>
        </div>
      </div>

      {/* Full-width Map Grid Row */}
      <div className="w-full bg-[#0F111A] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col group/map">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-8 pb-4 gap-4">
          <div className="flex items-center gap-4">
             <div className="p-2 bg-blue-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-blue-500" />
             </div>
             <div>
                <h3 className="text-lg font-bold text-white">Global Traffic Live</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Real-time visitor geographic distribution</p>
             </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-[#1E293B]/50 hover:bg-[#1E293B] rounded-lg text-[10px] uppercase font-bold text-slate-300 transition-all tracking-widest border border-[#1E293B]">
              Settings
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] uppercase font-bold transition-all tracking-widest shadow-lg shadow-blue-600/20">
              Refresh Map
            </button>
          </div>
        </div>
        
        <div className="flex flex-col flex-1 p-8 pt-4 gap-6">
          <div className="flex-1 relative rounded-2xl overflow-hidden border border-[#1E293B] bg-[#06080F] min-h-[500px] shadow-inner">
            <WorldMap activityData={overviewStats.recentActivity || overviewStats.activityList || []} />
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 shrink-0 mt-4">
            <div className="flex flex-col p-4 bg-[#0B0D16]/50 rounded-xl border border-[#1E293B]/50 hover:border-blue-500/30 transition-colors">
               <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest flex items-center justify-between">
                  Top Origin 
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
               </h4>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 truncate pr-2 font-medium">Google Ads</span>
                  <span className="text-white font-bold bg-blue-500/10 px-2 py-0.5 rounded text-[10px]">45%</span>
                </div>
            </div>
            <div className="flex flex-col p-4 bg-[#0B0D16]/50 rounded-xl border border-[#1E293B]/50 hover:border-purple-500/30 transition-colors">
               <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest flex items-center justify-between">
                  Secondary
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
               </h4>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 truncate pr-2 font-medium">Direct Traffic</span>
                  <span className="text-white font-bold bg-purple-500/10 px-2 py-0.5 rounded text-[10px]">22%</span>
                </div>
            </div>
            <div className="flex flex-col p-4 bg-[#0B0D16]/50 rounded-xl border border-[#1E293B]/50 hover:border-green-500/30 transition-colors">
               <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest flex items-center justify-between">
                  Social
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
               </h4>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 truncate pr-2 font-medium">Twitter / X</span>
                  <span className="text-white font-bold bg-green-500/10 px-2 py-0.5 rounded text-[10px]">18%</span>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-[#0B0D16] border border-[#1E293B] rounded-xl p-6 flex flex-col shadow-xl min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-white">Recent Activity</h3>
            <button 
              onClick={onShowActivity} 
              className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer flex items-center gap-1"
            >
              View All <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-0 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {overviewStats.recentActivity?.slice(0, 6).map((activity, i) => {
              const getDeviceIcon = (device) => {
                const type = (device || 'desktop').toLowerCase();
                if (type === 'mobile') return <Smartphone className="h-3 w-3" />;
                if (type === 'tablet') return <Tablet className="h-3 w-3" />;
                return <Monitor className="h-3 w-3" />;
              };

              return (
                <div key={i} className="flex gap-4 relative pb-5 last:pb-0 group">
                  {i !== Math.min((overviewStats.recentActivity?.length || 0)-1, 5) && (
                    <div className="absolute left-3 top-6 bottom-0 w-px bg-[#1E293B]"></div>
                  )}

                  <div className={`w-6 h-6 rounded-full z-10 flex-shrink-0 flex items-center justify-center border border-[#1E293B] ${i === 0 ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-[#06080F] text-slate-500'}`}>
                    {getDeviceIcon(activity.device)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-white truncate font-medium" title={activity.title || 'Unknown Page'}>
                        {activity.title || 'Unknown Page'}
                      </p>
                      <span className="text-[10px] text-slate-500 shrink-0">
                         {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{activity.site}{activity.path}</p>
                  </div>
                </div>
              );
            })}
            {(!overviewStats.recentActivity || overviewStats.recentActivity.length === 0) && (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                <Activity className="h-6 w-6 mb-2 opacity-30" />
                <p className="text-xs">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="bg-[#0B0D16] border border-[#1E293B] rounded-xl p-6 shadow-xl min-h-[400px]">
          <h3 className="text-base font-bold text-white mb-6">Top Referrers</h3>
          <div className="space-y-4">
            {overviewStats.topReferrers?.map((referrer, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white font-medium truncate pr-2" title={referrer.name}>{referrer.name}</span>
                  <span className="text-slate-400 whitespace-nowrap">{referrer.value.toLocaleString()} views ({Math.round((referrer.value / (overviewStats.total_views || 1)) * 100)}%)</span>
                </div>
                <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min((referrer.value / (overviewStats.topReferrers[0]?.value || 1)) * 100, 100)}%`, backgroundColor: referrer.color }}
                  ></div>
                </div>
              </div>
            ))}
            {(!overviewStats.topReferrers || overviewStats.topReferrers.length === 0) && (
              <p className="text-center text-slate-500 text-xs py-4">No referrer data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
