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
              <TrendingUp className="h-4 w-4 text-[var(--wp-text-muted)]" />
              <span className="wp-title-card">Traffic momentum</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-surface)] p-0.5 text-xs font-mono">
                {['24h', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`h-5 px-2 rounded text-[10.5px] font-mono transition-colors ${
                      timeRange === range
                        ? 'bg-[var(--wp-bg-active)] text-[var(--wp-text-primary)] font-medium'
                        : 'text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)]'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <button
                onClick={onRefresh}
                className="p-1 rounded border border-[var(--wp-border-default)] text-[var(--wp-text-muted)] hover:text-[var(--wp-text-primary)] hover:bg-[var(--wp-bg-hover)] transition-colors"
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
        <div className="wp-panel flex flex-col justify-between bg-[var(--wp-bg-surface)]">
          <div className="wp-panel-header">
            <span className="wp-title-card">Live telemetry</span>
            <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--wp-text-secondary)]">
              <span className={`w-1.5 h-1.5 rounded-full ${overviewStats?.realTimeVisitors > 0 ? 'bg-[var(--wp-status-live)]' : 'bg-[var(--wp-text-muted)]'}`} />
              <span>{overviewStats?.realTimeVisitors > 0 ? 'Active stream' : 'Idle'}</span>
            </div>
          </div>

          <div className="py-10 text-center">
            <div className="text-4xl font-semibold text-[var(--wp-text-primary)] mb-1 tracking-tight tabular-nums font-mono">
              {overviewStats?.realTimeVisitors || 0}
            </div>
            <p className="text-xs text-[var(--wp-text-muted)] font-mono">
              {overviewStats?.realTimeVisitors > 0 ? 'Active visitors right now' : 'No active pulses detected'}
            </p>
          </div>

          <div className="p-3 border-t border-[var(--wp-border-subtle)] flex items-center justify-between text-xs text-[var(--wp-text-muted)] font-mono">
            <span>Socket feed</span>
            <span className="text-[var(--wp-text-secondary)]">
              {overviewStats?.realTimeVisitors > 0 ? 'Synchronized' : 'Standby'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Top Pages */}
        <div className="lg:col-span-2 wp-panel flex flex-col bg-[var(--wp-bg-surface)]">
          <div className="wp-panel-header">
            <div className="flex items-center gap-2">
              <MousePointer className="h-3.5 w-3.5 text-[var(--wp-text-muted)]" />
              <span className="wp-title-card">Top Pages</span>
            </div>
            <button
              onClick={onViewAllPages}
              className="inline-flex items-center gap-1 text-xs text-[var(--wp-text-muted)] hover:text-[var(--wp-text-primary)] transition-colors font-mono"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--wp-border-subtle)] bg-[var(--wp-bg-subtle)] text-[var(--wp-text-muted)] font-mono uppercase text-[10px] tracking-wider">
                  <th className="px-3.5 py-2 font-medium">Page Path</th>
                  <th className="px-3.5 py-2 text-right font-medium">Views</th>
                  <th className="px-3.5 py-2 text-right font-medium">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--wp-border-subtle)]">
                {overviewStats?.topPages?.map((page, i) => {
                  const maxViews = overviewStats?.topPages[0]?.views || 1;
                  const pct = Math.min(100, Math.round(((page.views || 0) / maxViews) * 100));
                  return (
                    <tr key={i} className="hover:bg-[var(--wp-bg-hover)] transition-colors">
                      <td className="px-3.5 py-2.5">
                        <span className="font-medium text-[var(--wp-text-primary)] truncate max-w-[320px] block font-mono" title={page.title}>
                          {page.title || 'Untitled'}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <span className="text-[var(--wp-text-primary)] font-mono tabular-nums">{page.views?.toLocaleString()}</span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 wp-meter-track">
                            <div className="wp-meter-bar" style={{ width: `${Math.max(pct, 2)}%` }} />
                          </div>
                          <span className="w-8 text-[11px] text-[var(--wp-text-muted)] font-mono tabular-nums">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {(!overviewStats?.topPages || overviewStats.topPages.length === 0) && (
              <div className="py-10 text-center text-[var(--wp-text-muted)]">
                <Search className="h-5 w-5 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-mono">No page data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Devices */}
        <div className="wp-panel flex flex-col bg-[var(--wp-bg-surface)]">
          <div className="wp-panel-header">
            <div className="flex items-center gap-2">
              <Monitor className="h-3.5 w-3.5 text-[var(--wp-text-muted)]" />
              <span className="wp-title-card">Devices</span>
            </div>
            <span className="text-[10px] text-[var(--wp-text-muted)] font-mono tabular-nums">
              {totalDeviceSignals.toLocaleString()} signals
            </span>
          </div>

          <div className="p-3.5 flex-1 flex flex-col justify-center">
            <div className="h-[150px] w-full mb-3 relative min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={150} debounce={50}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={64}
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
                <span className="text-base font-medium text-[var(--wp-text-primary)] font-mono tabular-nums">
                  {totalDeviceSignals.toLocaleString()}
                </span>
                <span className="text-[10px] text-[var(--wp-text-muted)] font-mono uppercase tracking-wider">Total</span>
              </div>
            </div>

            <div className="space-y-1.5">
              {deviceData.map((device, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-surface)] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--wp-text-muted)]">{device.icon}</span>
                    <span className="text-[var(--wp-text-primary)] font-medium">{device.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-[var(--wp-text-muted)] tabular-nums">{device.value.toLocaleString()}</span>
                    <span className="text-[var(--wp-text-primary)] font-medium w-10 text-right tabular-nums">
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
