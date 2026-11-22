import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Eye, Users, Calendar, Activity,
    TrendingUp, Globe, Monitor, Smartphone, Tablet
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { apiRequest } from '../utils/api';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';

export default function ShareReport() {
    const { shareToken } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const { theme } = useTheme();
    const isDark = theme !== 'light';

    useEffect(() => {
        const loadReport = async () => {
            try {
                const reportData = await apiRequest(`/projects/share/${shareToken}`);
                setData(reportData);
            } catch (err) {
                setError(err.message || 'Failed to load report');
            } finally {
                setLoading(false);
            }
        };

        loadReport();
    }, [shareToken]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-ink wp-studio-canvas p-6 max-w-5xl mx-auto space-y-4 animate-pulse">
                <div className="h-16 w-full bg-surface border border-line rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[1, 2, 3].map(n => <div key={n} className="h-20 bg-surface border border-line rounded-lg" />)}
                </div>
                <div className="h-[340px] w-full bg-surface border border-line rounded-lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black text-ink wp-studio-canvas flex items-center justify-center p-4">
                <div className="wp-panel w-full max-w-sm p-6 text-center">
                    <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10">
                        <Activity className="h-5 w-5 text-red-500" aria-hidden="true" />
                    </div>
                    <h1 className="text-sm font-semibold text-ink mb-1">Report Not Found</h1>
                    <p className="text-xs text-ink-muted mb-6 font-mono">{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-primary w-full h-8 text-xs">
                        Retry Loading
                    </button>
                </div>
            </div>
        );
    }

    const { project, stats } = data;
    const chartColor = isDark ? '#ededed' : '#0a0a0a';
    const gridColor = isDark ? '#1f1f1f' : '#e5e5e5';
    const textColor = isDark ? '#666666' : '#737373';
    const tooltipBg = isDark ? '#0a0a0a' : '#ffffff';
    const tooltipBorder = isDark ? '#222222' : '#e5e5e5';

    return (
        <div className="min-h-screen bg-black text-ink wp-studio-canvas flex flex-col justify-between">
            <div>
                {/* Header */}
                <header className="border-b border-line bg-surface/80 backdrop-blur-sm">
                    <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <Logo />
                            <span className="text-line">/</span>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-sm font-semibold text-ink">{project.name}</h1>
                                    <span className="px-1.5 py-0.5 rounded border border-line bg-subtle text-[10px] font-mono text-ink-muted">
                                        Public Report
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right text-xs font-mono text-ink-muted">
                            <span>Timezone: </span>
                            <span className="text-ink">{project.timezone}</span>
                        </div>
                    </div>
                </header>

                <main className="max-w-5xl mx-auto space-y-4 p-6">
                    {/* Unified 3-Column Metric Bar */}
                    <div className="wp-panel grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line">
                        <div className="p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-ink-secondary">Total Views</span>
                                <Eye className="h-3.5 w-3.5 text-ink-muted" />
                            </div>
                            <div className="text-2xl font-semibold tracking-tight text-ink font-mono tabular-nums">
                                {stats.total_views.toLocaleString()}
                            </div>
                        </div>

                        <div className="p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-ink-secondary">Unique Visitors</span>
                                <Users className="h-3.5 w-3.5 text-ink-muted" />
                            </div>
                            <div className="text-2xl font-semibold tracking-tight text-ink font-mono tabular-nums">
                                {stats.uniqueVisitors.toLocaleString()}
                            </div>
                        </div>

                        <div className="p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-ink-secondary">Current Month</span>
                                <Calendar className="h-3.5 w-3.5 text-ink-muted" />
                            </div>
                            <div className="text-2xl font-semibold tracking-tight text-ink font-mono tabular-nums">
                                {stats.current_month_views.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Traffic Trends */}
                    <div className="wp-panel flex flex-col">
                        <div className="wp-panel-header">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-ink-muted" />
                                <span className="wp-title-card">Traffic Momentum</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-mono text-ink-secondary">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Live Telemetry</span>
                            </div>
                        </div>
                        <div className="wp-studio-canvas p-4 h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={chartColor} stopOpacity={0.12} />
                                            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="2 4" stroke={gridColor} vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke={textColor}
                                        fontSize={10}
                                        fontFamily="Geist Mono, monospace"
                                        tickLine={false}
                                        axisLine={false}
                                        dy={8}
                                    />
                                    <YAxis
                                        stroke={textColor}
                                        fontSize={10}
                                        fontFamily="Geist Mono, monospace"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: tooltipBg,
                                            borderColor: tooltipBorder,
                                            borderRadius: '6px',
                                            borderWidth: '1px',
                                            boxShadow: 'none',
                                            fontFamily: 'Geist Mono, monospace',
                                            fontSize: '11px',
                                            padding: '6px 10px',
                                            color: chartColor
                                        }}
                                        itemStyle={{ color: chartColor }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="views"
                                        stroke={chartColor}
                                        strokeWidth={1.75}
                                        fillOpacity={1}
                                        fill="url(#colorViews)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {/* Top Referrers */}
                        <div className="wp-panel flex flex-col">
                            <div className="wp-panel-header">
                                <span className="wp-title-card">Top Referrers</span>
                                <span className="text-[10px] text-ink-muted font-mono">External ingress</span>
                            </div>
                            <div className="p-4 space-y-3.5 flex-1">
                                {stats.topReferrers?.map((referrer, i) => {
                                    const maxVal = stats.topReferrers[0]?.value || 1;
                                    const pct = Math.min((referrer.value / maxVal) * 100, 100);
                                    return (
                                        <div key={i} className="space-y-1.5">
                                            <div className="flex justify-between text-xs items-baseline gap-2">
                                                <span className="text-ink font-medium truncate">{referrer.name}</span>
                                                <span className="text-ink-secondary font-mono text-[11px] tabular-nums">
                                                    {referrer.value.toLocaleString()} views
                                                </span>
                                            </div>
                                            <div className="wp-meter-track">
                                                <div
                                                    className="wp-meter-bar"
                                                    style={{ width: `${Math.max(pct, 2)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!stats.topReferrers || stats.topReferrers.length === 0) && (
                                    <div className="py-12 text-center text-ink-muted">
                                        <Globe className="mx-auto mb-2 h-6 w-6 opacity-40" aria-hidden="true" />
                                        <p className="text-xs font-mono">No referrer data available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Device Breakdown */}
                        <div className="wp-panel flex flex-col">
                            <div className="wp-panel-header">
                                <span className="wp-title-card">Device Breakdown</span>
                                <span className="text-[10px] text-ink-muted font-mono">User agent distribution</span>
                            </div>
                            <div className="p-4 space-y-2 flex-1">
                                {stats.deviceStats?.map((device, i) => {
                                    const pct = stats.total_views > 0 ? ((device.value / stats.total_views) * 100).toFixed(0) : 0;
                                    return (
                                        <div key={i} className="flex items-center justify-between p-2.5 rounded border border-line bg-surface text-xs">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-1.5 rounded border border-line bg-subtle text-ink-muted">
                                                    {device.name.toLowerCase() === 'desktop' ? <Monitor className="h-3.5 w-3.5" /> :
                                                        device.name.toLowerCase() === 'mobile' ? <Smartphone className="h-3.5 w-3.5" /> :
                                                            <Tablet className="h-3.5 w-3.5" />}
                                                </div>
                                                <span className="font-medium text-ink">{device.name}</span>
                                            </div>
                                            <span className="font-mono text-ink font-semibold tabular-nums">
                                                {pct}%
                                            </span>
                                        </div>
                                    );
                                })}
                                {(!stats.deviceStats || stats.deviceStats.length === 0) && (
                                    <div className="py-12 text-center text-ink-muted">
                                        <Monitor className="mx-auto mb-2 h-6 w-6 opacity-40" aria-hidden="true" />
                                        <p className="text-xs font-mono">No device data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <footer className="border-t border-line py-4 mt-8 bg-surface">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 px-6 text-xs text-ink-muted font-mono">
                    <p>WebPulse Analytics · Public telemetry report</p>
                    <p>© {new Date().getFullYear()} WebPulse Analytics</p>
                </div>
            </footer>
        </div>
    );
}
