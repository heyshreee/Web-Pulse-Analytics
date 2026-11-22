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
    { name: 'Desktop', value: overviewStats.devices?.desktop || 0, icon: <Monitor className="h-4 w-4" />, color: '#8b5cf6' },
    { name: 'Mobile', value: overviewStats.devices?.mobile || 0, icon: <Smartphone className="h-4 w-4" />, color: '#10b981' },
    { name: 'Tablet', value: overviewStats.devices?.tablet || 0, icon: <Tablet className="h-4 w-4" />, color: '#f59e0b' },
  ];

  const totalDeviceSignals = deviceData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Telemetry Flow */}
        <div className="lg:col-span-2 card card-pad">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="section-title flex items-center gap-2.5">
                <TrendingUp className="h-5 w-5 text-violet-500" />
                Traffic Overview
              </h3>
              <p className="page-sub">Visitor activity over time</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="segmented">
                {['24h', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`segmented-btn ${timeRange === range ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <button
                onClick={onRefresh}
                className="icon-btn"
                title="Refresh Data"
              >
                <RefreshCw className={`h-4 w-4 ${loadingChart ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50 rounded-xl">
            <div className="h-[300px] w-full p-4">
              <TrafficTrendsChart data={overviewStats.trafficData} loading={loadingChart} />
            </div>
          </div>
        </div>

        {/* Real-time Pulse Ingress */}
        <div className="card card-pad flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Live Telemetry</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${overviewStats?.realTimeVisitors > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${overviewStats?.realTimeVisitors > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {overviewStats?.realTimeVisitors > 0 ? 'Active Stream' : 'Idle'}
            </span>
          </div>

          <div className="py-6 text-center">
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight tabular-nums">
              {overviewStats?.realTimeVisitors || 0}
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {overviewStats?.realTimeVisitors > 0 ? 'Active visitors on site' : 'No active pulses detected'}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <span>Socket Feed</span>
            <span className="font-medium text-slate-600 dark:text-slate-300">
              {overviewStats?.realTimeVisitors > 0 ? 'Synchronized' : 'Last seen moments ago'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <div className="lg:col-span-2 card card-pad">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="section-title flex items-center gap-2.5">
                <MousePointer className="h-5 w-5 text-violet-500" />
                Top Pages
              </h3>
              <p className="page-sub">Most visited content</p>
            </div>
            <button
              onClick={onViewAllPages}
              className="btn-ghost btn-sm"
            >
              View All
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-4 py-3 text-left font-semibold">Page Title</th>
                  <th className="px-4 py-3 text-right font-semibold">Views</th>
                  <th className="px-4 py-3 text-right font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {overviewStats?.topPages?.map((page, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate max-w-[300px] group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors block" title={page.title}>{page.title || 'Unknown Page'}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{page.views?.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end">
                        <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (page.views / (overviewStats?.topPages[0]?.views || 1)) * 100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!overviewStats?.topPages || overviewStats.topPages.length === 0) && (
              <div className="py-12 text-center">
                <Search className="h-8 w-8 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No page data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Devices */}
        <div className="card card-pad flex flex-col">
          <h3 className="section-title mb-6 flex items-center gap-2.5">
            <Monitor className="h-5 w-5 text-violet-500" />
            Devices
          </h3>

          <div className="flex-1 flex flex-col justify-center">
            <div className="h-[180px] w-full mb-6 relative">
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
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', fontWeight: 'bold', fontSize: '12px', padding: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#1e293b' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {totalDeviceSignals.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">Total</span>
              </div>
            </div>

            <div className="space-y-3">
              {deviceData.map((device, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50 transition-all hover:border-violet-500/30 group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${device.color}15`, color: device.color }}>
                      {device.icon}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{device.name}</span>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="text-sm text-slate-500 dark:text-slate-400 tabular-nums">{device.value.toLocaleString()}</div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white w-12 text-right tabular-nums">
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
