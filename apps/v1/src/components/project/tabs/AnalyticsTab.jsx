import React from 'react';
import {
  TrendingUp, RefreshCw, MousePointer,
  ChevronRight, Smartphone, Monitor, Tablet,
  Search,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import TrafficTrendsChart from '../../TrafficTrendsChart';
import { useTheme } from '../../../context/ThemeContext';

export default function AnalyticsTab({
  overviewStats, loadingChart, timeRange, setTimeRange,
  onViewAllPages, onRefresh
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const deviceData = [
    { name: 'Desktop', value: overviewStats.devices?.desktop || 0, icon: <Monitor className="h-3.5 w-3.5" />, color: isDark ? '#ededed' : '#0a0a0a' },
    { name: 'Mobile', value: overviewStats.devices?.mobile || 0, icon: <Smartphone className="h-3.5 w-3.5" />, color: isDark ? '#a1a1a1' : '#525252' },
    { name: 'Tablet', value: overviewStats.devices?.tablet || 0, icon: <Tablet className="h-3.5 w-3.5" />, color: isDark ? '#666666' : '#737373' },
  ];

  const totalDeviceSignals = deviceData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-3 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Telemetry Flow */}
        <div className="lg:col-span-2 wp-panel flex flex-col">
          <div className="wp-panel-header">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-ink-muted" />
              <span className="wp-title-card">Traffic Momentum</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded border border-line bg-surface p-0.5 text-xs font-mono">
                {['24h', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      timeRange === range
                        ? 'bg-hover text-ink font-semibold'
                        : 'text-ink-secondary hover:text-ink'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <button
                onClick={onRefresh}
                className="p-1 rounded border border-line text-ink-muted hover:text-ink hover:bg-hover transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingChart ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="wp-studio-canvas p-4 flex-1 min-h-[300px]">
            <TrafficTrendsChart data={overviewStats.trafficData} loading={loadingChart} />
          </div>
        </div>

        {/* Real-time Pulse Ingress */}
        <div className="wp-panel flex flex-col justify-between">
          <div className="wp-panel-header">
            <span className="wp-title-card">Live Telemetry</span>
            <div className="flex items-center gap-1.5 text-xs font-mono text-ink-secondary">
              <span className={`w-1.5 h-1.5 rounded-full ${overviewStats?.realTimeVisitors > 0 ? 'bg-emerald-500' : 'bg-ink-muted'}`} />
              <span>{overviewStats?.realTimeVisitors > 0 ? 'Active stream' : 'Idle'}</span>
            </div>
          </div>

          <div className="py-10 text-center">
            <div className="text-4xl font-semibold text-ink mb-1 tracking-tight tabular-nums font-mono">
              {overviewStats?.realTimeVisitors || 0}
            </div>
            <p className="text-xs text-ink-muted font-mono">
              {overviewStats?.realTimeVisitors > 0 ? 'Active visitors right now' : 'No active pulses detected'}
            </p>
          </div>

          <div className="p-3 border-t border-line flex items-center justify-between text-xs text-ink-muted font-mono">
            <span>Socket feed</span>
            <span className="text-ink-secondary">
              {overviewStats?.realTimeVisitors > 0 ? 'Synchronized' : 'Standby'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Top Pages */}
        <div className="lg:col-span-2 wp-panel flex flex-col">
          <div className="wp-panel-header">
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-ink-muted" />
              <span className="wp-title-card">Top Pages</span>
            </div>
            <button
              onClick={onViewAllPages}
              className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors font-mono"
            >
              View All
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-subtle text-ink-muted font-mono uppercase text-[10px] tracking-wider">
                  <th className="px-4 py-2.5 font-medium">Page Path</th>
                  <th className="px-4 py-2.5 text-right font-medium">Views</th>
                  <th className="px-4 py-2.5 text-right font-medium">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {overviewStats?.topPages?.map((page, i) => {
                  const maxViews = overviewStats?.topPages[0]?.views || 1;
                  const pct = Math.min(100, Math.round(((page.views || 0) / maxViews) * 100));
                  return (
                    <tr key={i} className="hover:bg-hover transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-medium text-ink truncate max-w-[320px] block font-mono" title={page.title}>
                          {page.title || 'Untitled'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-ink font-mono tabular-nums">{page.views?.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 wp-meter-track">
                            <div className="wp-meter-bar" style={{ width: `${Math.max(pct, 2)}%` }} />
                          </div>
                          <span className="w-8 text-[11px] text-ink-muted font-mono tabular-nums">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {(!overviewStats?.topPages || overviewStats.topPages.length === 0) && (
              <div className="py-12 text-center text-ink-muted">
                <Search className="h-6 w-6 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-mono">No page data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Devices */}
        <div className="wp-panel flex flex-col">
          <div className="wp-panel-header">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-ink-muted" />
              <span className="wp-title-card">Devices</span>
            </div>
            <span className="text-[10px] text-ink-muted font-mono tabular-nums">
              {totalDeviceSignals.toLocaleString()} signals
            </span>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-center">
            <div className="h-[160px] w-full mb-4 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
                      border: '1px solid var(--wp-border-default)',
                      borderRadius: '6px',
                      color: isDark ? '#ededed' : '#0a0a0a',
                      fontFamily: 'Geist Mono, monospace',
                      fontSize: '11px',
                      padding: '6px 10px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-semibold text-ink font-mono tabular-nums">
                  {totalDeviceSignals.toLocaleString()}
                </span>
                <span className="text-[10px] text-ink-muted font-mono">Total</span>
              </div>
            </div>

            <div className="space-y-2">
              {deviceData.map((device, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded border border-line bg-subtle text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-ink-secondary">{device.icon}</span>
                    <span className="text-ink font-medium">{device.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-ink-muted tabular-nums">{device.value.toLocaleString()}</span>
                    <span className="text-ink font-medium w-10 text-right tabular-nums">
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
