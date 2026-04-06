import { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import {
    Search, Download, Filter, ChevronLeft, ChevronRight,
    Key, Shield, AlertTriangle, Settings, Lock, Activity,
    CheckCircle, XCircle, AlertCircle, RefreshCw, Zap
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
            success: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
            warning: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-100 dark:border-yellow-500/20',
            failure: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20',
        };

        return (
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${styles[status] || styles.success}`}>
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
        <div className="space-y-8 pb-20 transition-colors duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="flex items-center gap-5">
                    <div className="p-4 rounded-3xl bg-blue-600 shadow-2xl shadow-blue-600/20 group-hover:rotate-12 transition-transform duration-500">
                        <Activity className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Activity Log</h1>
                        <p className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
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
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm tracking-tight transition-all border shadow-lg ${isLive
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 shadow-emerald-500/20'
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-black/10'
                        }`}
                    title={user?.plan === 'pro' ? 'Toggle Live Mode' : 'Upgrade to Pro for Live Mode'}
                >
                    <Zap className={`h-4 w-4 ${isLive ? 'fill-current' : ''}`} />
                    <span>{isLive ? 'Live Tracking' : 'Go Live'}</span>
                    {user?.plan !== 'pro' && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-md ml-1 font-black">PRO</span>}
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900/40 backdrop-blur-xl p-5 rounded-3xl border border-slate-200 dark:border-slate-800/50 shadow-sm transition-all focus-within:shadow-md">
                <div className="relative flex-1 w-full lg:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by action, details, user..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-slate-900 dark:text-white font-black text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
                    />
                </div>

                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-2 flex-1 sm:flex-none">
                        <select
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value)}
                            className="w-full sm:w-auto bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all shadow-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900"
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
                            className="w-full sm:w-auto bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all shadow-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900"
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
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95"
                        >
                            <Download className="h-4 w-4" />
                            <span>Export CSV</span>
                        </button>

                        <button
                            onClick={() => loadData()}
                            className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-2xl transition-all border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95"
                            title="Refresh Logs"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl transition-all">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50/80 dark:bg-slate-950/50 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                <th className="px-8 py-5 border-b border-slate-200 dark:border-slate-800">Timestamp</th>
                                {!idOrName && <th className="px-8 py-5 border-b border-slate-200 dark:border-slate-800">Project</th>}
                                <th className="px-8 py-5 border-b border-slate-200 dark:border-slate-800">Event Type</th>
                                <th className="px-8 py-5 border-b border-slate-200 dark:border-slate-800">User</th>
                                <th className="px-8 py-5 border-b border-slate-200 dark:border-slate-800">Details</th>
                                <th className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 text-right pr-12">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <Spinner />
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        No activity logs found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-default relative">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="text-sm text-slate-900 dark:text-white font-black tracking-tight">
                                                {new Date(log.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                                                {new Date(log.created_at).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        {!idOrName && (
                                            <td className="px-8 py-6">
                                                <div className="text-sm text-slate-900 dark:text-slate-300 font-black tracking-tighter group-hover:text-blue-600 transition-colors">
                                                    {log.project?.name || 'Unknown'}
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm group-hover:scale-110 transition-all group-hover:rotate-6 group-hover:border-blue-500/30">
                                                    {getIcon(log.action)}
                                                </div>
                                                <span className="text-sm text-slate-900 dark:text-white font-black tracking-tight">{log.action}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-xl shadow-blue-600/20 group-hover:rotate-12 transition-all">
                                                    {(log.user?.email || 'S').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-black text-slate-600 dark:text-slate-400 tracking-tight">{log.user?.email || 'System'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-xs truncate leading-relaxed" title={log.details}>
                                                {log.details}
                                            </div>
                                            {log.ip_address && (
                                                <div className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-2 font-mono bg-slate-50 dark:bg-slate-950 inline-block px-2 py-0.5 rounded-lg border border-slate-100 dark:border-slate-800">IP: {log.ip_address}</div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right pr-12">
                                            {getStatusBadge(log.status)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-950/30 flex items-center justify-between">
                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        Showing <span className="text-slate-900 dark:text-white">{logs.length > 0 ? (page - 1) * 10 + 1 : 0}</span> to <span className="text-slate-900 dark:text-white">{Math.min(page * 10, totalLogs)}</span> of <span className="text-slate-900 dark:text-white">{totalLogs}</span> entries
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-3 rounded-xl bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
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
                                        className={`w-10 h-10 rounded-xl text-sm font-black transition-all shadow-sm ${page === p
                                            ? 'bg-blue-600 text-white shadow-blue-600/30 ring-2 ring-blue-600/20'
                                            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            {totalPages > 5 && <span className="text-slate-400 dark:text-slate-600 px-2 font-black">...</span>}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-3 rounded-xl bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
