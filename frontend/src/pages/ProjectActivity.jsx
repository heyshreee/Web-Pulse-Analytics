import { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import {
    Search, Download, ChevronLeft, ChevronRight,
    Key, Shield, AlertTriangle, Settings, Lock, Activity,
    RefreshCw, Zap
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

export default function ProjectActivity() {
    const { idOrName } = useParams();
    const navigate = useNavigate();
    // const { project } = useOutletContext(); // This might fail if not in Layout context correctly or if context is different.
    // ProjectActivity is rendered inside Layout -> PrivateRoute.
    // But wait, App.jsx renders it as:
    // <Route path="/dashboard/projects/:idOrName/activity" element={<PrivateRoute><ProjectActivity /></PrivateRoute>} />
    // It is NOT inside the nested Route element={<Layout />}> ... </Route> block in App.jsx?
    // Let's check App.jsx again.
    // Line 50: It is OUTSIDE the Layout route wrapper.
    // So useOutletContext() will NOT work if it expects Layout's context.
    // However, the screenshot shows the sidebar.
    // If it's outside Layout, it won't have the sidebar.
    // The user wants it in the sidebar, so it should be part of the dashboard layout.
    // I should move the route INSIDE the Layout wrapper in App.jsx.

    // For now, I will write the component assuming I will fix the route in App.jsx next.
    // I'll fetch project data if context is missing or just use idOrName.

    const [project, setProject] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [eventType, setEventType] = useState('all');
    const [timeRange, setTimeRange] = useState('24h');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const [isLive, setIsLive] = useState(false);
    const { showToast } = useToast();
    const { socket, user } = useOutletContext(); // Get user to check plan

    useEffect(() => {
        loadData();

        // Socket listener
        const handleNewActivity = (newLog) => {
            if (!isLive) return; // Only update if live mode is on

            // If viewing specific project, filter
            if (idOrName) {
                if (project && (newLog.project_id === project.id)) {
                    setLogs(prev => [newLog, ...prev]);
                    setTotalLogs(prev => prev + 1);
                }
            } else {
                // Global view: show all
                setLogs(prev => [newLog, ...prev]);
                setTotalLogs(prev => prev + 1);
            }
        };

        if (socket && isLive) {
            socket.on('activity_new', handleNewActivity);
        }

        return () => {
            if (socket) {
                socket.off('activity_new', handleNewActivity);
            }
        };
    }, [idOrName, project, page, search, eventType, timeRange, socket, isLive]);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Get Project ID if we only have name
            let projectId = project?.id;
            if (idOrName && !projectId) {
                const p = await apiRequest(`/projects/${encodeURIComponent(idOrName)}`);
                if (idOrName === p.id) {
                    navigate(`/dashboard/projects/${encodeURIComponent(p.name)}/activity`, { replace: true });
                }
                setProject(p);
                projectId = p.id;
            }

            // 2. Get Logs
            const query = new URLSearchParams({
                page,
                limit: 10,
                search,
                type: eventType,
                days: timeRange
            });

            const endpoint = projectId ? `/activity/${projectId}` : '/activity';
            const data = await apiRequest(`${endpoint}?${query.toString()}`);
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
                {status}
            </span>
        );
    };

    const handleExport = () => {
        const headers = ['Timestamp', 'Event Type', 'User', 'Details', 'Status', 'IP Address'];
        const csvContent = [
            headers.join(','),
            ...logs.map(log => [
                new Date(log.created_at).toISOString(),
                log.action,
                log.user?.email || 'System',
                `"${log.details}"`,
                log.status,
                log.ip_address || 'N/A'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-log-${project?.name || 'project'}-${new Date().toISOString()}.csv`;
        a.click();
    };

    return (
        <div className="space-y-8 animate-fade-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                        <Activity className="h-5 w-5 text-violet-500" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="page-title">Activity Log</h2>
                        <p className="page-sub">
                            {idOrName ? `Monitor important events and security logs for ${project?.name || 'your project'}` : 'Monitor all management events across all your connected projects'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        if (user?.plan === 'pro') {
                            setIsLive(!isLive);
                            if (!isLive) showToast('Live mode enabled', 'success');
                        } else {
                            showToast('Live logs are available on Pro plan', 'info');
                        }
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all border ${isLive
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                        }`}
                    title={user?.plan === 'pro' ? 'Toggle Live Mode' : 'Upgrade to Pro for Live Mode'}
                >
                    <Zap className={`h-4 w-4 ${isLive ? 'fill-current' : ''}`} />
                    <span>{isLive ? 'Live Tracking' : 'Go Live'}</span>
                    {user?.plan !== 'pro' && <span className="text-[10px] bg-violet-500 text-white px-2 py-0.5 rounded-md ml-1 font-bold">PRO</span>}
                </button>
            </div>

            {/* Controls */}
            <div className="card card-pad flex flex-col lg:flex-row gap-4 items-center justify-between !p-4">
                <div className="relative flex-1 w-full lg:max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by action, details, user..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-10"
                    />
                </div>

                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-2 flex-1 sm:flex-none">
                        <select
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value)}
                            className="input w-full sm:w-auto cursor-pointer"
                        >
                            <option value="all">All Events</option>
                            <option value="success">Success</option>
                            <option value="warning">Warning</option>
                            <option value="failure">Failure</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 flex-1 sm:flex-none">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="input w-full sm:w-auto cursor-pointer"
                        >
                            <option value="24h">Last 24h</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto items-center">
                        <button
                            onClick={handleExport}
                            className="btn-secondary btn-sm flex-1 sm:flex-none"
                        >
                            <Download className="h-4 w-4" />
                            <span>Export CSV</span>
                        </button>

                        <button
                            onClick={() => loadData()}
                            className="btn-secondary btn-sm"
                            title="Refresh Logs"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                <th className="px-4 py-3">Timestamp</th>
                                {!idOrName && <th className="px-4 py-3">Project</th>}
                                <th className="px-4 py-3">Event Type</th>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Details</th>
                                <th className="px-4 py-3 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={idOrName ? 5 : 6} className="px-4 py-12 text-center">
                                        <div className="flex justify-center">
                                            <Spinner fullScreen={false} />
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={idOrName ? 5 : 6} className="px-4 py-12 text-center">
                                        <div className="card card-pad py-14 text-center !shadow-none !border-0">
                                            <Activity className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                            <p className="text-slate-500 dark:text-slate-400">No activity logs found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm text-slate-900 dark:text-white font-semibold">
                                                {new Date(log.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                                {new Date(log.created_at).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        {!idOrName && (
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-900 dark:text-slate-300 font-medium">
                                                    {log.project?.name || 'Unknown'}
                                                </span>
                                            </td>
                                        )}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                                                    {getIcon(log.action)}
                                                </div>
                                                <span className="text-sm text-slate-900 dark:text-white font-medium">{log.action}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-400">
                                                    {(log.user?.email || 'S').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{log.user?.email || 'System'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate" title={log.details}>
                                                {log.details}
                                            </div>
                                            {log.ip_address && (
                                                <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1.5 font-mono badge-slate">IP: {log.ip_address}</div>
                                            )}
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
                            className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const p = i + 1;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${page === p
                                            ? 'bg-slate-900 dark:bg-violet-500 text-white shadow-sm'
                                            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            {totalPages > 5 && <span className="text-slate-400 dark:text-slate-600 px-2 font-semibold">...</span>}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
