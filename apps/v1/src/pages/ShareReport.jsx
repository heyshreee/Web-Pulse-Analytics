import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Loader2, Eye, Users, Clock, Globe, Monitor, Activity,
    TrendingUp, Calendar, ArrowUpRight
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { apiRequest } from '../utils/api';
import TrafficTrendsChart from '../components/TrafficTrendsChart';
import Spinner from '../components/Spinner';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/Logo';
import { Tablet, Smartphone } from 'lucide-react';

export default function ShareReport() {
    const { shareToken } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

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
        return <Spinner />;
    }

    if (error) {
        return (
            <div className="mkt-shell flex min-h-screen items-center justify-center p-6">
                <div className="mkt-card w-full max-w-md p-10 text-center sm:p-12">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10">
                        <Activity className="h-8 w-8 text-red-400" aria-hidden="true" />
                    </div>
                    <h1 className="mkt-h3 mb-2">Report Not Found</h1>
                    <p className="mkt-body mb-8">{error}</p>
                    <button onClick={() => window.location.reload()} className="mkt-btn mkt-btn-primary mkt-btn-md">Retry Loading</button>
                </div>
            </div>
        );
    }

    const { project, stats } = data;

    return (
        <div className="mkt-shell">
            <div aria-hidden="true" className="mkt-grid-bg absolute inset-x-0 top-0 h-[420px]" />
            <div className="relative z-10">
                {/* Header */}
                <header className="border-b border-white/[0.07]">
                    <div className="mkt-container flex flex-wrap items-center justify-between gap-6 py-8 sm:py-10">
                        <div className="flex items-center gap-4 sm:gap-6">
                            <Logo />
                            <span aria-hidden="true" className="hidden h-10 w-px bg-white/[0.09] sm:block" />
                            <div>
                                <p className="mkt-eyebrow mb-1.5">
                                    Public Report
                                    <span aria-hidden="true" className="text-slate-600">/</span>
                                    {new Date(project.created_at).getFullYear()}
                                </p>
                                <h1 className="mkt-h3 !text-2xl sm:!text-3xl">{project.name}</h1>
                            </div>
                        </div>
                        <div className="hidden text-right sm:block">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Timezone</p>
                            <p className="mt-1 font-semibold tracking-tight text-slate-200">{project.timezone}</p>
                        </div>
                    </div>
                </header>

                <main className="mkt-container space-y-6 py-8 sm:py-12">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="mkt-card p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Total Views</h3>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                                    <Eye className="h-5 w-5 text-violet-300" aria-hidden="true" />
                                </div>
                            </div>
                            <span className="metric-num font-display text-3xl font-bold tracking-tight text-slate-100">{stats.total_views.toLocaleString()}</span>
                        </div>
                        <div className="mkt-card p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Unique Visitors</h3>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                                    <Users className="h-5 w-5 text-violet-300" aria-hidden="true" />
                                </div>
                            </div>
                            <span className="metric-num font-display text-3xl font-bold tracking-tight text-slate-100">{stats.uniqueVisitors.toLocaleString()}</span>
                        </div>
                        <div className="mkt-card p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Current Month</h3>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                                    <Calendar className="h-5 w-5 text-violet-300" aria-hidden="true" />
                                </div>
                            </div>
                            <span className="metric-num font-display text-3xl font-bold tracking-tight text-slate-100">{stats.current_month_views.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Traffic Trends */}
                    <div className="mkt-card p-6 sm:p-8">
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <h2 className="mkt-h4">Traffic Trends</h2>
                            <span className="mkt-chip">
                                <span className="mkt-live-dot !h-1.5 !w-1.5" aria-hidden="true" />
                                Live Insights
                            </span>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <AreaChart data={stats.trafficData}>
                                    <defs>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke={isDark ? "#64748b" : "#94a3b8"}
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        padding={{ left: 10, right: 10 }}
                                    />
                                    <YAxis
                                        stroke={isDark ? "#64748b" : "#94a3b8"}
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? '#0f172a' : '#ffffff',
                                            borderColor: isDark ? '#1e293b' : '#e2e8f0',
                                            color: isDark ? '#f8fafc' : '#0f172a',
                                            borderRadius: '16px',
                                            borderWidth: '1px',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                            fontSize: '12px'
                                        }}
                                        itemStyle={{ color: isDark ? '#f8fafc' : '#0f172a' }}
                                        cursor={{ stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5 5' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="views"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorViews)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Top Referrers */}
                        <div className="mkt-card p-6 sm:p-8">
                            <h2 className="mkt-h4 mb-6">Top Referrers</h2>
                            <div className="space-y-6">
                                {stats.topReferrers?.map((referrer, i) => (
                                    <div key={i}>
                                        <div className="mb-2 flex justify-between gap-4 text-sm">
                                            <span className="font-semibold text-slate-100">{referrer.name}</span>
                                            <span className="metric-num text-slate-500">{referrer.value.toLocaleString()} views</span>
                                        </div>
                                        <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-white/[0.06]">
                                            <div
                                                className="h-full rounded-full bg-violet-500 transition-all duration-1000 ease-out"
                                                style={{
                                                    width: `${Math.min((referrer.value / (stats.topReferrers[0]?.value || 1)) * 100, 100)}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                                {(!stats.topReferrers || stats.topReferrers.length === 0) && (
                                    <div className="py-12 text-center">
                                        <Globe className="mx-auto mb-4 h-12 w-12 text-slate-700" aria-hidden="true" />
                                        <p className="text-sm font-medium text-slate-500">No referrer data available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Device Stats */}
                        <div className="mkt-card p-6 sm:p-8">
                            <h2 className="mkt-h4 mb-6">Device Breakdown</h2>
                            <div className="space-y-4">
                                {stats.deviceStats?.map((device, i) => (
                                    <div key={i} className="group flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-violet-400/30 sm:p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-3 transition-transform group-hover:scale-110">
                                                {device.name.toLowerCase() === 'desktop' ? <Monitor className="h-5 w-5 text-violet-300" aria-hidden="true" /> :
                                                    device.name.toLowerCase() === 'mobile' ? <Smartphone className="h-5 w-5 text-emerald-400" aria-hidden="true" /> :
                                                        <Tablet className="h-5 w-5 text-amber-400" aria-hidden="true" />}
                                            </div>
                                            <span className="text-base font-semibold tracking-tight text-slate-100">{device.name}</span>
                                        </div>
                                        <span className="metric-num text-base font-semibold text-violet-300">
                                            {((device.value / stats.total_views) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                ))}
                                {(!stats.deviceStats || stats.deviceStats.length === 0) && (
                                    <div className="py-12 text-center">
                                        <Monitor className="mx-auto mb-4 h-12 w-12 text-slate-700" aria-hidden="true" />
                                        <p className="text-sm font-medium text-slate-500">No device data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="border-t border-white/[0.07] py-8">
                    <div className="mkt-container flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
                        <p className="text-xs text-slate-500">WebPulse Analytics · Public report</p>
                        <p className="text-xs text-slate-500">© {new Date().getFullYear()} WebPulse Analytics</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
