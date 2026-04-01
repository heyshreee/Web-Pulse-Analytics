import React from 'react';
import {
  Activity, TrendingUp, RefreshCw, MousePointer,
  ChevronRight, Smartphone, Monitor, Tablet, Database,
  Search,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import TrafficTrendsChart from '../../TrafficTrendsChart';

export default function AnalyticsTab({
  overviewStats, loadingChart, timeRange, setTimeRange,
  onViewAllPages, onRefresh
}) {
  const deviceData = [
    { name: 'Desktop', value: overviewStats.devices?.desktop || 0, icon: <Monitor className="h-4 w-4" />, color: '#3b82f6' },
    { name: 'Mobile', value: overviewStats.devices?.mobile || 0, icon: <Smartphone className="h-4 w-4" />, color: '#10b981' },
    { name: 'Tablet', value: overviewStats.devices?.tablet || 0, icon: <Tablet className="h-4 w-4" />, color: '#8b5cf6' },
  ];

  const totalDeviceSignals = deviceData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Telemetry Flow */}
        <div className="lg:col-span-2 bg-[#0B0D16] border border-[#1E293B] rounded-xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Traffic Overview
              </h3>
              <p className="text-xs text-slate-400 mt-1">Visitor activity over time</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-[#06080F] p-1 rounded-md border border-[#1E293B]">
                {['24h', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${timeRange === range ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <button
                onClick={onRefresh}
                className="p-2 border border-[#1E293B] rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className={`h-4 w-4 ${loadingChart ? 'animate-spin text-blue-500' : ''}`} />
              </button>
            </div>
          </div>

          <div className="bg-[#06080F]/50 border border-[#1E293B]/50 rounded-xl p-6">
            <div className="h-[280px] w-full">
              <TrafficTrendsChart data={overviewStats.trafficData} loading={loadingChart} />
            </div>
          </div>
        </div>

        {/* Real-time Pulse Ingress */}
        <div className="bg-[#0B0D16] border border-[#1E293B] rounded-xl p-8 flex flex-col justify-center items-center shadow-xl">
          <div className="text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-semibold text-green-500">Live</span>
            </div>

            <div className="text-7xl font-bold text-white mb-2 tracking-tight">
              {overviewStats?.realTimeVisitors || 0}
            </div>
            <p className="text-xs text-slate-400 mt-4">Active Visitors Right Now</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <div className="lg:col-span-2 bg-[#0B0D16] border border-[#1E293B] rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MousePointer className="h-4 w-4 text-blue-500" />
                Top Pages
              </h3>
              <p className="text-xs text-slate-400 mt-1">Most visited content</p>
            </div>
            <button
              onClick={onViewAllPages}
              className="text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1"
            >
              View All
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1E293B] text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  <th className="pb-4 pl-2">Page Title</th>
                  <th className="pb-4 text-right">Views</th>
                  <th className="pb-4 text-right pr-2">Trend</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {overviewStats?.topPages?.map((page, i) => (
                  <tr key={i} className="border-b border-[#1E293B]/50 hover:bg-[#1E293B]/20 transition-colors">
                    <td className="py-4 pl-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-slate-200 truncate max-w-[300px]" title={page.title}>{page.title || 'Unknown Page'}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-xs font-medium text-slate-300">{page.views?.toLocaleString()}</span>
                    </td>
                    <td className="py-4 text-right pr-2">
                      <div className="flex flex-col items-end">
                        <div className="w-16 h-1 bg-[#1E293B] rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (page.views / (overviewStats?.topPages[0]?.views || 1)) * 100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!overviewStats?.topPages || overviewStats.topPages.length === 0) && (
              <div className="py-12 text-center">
                <Search className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No page data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Devices */}
        <div className="bg-[#0B0D16] border border-[#1E293B] rounded-xl p-6 flex flex-col shadow-xl">
          <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
            <Monitor className="h-4 w-4 text-blue-500" />
            Devices
          </h3>

          <div className="flex-1 flex flex-col justify-center">
            <div className="h-[180px] w-full mb-8 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0D16', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-white">
                  {totalDeviceSignals.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400">Total Visits</span>
              </div>
            </div>

            <div className="space-y-3">
              {deviceData.map((device, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#06080F]/50 border border-[#1E293B]/50">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md" style={{ backgroundColor: `${device.color}15`, color: device.color }}>
                      {device.icon}
                    </div>
                    <span className="text-xs font-semibold text-slate-300">{device.name}</span>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div className="text-xs text-slate-500">{device.value.toLocaleString()}</div>
                    <span className="text-xs font-bold text-white w-8 text-right">
                      {Math.round((device.value / (totalDeviceSignals || 1)) * 100)}%
                    </span>
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
