import { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import {
    Search, Download, ChevronLeft, ChevronRight,
    Key, Shield, AlertTriangle, Settings, Lock, Activity
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

export default function ActivityLog() {
    const { idOrName } = useParams();
    const { project, socket, usageStats } = useOutletContext();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [eventType, setEventType] = useState('all');
    const [timeRange, setTimeRange] = useState('30d');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const { showToast } = useToast();

    useEffect(() => {
        if (project?.id && socket && usageStats?.liveLogs) {
            loadLogs();

            // Join project room
            socket.emit('join_project', project.id);

            // Listen for new activity logs
            const handleNewLog = (newLog) => {
                if (usageStats?.liveLogs) {
                    console.log('New Live Activity Log:', newLog);
                }
                // Only add if we're on page 1 and filters match
                if (page === 1) {
                    setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 9)]);
                    setTotalLogs(prev => prev + 1);
                }
            };

            socket.on('activity_new', handleNewLog);

            return () => {
                socket.emit('leave_project', project.id);
                socket.off('activity_new', handleNewLog);
            };
        } else if (project?.id) {
            loadLogs();
        }
    }, [project?.id, page, search, eventType, timeRange, socket, usageStats?.liveLogs]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page,
                limit: 10,
                search,
                type: eventType,
                days: timeRange
            });

            const data = await apiRequest(`/activity/${project.id}?${query.toString()}`);
            setLogs(data.logs);
            setTotalPages(data.totalPages);
            setTotalLogs(data.total);
        } catch (err) {
            showToast('Failed to load activity logs', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (action) => {
        if (action.includes('API Key')) return <Key className="h-4 w-4 text-blue-500" />;
        if (action.includes('Project Disabled')) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
        if (action.includes('Origin')) return <Shield className="h-4 w-4 text-emerald-500" />;
        if (action.includes('Login')) return <Lock className="h-4 w-4 text-rose-500" />;
        if (action.includes('Settings')) return <Settings className="h-4 w-4 text-purple-500" />;
        return <Activity className="h-4 w-4 text-slate-400" />;
    };

    const getStatusBadge = (status) => {
        const styles = {
            success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
            warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
            failure: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
        };

        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${styles[status] || styles.success}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const handleExport = () => {
        const headers = ['Timestamp', 'Event Type', 'Resource', 'Method', 'Status Code', 'Latency (ms)', 'IP Address', 'Country', 'City', 'User Agent', 'Request ID', 'Plan', 'Status'];
        const csvContent = [
            headers.join(','),
            ...logs.map(log => [
                new Date(log.created_at).toISOString(),
                log.action,
                `"${log.resource || log.details}"`,
                log.http_method || 'N/A',
                log.http_status || 200,
                log.latency_ms || 0,
                log.ip_address || 'N/A',
                log.country || 'Unknown',
                log.city || 'Unknown',
                `"${log.user_agent || 'N/A'}"`,
                log.request_id || 'N/A',
                log.plan || 'free',
                log.status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-log-${project.name}-${new Date().toISOString()}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                        <Activity className="h-5 w-5 text-violet-500" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="page-title">Activity Log</h2>
                        <p className="page-sub">
                            Monitor all events and security changes across your project.{' '}
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1 font-semibold uppercase tracking-wider">(Logs are retained for 30 days)</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="card card-pad flex flex-col md:flex-row gap-4 items-center justify-between !p-4">
                <div className="relative flex-1 w-full md:w-auto">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-10"
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="input cursor-pointer"
                    >
                        <option value="all">All Events</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                        <option value="failure">Failure</option>
                    </select>

                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="input cursor-pointer"
                    >
                        <option value="24h">Last 24h</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                    </select>

                    <button
                        onClick={handleExport}
                        className="btn-secondary btn-sm"
                    >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden relative">
                {(!usageStats?.liveLogs && usageStats?.plan) && (
                    <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-slate-50/40 dark:bg-slate-950/40 flex items-center justify-center p-6 text-center">
                        <div className="max-w-sm card card-pad p-8">
                            <div className="w-16 h-16 bg-violet-50 dark:bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-violet-100 dark:border-violet-500/20">
                                <Lock className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Live Logs are Pro</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-medium">
                                Real-time activity monitoring is only available on the Pro plan. Upgrade to see events as they happen.
                            </p>
                            <button
                                onClick={() => window.location.href = '/dashboard/billing'}
                                className="btn-primary btn-md w-full"
                            >
                                Upgrade to Pro
                            </button>
                        </div>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1500px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                <th className="px-4 py-3">Timestamp</th>
                                <th className="px-4 py-3">Event/Action</th>
                                <th className="px-4 py-3">Project/User ID</th>
                                <th className="px-4 py-3">Session/Request ID</th>
                                <th className="px-4 py-3">Resource</th>
                                <th className="px-4 py-3">Method/Status</th>
                                <th className="px-4 py-3">Latency</th>
                                <th className="px-4 py-3">Location/IP</th>
                                <th className="px-4 py-3">Plan</th>
                                <th className="px-4 py-3 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="10" className="px-4 py-12 text-center">
                                        <div className="flex justify-center">
                                            <Spinner fullScreen={false} />
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="px-4 py-12 text-center">
                                        <div className="card card-pad py-14 text-center !shadow-none !border-0">
                                            <Activity className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                            <p className="text-slate-500 dark:text-slate-400">No activity logs found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group text-xs text-slate-700 dark:text-slate-300">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-slate-900 dark:text-white font-semibold">
                                                {new Date(log.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-slate-500 dark:text-slate-400">
                                                {new Date(log.created_at).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                                                    {getIcon(log.action)}
                                                </div>
                                                <div>
                                                    <span className="text-slate-900 dark:text-white font-semibold block">{log.action}</span>
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{log.event_type || 'activity'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-mono text-[10px] font-semibold text-slate-600 dark:text-slate-400 truncate w-24" title={log.project?.name || 'Project'}>
                                                P: {log.project?.name || 'Unknown'}
                                            </div>
                                            <div className="font-mono text-[10px] text-slate-400 dark:text-slate-500 truncate w-24" title={log.user_id}>
                                                U: {log.user_id?.substring(0, 8)}...
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-mono text-[10px] font-semibold text-slate-600 dark:text-slate-400 truncate w-24" title={log.session_id}>
                                                S: {log.session_id?.substring(0, 8)}...
                                            </div>
                                            <div className="font-mono text-[10px] text-slate-400 dark:text-slate-500 truncate w-24" title={log.request_id}>
                                                R: {log.request_id?.substring(0, 8)}...
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-slate-700 dark:text-slate-300 font-mono font-medium truncate max-w-[150px]" title={log.resource || log.details}>
                                                {log.resource || log.details}
                                            </div>
                                            <div className="text-[10px] text-slate-500 truncate max-w-[150px]" title={log.user_agent}>
                                                {log.user_agent}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${log.http_method === 'GET' ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400' :
                                                    log.http_method === 'POST' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                                        'bg-slate-500/10 text-slate-500 dark:text-slate-400'
                                                    }`}>
                                                    {log.http_method || 'N/A'}
                                                </span>
                                                <span className={`font-bold ${log.http_status >= 400 ? 'text-red-600 dark:text-red-400' :
                                                    log.http_status >= 300 ? 'text-amber-600 dark:text-amber-400' :
                                                        'text-emerald-600 dark:text-emerald-400'
                                                    }`}>
                                                    {log.http_status || '200'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-slate-600 dark:text-slate-400 font-medium">
                                                {log.latency_ms ? `${log.latency_ms}ms` : '--'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-slate-700 dark:text-slate-300 font-semibold">
                                                {log.city && log.country ? `${log.city}, ${log.country}` : 'Unknown'}
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-mono">
                                                {log.ip_address}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{log.plan || 'free'}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {getStatusBadge(log.status)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Showing <span className="text-slate-900 dark:text-white font-semibold">{logs.length > 0 ? (page - 1) * 10 + 1 : 0}</span> to <span className="text-slate-900 dark:text-white font-semibold">{Math.min(page * 10, totalLogs)}</span> of <span className="text-slate-900 dark:text-white font-semibold">{totalLogs}</span> entries
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Simple logic to show first 5 pages or sliding window could be better but this is MVP
                                const p = i + 1;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${page === p
                                            ? 'bg-slate-900 dark:bg-violet-500 text-white shadow-sm'
                                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shadow-sm'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            {totalPages > 5 && <span className="text-slate-500 px-2">...</span>}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
