import React from 'react';
import { 
  Activity, TrendingUp, RefreshCw, MousePointer, 
  ChevronRight, Smartphone, Monitor, Tablet, Database, 
  Search, ShieldCheck
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer
} from 'recharts';
import TrafficTrendsChart from '../../TrafficTrendsChart';

export default function AnalyticsTab({ 
  overviewStats, loadingChart, timeRange, setTimeRange, 
  onViewAllPages, onRefresh 
}) {
  const deviceData = [
    { name: 'Desktop Node', value: overviewStats.devices?.desktop || 0, icon: <Monitor className="h-4 w-4" />, color: '#3b82f6' },
    { name: 'Mobile Link', value: overviewStats.devices?.mobile || 0, icon: <Smartphone className="h-4 w-4" />, color: '#10b981' },
    { name: 'Tablet Interface', value: overviewStats.devices?.tablet || 0, icon: <Tablet className="h-4 w-4" />, color: '#8b5cf6' },
  ];

  const totalDeviceSignals = deviceData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Telemetry Flow */}
        <div className="lg:col-span-2 bg-[#0C0E17] border border-[#1E293B] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-transparent"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <div>
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-3 italic uppercase">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Telemetry Flow
              </h3>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Protocol resonance over time</p>
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
                  <p className="text-[10px] font-black text-slate-500 animate-pulse uppercase tracking-[0.3em] italic">Resyncing Clusters...</p>
                </div>
              </div>
            ) : (
              <TrafficTrendsChart data={overviewStats.trafficData} />
            )}
          </div>
        </div>

        {/* Real-time Pulse Ingress */}
        <div className="bg-gradient-to-br from-blue-600/10 via-[#06080F] to-[#0C0E17] border border-blue-500/20 rounded-[2.5rem] p-10 flex flex-col justify-center items-center relative overflow-hidden group shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.1),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all duration-1000 group-hover:scale-125 group-hover:-rotate-12 translate-x-4 -translate-y-4">
            <Activity className="h-48 w-48 text-blue-400" />
          </div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] italic">Live Ingress</span>
            </div>
            
            <div className="text-[120px] font-black text-white mb-2 tracking-tighter drop-shadow-[0_0_30px_rgba(59,130,246,0.5)] italic leading-none">
              {overviewStats?.realTimeVisitors || 0}
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic mt-4">Active Protocol Nodes</p>
            
            <div className="mt-12 flex justify-center">
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent rounded-full blur-[1px]"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entity Interaction Matrix */}
        <div className="lg:col-span-2 bg-[#0C0E17] border border-[#1E293B] rounded-[2.5rem] p-8 shadow-2xl overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-3 italic uppercase leading-none">
                <MousePointer className="h-5 w-5 text-green-500" />
                Entity Interaction
              </h3>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1.5">High-frequency resource nodes</p>
            </div>
            <button 
              onClick={onViewAllPages}
              className="px-6 py-3 bg-[#06080F] border border-[#1E293B] rounded-2xl text-[10px] font-black text-blue-500 hover:text-white hover:bg-blue-600 uppercase tracking-[0.2em] transition-all flex items-center gap-3 group/btn italic shadow-xl"
            >
              Analyze All
              <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1E293B] text-[10px] font-black text-slate-700 uppercase tracking-widest italic">
                  <th className="pb-6 pl-4">Resource Identifier</th>
                  <th className="pb-6 text-right">Magnitude</th>
                  <th className="pb-6 text-right px-6">Resonance</th>
                  <th className="pb-6 text-right pr-4">Stability</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {overviewStats?.topPages?.map((page, i) => (
                  <tr key={i} className="border-b border-[#1E293B]/30 hover:bg-[#06080F]/80 transition-all group/row">
                    <td className="py-6 pl-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-black text-white italic truncate max-w-[300px] group-hover/row:text-blue-400 transition-colors uppercase leading-tight" title={page.title}>{page.title || 'Inert Entity'}</span>
                        <span className="text-[9px] font-bold text-slate-600 truncate max-w-[300px] uppercase tracking-tight">{page.url}</span>
                      </div>
                    </td>
                    <td className="py-6 text-right">
                      <span className="text-sm font-black text-white italic">{page.views?.toLocaleString()}</span>
                      <div className="text-[9px] font-black text-blue-500/50 uppercase tracking-tighter italic">Hits</div>
                    </td>
                    <td className="py-6 text-right px-6">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-300 italic group-hover/row:text-green-500 transition-colors">98.2%</span>
                        <div className="w-12 h-[2px] bg-[#1E293B] rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-green-500 w-[98%] shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 text-right pr-4">
                      <span className="px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20 text-[9px] font-black uppercase tracking-widest italic rounded">Stable</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!overviewStats?.topPages || overviewStats.topPages.length === 0) && (
              <div className="py-24 text-center opacity-20">
                <Search className="h-16 w-16 text-slate-600 mx-auto mb-6" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">No Network Data Indexed</p>
              </div>
            )}
          </div>
        </div>

        {/* Interface Topology Breakdown */}
        <div className="bg-[#0C0E17] border border-[#1E293B] rounded-[2.5rem] p-8 shadow-2xl group flex flex-col relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full -mr-16 -mb-16"></div>
          
          <h3 className="text-lg font-bold text-white mb-10 flex items-center gap-3 italic uppercase leading-none">
            <ShieldCheck className="h-5 w-5 text-yellow-500" />
            Node Topology
          </h3>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="h-[240px] w-full mb-10 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={95}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity outline-none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#06080F', border: '1px solid #1E293B', borderRadius: '16px', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-white italic">
                  {totalDeviceSignals.toLocaleString()}
                </span>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Total Signals</span>
              </div>
            </div>

            <div className="space-y-4">
              {deviceData.map((device, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#06080F]/50 border border-transparent hover:border-[#1E293B] transition-all group/stat">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl border border-[#1E293B] group-hover/stat:border-transparent transition-all" style={{ backgroundColor: `${device.color}10`, color: device.color }}>
                      {device.icon}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 group-hover/stat:text-white transition-colors uppercase tracking-widest italic">{device.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-white italic">
                      {Math.round((device.value / (totalDeviceSignals || 1)) * 100)}%
                    </span>
                    <div className="text-[9px] font-black text-blue-500 uppercase tracking-tighter italic">{device.value.toLocaleString()} Signals</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
