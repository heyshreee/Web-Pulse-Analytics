import React from 'react';
import { 
  Users, Activity, Eye, RefreshCw, 
  TrendingUp, Hash, Database, Globe, MapPin, 
  MousePointer, Clock, ChevronRight, Share2
} from 'lucide-react';
import TrafficTrendsChart from '../../TrafficTrendsChart';

export default function OverviewTab({ stats, overviewStats, loadingChart, timeRange, setTimeRange, onShowActivity, onShowPages, onRefresh }) {
  if (!stats) return null;

  const quickStats = [
    { label: 'Total Visitors', value: stats.total_visitors, icon: Users, color: 'blue' },
    { label: 'Total Pageviews', value: stats.total_pageviews, icon: Eye, color: 'green' },
    { label: 'Active Now', value: overviewStats.realTimeVisitors, icon: Activity, color: 'purple', live: true },
    { label: 'Avg. Session', value: overviewStats.avgSessionDuration, icon: Clock, color: 'yellow' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, i) => (
          <div key={i} className="bg-[#0C0E17] border border-[#1E293B] p-6 rounded-3xl flex items-center gap-5 hover:border-blue-500/30 transition-all group relative overflow-hidden">
            <div className={`p-3 bg-${stat.color}-500/10 rounded-2xl group-hover:scale-110 transition-transform border border-${stat.color}-500/10`}>
              <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1 italic">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                {stat.live && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                )}
              </h3>
            </div>
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 blur-3xl -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Telemetry Chart */}
        <div className="lg:col-span-2 bg-[#0C0E17] border border-[#1E293B] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-transparent"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <div>
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-3 italic uppercase">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Traffic Telemetry
              </h3>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Temporal visitor resonance</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-[#06080F] p-1.5 rounded-xl border border-[#1E293B]">
                {['24h', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 shadow-inner' : 'text-slate-600 hover:text-slate-300'}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <button 
                onClick={onRefresh}
                className="p-3 bg-[#06080F] border border-[#1E293B] rounded-xl text-slate-500 hover:text-blue-400 group/refresh transition-all"
                title="Resync Telemetry"
              >
                <RefreshCw className={`h-4 w-4 ${loadingChart ? 'animate-spin text-blue-500' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              </button>
            </div>
          </div>
          
          <div className="h-[350px] w-full relative">
            {loadingChart ? (
              <div className="h-full w-full flex items-center justify-center bg-[#06080F]/50 rounded-3xl border border-[#1E293B] border-dashed">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                    <Database className="absolute inset-0 m-auto h-6 w-6 text-blue-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 animate-pulse uppercase tracking-[0.3em] italic">Synchronizing Protocol...</p>
                </div>
              </div>
            ) : (
              <div className="chart-container">
                <TrafficTrendsChart data={overviewStats.trafficData} />
              </div>
            )}
          </div>
        </div>

        {/* Top Network Origins */}
        <div className="bg-[#0C0E17] border border-[#1E293B] rounded-[2.5rem] p-8 shadow-2xl relative group overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-3 italic uppercase">
              <Globe className="h-5 w-5 text-purple-500" />
              Top Origins
            </h3>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest bg-[#06080F] px-2 py-1 rounded border border-[#1E293B]">Nodes</span>
          </div>
          <div className="space-y-5">
            {overviewStats.topReferrers?.length > 0 ? (
              overviewStats.topReferrers.map((ref, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#06080F]/50 border border-transparent hover:border-[#1E293B] transition-all group/item">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#0B0D16] flex items-center justify-center border border-[#1E293B] text-[10px] font-black text-blue-500 shadow-inner">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="truncate pr-4">
                      <p className="text-xs font-bold text-slate-200 truncate group-hover/item:text-white transition-colors">{ref.source || 'Direct Direct Connection'}</p>
                      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Protocol Link</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-white italic">{ref.count?.toLocaleString()}</p>
                    <p className="text-[9px] text-blue-500 font-black uppercase tracking-tighter italic">Hits</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 opacity-30">
                <Hash className="h-10 w-10 text-slate-700 mb-4" />
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">No Traffic Indexed</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Real-time Telemetry Stream */}
        <div className="bg-[#0C0E17] border border-[#1E293B] rounded-[2.5rem] p-8 shadow-2xl group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-3 italic uppercase leading-none">
                <Activity className="h-5 w-5 text-blue-500" />
                Live Telemetry
              </h3>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">Real-time node ingress</p>
            </div>
            <button 
              onClick={onShowActivity}
              className="px-5 py-2.5 bg-[#06080F] border border-[#1E293B] rounded-xl text-[10px] font-black text-blue-500 hover:text-white hover:bg-blue-600 uppercase tracking-widest transition-all flex items-center gap-2 group/btn"
            >
              Master Log
              <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="space-y-4">
            {overviewStats.recentActivity?.slice(0, 5).map((activity, i) => (
              <div key={i} className="flex gap-5 p-4 rounded-2xl bg-[#06080F]/40 border border-transparent hover:border-[#1E293B] transition-all group">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-bold text-white truncate pr-4 group-hover:text-blue-400 transition-colors" title={activity.title}>{activity.title || 'Inbound Packet'}</p>
                    <span className="text-[9px] font-black text-slate-600 shrink-0 bg-[#0B0D16] px-2 py-0.5 rounded border border-[#1E293B] uppercase">
                      {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-blue-500" />
                      <span className="truncate max-w-[150px]">{activity.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Resource Index */}
        <div className="bg-[#0C0E17] border border-[#1E293B] rounded-[2.5rem] p-8 shadow-2xl group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-3 italic uppercase leading-none">
                <MousePointer className="h-5 w-5 text-green-500" />
                Resource Index
              </h3>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">High-density interaction nodes</p>
            </div>
            <button 
              onClick={onShowPages}
              className="px-5 py-2.5 bg-[#06080F] border border-[#1E293B] rounded-xl text-[10px] font-black text-blue-500 hover:text-white hover:bg-blue-600 uppercase tracking-widest transition-all flex items-center gap-2 group/btn"
            >
              Analyze All
              <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="space-y-4">
            {stats.top_pages?.slice(0, 5).map((page, i) => (
              <div key={i} className="flex items-center gap-5 p-4 rounded-2xl bg-[#06080F]/40 border border-transparent hover:border-[#1E293B] transition-all group overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-[10px] font-black text-slate-800 w-5 group-hover:text-green-500 transition-colors uppercase italic">{String(i + 1).padStart(2, '0')}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate italic" title={page.title}>{page.title || 'Unnamed Entity'}</p>
                  <p className="text-[9px] font-bold text-slate-600 truncate mt-1 uppercase tracking-tight">{page.url}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-white italic">{page.views?.toLocaleString()}</div>
                  <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest italic leading-none">Views</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
