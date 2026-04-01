import React from 'react';
import { Eye, Users, Database, Activity, Smartphone, Tablet, Monitor, ChevronRight } from 'lucide-react';
import WorldMap from './WorldMap';

export default function OverviewTab({ stats, overviewStats, onShowActivity, onShowPages, onRefresh }) {
  return (
    <div className="space-y-6 pb-20">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0B0D16] border border-[#1E293B] rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">Total Views</h3>
            <Eye className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{stats?.total_views?.toLocaleString() || 0}</span>
            <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">+12%</span>
          </div>
        </div>
        <div className="bg-[#0B0D16] border border-[#1E293B] rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">Unique Visitors</h3>
            <Users className="h-4 w-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{overviewStats.uniqueVisitors?.toLocaleString() || 0}</span>
            <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">+8%</span>
          </div>
        </div>
        <div className="bg-[#0B0D16] border border-[#1E293B] rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">Storage Used</h3>
            <Database className="h-4 w-4 text-green-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {stats?.storageUsed < 1024 * 1024
                ? `${(stats?.storageUsed / 1024).toFixed(1)} KB`
                : stats?.storageUsed < 1024 * 1024 * 1024
                  ? `${(stats?.storageUsed / (1024 * 1024)).toFixed(1)} MB`
                  : `${(stats?.storageUsed / (1024 * 1024 * 1024)).toFixed(2)} GB`
              }
            </span>
          </div>
        </div>
      </div>

      {/* Full-width Map Grid Row */}
      <div className="w-full bg-[#202530] border border-[#2D333D] rounded-xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 pb-2 gap-4">
          <h3 className="text-sm font-bold text-white tracking-wide">Global Interaction Map</h3>
          <div className="flex gap-4">
            <button className="text-[10px] uppercase font-bold text-slate-400 hover:text-white transition-colors tracking-widest">
              Export Report
            </button>
            <button className="text-[10px] uppercase font-bold text-blue-500 hover:text-blue-400 transition-colors tracking-widest">
              View Heatmap Detail
            </button>
          </div>
        </div>
        
        <div className="flex flex-col flex-1 p-6 pt-2 gap-6">
          <div className="flex-1 relative rounded-lg overflow-hidden border border-[#2D333D]/50 bg-[#0B0D16] min-h-[450px]">
            <WorldMap activityData={overviewStats.recentActivity || overviewStats.activityList || []} />
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 shrink-0 mt-4">
            <div className="flex flex-col">
               <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-4 tracking-widest border-b border-[#2D333D] pb-2">Top Origin 1</h4>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 truncate pr-2">google.com</span>
                  <span className="text-white font-bold">45%</span>
                </div>
            </div>
            <div className="flex flex-col">
               <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-4 tracking-widest border-b border-[#2D333D] pb-2">Top Origin 2</h4>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 truncate pr-2">github.com</span>
                  <span className="text-white font-bold">22%</span>
                </div>
            </div>
            <div className="flex flex-col">
               <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-4 tracking-widest border-b border-[#2D333D] pb-2">Top Origin 3</h4>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 truncate pr-2">twitter.com</span>
                  <span className="text-white font-bold">18%</span>
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
