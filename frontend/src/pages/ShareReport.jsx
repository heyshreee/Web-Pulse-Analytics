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
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { Tablet, Smartphone } from 'lucide-react';

export default function ShareReport() {
    const { shareToken } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [timeRange, setTimeRange] = useState('7d');
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
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300 flex items-center justify-center p-6">
                <div className="card card-pad text-center p-10 sm:p-12 max-w-md">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-500/10 mx-auto mb-6">
                        <Activity className="h-8 w-8 text-red-600 dark:text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Report Not Found</h2>
                    <p className="prose-quiet mb-8">{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-primary btn-md">Retry Loading</button>
                </div>
            </div>
        );
    }

    const { project, stats } = data;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-8">
                    <div className="flex items-center gap-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 dark:bg-violet-500 text-white shadow-soft">
                            <Activity className="h-8 w-8" />
                        </div>
                        <div>
                            <div className="eyebrow flex items-center gap-2 mb-1">
                                <span>Public Report</span>
                                <span>/</span>
                                <span>{new Date(project.created_at).getFullYear()}</span>
                            </div>
                            <h2 className="page-title">{project.name}</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="eyebrow">Timezone</p>
                            <p className="font-semibold text-slate-700 dark:text-slate-200 tracking-tight">{project.timezone}</p>
                        </div>
                        <div className="card p-2">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card card-pad">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="eyebrow">Total Views</h3>
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                                <Eye className="h-5 w-5 text-violet-500" />
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.total_views.toLocaleString()}</span>
                    </div>
                    <div className="card card-pad">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="eyebrow">Unique Visitors</h3>
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                                <Users className="h-5 w-5 text-violet-500" />
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.uniqueVisitors.toLocaleString()}</span>
                    </div>
                    <div className="card card-pad">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="eyebrow">Current Month</h3>
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                                <Calendar className="h-5 w-5 text-violet-500" />
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.current_month_views.toLocaleString()}</span>
                    </div>
                </div>

                {/* Traffic Trends */}
                <div className="card card-pad">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-slate-900 dark:text-white tracking-tight">Traffic Trends</h3>
                        <span className="badge-slate">
                            <Activity className="h-3 w-3" />
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Referrers */}
                    <div className="card card-pad">
                        <h3 className="section-title mb-6">Top Referrers</h3>
                        <div className="space-y-6">
                            {stats.topReferrers?.map((referrer, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-semibold text-slate-900 dark:text-white">{referrer.name}</span>
                                        <span className="text-slate-400 dark:text-slate-500 tabular-nums">{referrer.value.toLocaleString()} views</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ring-1 ring-slate-200/50 dark:ring-transparent">
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
                                <div className="text-center py-12">
                                    <Globe className="h-12 w-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                                    <p className="text-sm font-medium text-slate-400">No referrer data available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Device Stats */}
                    <div className="card card-pad">
                        <h3 className="section-title mb-6">Device Breakdown</h3>
                        <div className="space-y-4">
                            {stats.deviceStats?.map((device, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:border-violet-300 dark:hover:border-slate-700 group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-all">
                                            {device.name.toLowerCase() === 'desktop' ? <Monitor className="h-5 w-5 text-violet-500" /> :
                                                device.name.toLowerCase() === 'mobile' ? <Smartphone className="h-5 w-5 text-emerald-500" /> :
                                                    <Tablet className="h-5 w-5 text-orange-500" />}
                                        </div>
                                        <span className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">{device.name}</span>
                                    </div>
                                    <span className="text-base font-semibold text-violet-600 dark:text-violet-400 tabular-nums">
                                        {((device.value / stats.total_views) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            ))}
                            {(!stats.deviceStats || stats.deviceStats.length === 0) && (
                                <div className="text-center py-12">
                                    <Monitor className="h-12 w-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                                    <p className="text-sm font-medium text-slate-400">No device data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
