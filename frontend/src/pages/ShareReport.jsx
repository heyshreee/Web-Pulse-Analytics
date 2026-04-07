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
            <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6">
                <div className="text-center p-12 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl max-w-md">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Activity className="h-10 w-10 text-red-600 dark:text-red-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Report Not Found</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">{error}</p>
                    <button onClick={() => window.location.reload()} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm tracking-tight transition-all shadow-xl shadow-blue-500/30 active:scale-95">Retry Loading</button>
                </div>
            </div>
        );
    }

    const { project, stats } = data;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-6 md:p-12 transition-colors duration-500">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/30">
                            <Activity className="h-8 w-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">
                                <span>Public Report</span>
                                <span>/</span>
                                <span>{new Date(project.created_at).getFullYear()}</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{project.name}</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Timezone</p>
                            <p className="font-bold text-slate-700 dark:text-white tracking-tight">{project.timezone}</p>
                        </div>
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-3xl p-8 shadow-sm dark:shadow-xl transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Views</h3>
                            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                                <Eye className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stats.total_views.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-3xl p-8 shadow-sm dark:shadow-xl transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Unique Visitors</h3>
                            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stats.uniqueVisitors.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-3xl p-8 shadow-sm dark:shadow-xl transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Current Month</h3>
                            <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-lg text-green-600 dark:text-green-500">
                                <Calendar className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stats.current_month_views.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Traffic Trends */}
                <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-3xl p-8 shadow-sm dark:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Traffic Trends</h3>
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Activity className="h-3 w-3" />
                            Live Insights
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={stats.trafficData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke={isDark ? "#64748b" : "#94a3b8"}
                                    fontSize={10}
                                    fontWeight={900}
                                    tickLine={false}
                                    axisLine={false}
                                    padding={{ left: 10, right: 10 }}
                                />
                                <YAxis
                                    stroke={isDark ? "#64748b" : "#94a3b8"}
                                    fontSize={10}
                                    fontWeight={900}
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
                                        fontWeight: '900',
                                        fontSize: '12px'
                                    }}
                                    itemStyle={{ color: isDark ? '#f8fafc' : '#0f172a' }}
                                    cursor={{ stroke: '#3B82F6', strokeWidth: 2, strokeDasharray: '5 5' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#3B82F6"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorViews)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Referrers */}
                    <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-3xl p-8 shadow-sm dark:shadow-xl transition-all">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-8">Top Referrers</h3>
                        <div className="space-y-6">
                            {stats.topReferrers?.map((referrer, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between text-xs mb-2 uppercase tracking-widest font-black">
                                        <span className="text-slate-900 dark:text-white">{referrer.name}</span>
                                        <span className="text-slate-400 dark:text-slate-500">{referrer.value.toLocaleString()} views</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-200/50 dark:ring-transparent">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{
                                                width: `${Math.min((referrer.value / (stats.topReferrers[0]?.value || 1)) * 100, 100)}%`,
                                                backgroundColor: referrer.color || '#3B82F6'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            {(!stats.topReferrers || stats.topReferrers.length === 0) && (
                                <div className="text-center py-12">
                                    <Globe className="h-12 w-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No referrer data available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Device Stats */}
                    <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-3xl p-8 shadow-sm dark:shadow-xl transition-all">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-8">Device Breakdown</h3>
                        <div className="space-y-4">
                            {stats.deviceStats?.map((device, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:border-blue-400 dark:hover:border-slate-700 shadow-sm group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-all">
                                            {device.name.toLowerCase() === 'desktop' ? <Monitor className="h-5 w-5 text-blue-500" /> :
                                                device.name.toLowerCase() === 'mobile' ? <Smartphone className="h-5 w-5 text-emerald-500" /> :
                                                    <Tablet className="h-5 w-5 text-orange-500" />}
                                        </div>
                                        <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">{device.name}</span>
                                    </div>
                                    <span className="text-base font-black text-blue-600 dark:text-blue-400 tabular-nums">
                                        {((device.value / stats.total_views) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            ))}
                            {(!stats.deviceStats || stats.deviceStats.length === 0) && (
                                <div className="text-center py-12">
                                    <Monitor className="h-12 w-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No device data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
