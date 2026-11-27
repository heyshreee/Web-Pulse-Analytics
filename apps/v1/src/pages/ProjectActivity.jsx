import { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import {
    Search, Download, ChevronLeft, ChevronRight, ChevronDown,
    Key, Shield, AlertTriangle, Settings, Lock, Activity,
    RefreshCw, Zap
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';

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
    const { socket, user, setIsPageLoading } = useOutletContext() || {}; // Get user to check plan

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
            setIsPageLoading?.(false);
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
            success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            failure: 'bg-red-500/10 text-red-400 border-red-500/20',
        };

        return (
            <span className={`px-1.5 py-0.5 rounded text-[10.5px] font-mono capitalize border ${styles[status] || styles.success}`}>
                {status}
            </span>
        );
    };

    const canExportCsv = user?.entitlements?.features?.csv_export ?? (user?.plan && !['nano', 'free'].includes(String(user.plan).toLowerCase()));

    const handleExport = () => {
        if (!canExportCsv) {
            showToast('CSV export requires Lite or higher plan.', 'error');
            return;
        }
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

    if (loading && logs.length === 0) {
        return (
            <div className="space-y-3 font-sans animate-pulse">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center h-8">
                    <div className="space-y-1">
                        <div className="h-4 w-36 bg-[var(--wp-border-default)] rounded" />
                        <div className="h-3 w-64 bg-[var(--wp-border-subtle)] rounded hidden sm:block" />
                    </div>
                    <div className="h-7 w-24 bg-[var(--wp-border-default)] rounded" />
                </div>

                {/* Controls Skeleton */}
                <div className="flex justify-between items-center h-8">
                    <div className="h-7 w-64 bg-[var(--wp-border-subtle)] rounded" />
                    <div className="h-7 w-48 bg-[var(--wp-border-subtle)] rounded" />
                </div>

                {/* Table Skeleton */}
                <div className="wp-panel overflow-hidden bg-[var(--wp-bg-surface)]">
                    <div className="h-8 bg-[var(--wp-bg-subtle)] border-b border-[var(--wp-border-subtle)]" />
                    <div className="divide-y divide-[var(--wp-border-subtle)]">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <div key={n} className="h-10 px-3 flex items-center justify-between">
                                <div className="h-3 w-28 bg-[var(--wp-border-subtle)] rounded" />
                                <div className="h-3 w-24 bg-[var(--wp-border-subtle)] rounded" />
                                <div className="h-3 w-48 bg-[var(--wp-border-subtle)] rounded" />
                                <div className="h-4 w-14 bg-[var(--wp-border-subtle)] rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <div>
                    <h1 className="wp-title-page">Activity Log</h1>
                    <p className="text-[11.5px] text-[var(--wp-text-muted)] mt-0.5">
                        {idOrName
                            ? `Monitor events and audit telemetry for ${project?.name || 'this project'}.`
                            : 'Monitor management events and security audit trails across all projects.'}
                    </p>
                </div>
                <button
                    onClick={() => {
                        if (user?.plan === 'pro') {
                            setIsLive(!isLive);
                            if (!isLive) showToast('Live stream enabled', 'success');
                        } else {
                            showToast('Live stream requires a Pro plan', 'info');
                        }
                    }}
                    className={`wp-btn h-7 text-xs px-2.5 gap-1.5 transition-colors ${
                        isLive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'wp-btn-secondary'
                    }`}
                    title={user?.plan === 'pro' ? 'Toggle Live Mode' : 'Upgrade to Pro for Live Mode'}
                >
                    {isLive ? <span className="wp-live-dot" /> : <Zap className="h-3.5 w-3.5" />}
                    <span>{isLive ? 'Live Streaming' : 'Go Live'}</span>
                    {user?.plan !== 'pro' && (
                        <span className="text-[9.5px] font-mono px-1 py-0.2 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] ml-0.5">
                            PRO
                        </span>
                    )}
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 w-full max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--wp-text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search action, details, user..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-8 h-7 text-xs"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Event Type Filter */}
                    <div className="relative">
                        <select
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value)}
                            className="h-7 text-xs rounded-md border border-[var(--wp-border-default)] bg-[var(--wp-bg-surface)] text-[var(--wp-text-primary)] pl-2.5 pr-7 appearance-none cursor-pointer focus:outline-none focus:border-[var(--wp-border-strong)] transition-colors font-mono"
                        >
                            <option value="all">All Events</option>
                            <option value="success">Success</option>
                            <option value="warning">Warning</option>
                            <option value="failure">Failure</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[var(--wp-text-muted)]" />
                    </div>

                    {/* Time Range Filter */}
                    <div className="relative">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="h-7 text-xs rounded-md border border-[var(--wp-border-default)] bg-[var(--wp-bg-surface)] text-[var(--wp-text-primary)] pl-2.5 pr-7 appearance-none cursor-pointer focus:outline-none focus:border-[var(--wp-border-strong)] transition-colors font-mono"
                        >
                            <option value="24h">Last 24h</option>
                            <option value="7d">Last 7d</option>
                            <option value="30d">Last 30d</option>
                            <option value="all">All Time</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[var(--wp-text-muted)]" />
                    </div>

                    <button
                        onClick={handleExport}
                        disabled={!canExportCsv}
                        className="wp-btn wp-btn-secondary h-7 text-xs px-2 gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={canExportCsv ? 'Export as CSV' : 'CSV export requires Lite or higher'}
                    >
                        {canExportCsv ? <Download className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        <span>{canExportCsv ? 'Export' : 'CSV (Lite+)'}</span>
                    </button>

                    <button
                        onClick={() => loadData()}
                        className="wp-btn wp-btn-secondary h-7 w-7 p-0 flex items-center justify-center"
                        title="Refresh Logs"
                    >
                        <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="wp-panel overflow-hidden bg-[var(--wp-bg-surface)]">
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr className="table-head">
                                <th className="table-th font-mono">Timestamp</th>
                                {!idOrName && <th className="table-th">Project</th>}
                                <th className="table-th">Action</th>
                                <th className="table-th">User</th>
                                <th className="table-th">Details</th>
                                <th className="table-th text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3, 4, 5].map((n) => (
                                    <tr key={n} className="border-b border-[var(--wp-border-subtle)] animate-pulse">
                                        <td className="table-td">
                                            <div className="h-3 w-20 bg-[var(--wp-border-subtle)] rounded" />
                                        </td>
                                        {!idOrName && (
                                            <td className="table-td">
                                                <div className="h-3 w-20 bg-[var(--wp-border-subtle)] rounded" />
                                            </td>
                                        )}
                                        <td className="table-td">
                                            <div className="h-3 w-24 bg-[var(--wp-border-subtle)] rounded" />
                                        </td>
                                        <td className="table-td">
                                            <div className="h-3 w-28 bg-[var(--wp-border-subtle)] rounded" />
                                        </td>
                                        <td className="table-td">
                                            <div className="h-3 w-40 bg-[var(--wp-border-subtle)] rounded" />
                                        </td>
                                        <td className="table-td text-right">
                                            <div className="h-3 w-12 bg-[var(--wp-border-subtle)] rounded ml-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={idOrName ? 5 : 6} className="py-12 text-center">
                                        <div className="space-y-2">
                                            <Activity className="h-6 w-6 text-[var(--wp-text-muted)] mx-auto" />
                                            <p className="text-xs text-[var(--wp-text-secondary)]">No activity logs recorded matching criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="hover:bg-[var(--wp-bg-hover)] transition-colors border-b border-[var(--wp-border-subtle)] last:border-0"
                                    >
                                        <td className="table-td whitespace-nowrap font-mono text-[11px] text-[var(--wp-text-muted)] tabular-nums">
                                            <div>{new Date(log.created_at).toLocaleDateString()}</div>
                                            <div className="text-[10px] text-[var(--wp-text-muted)]/70">{new Date(log.created_at).toLocaleTimeString()}</div>
                                        </td>
                                        {!idOrName && (
                                            <td className="table-td whitespace-nowrap text-xs font-medium text-[var(--wp-text-primary)]">
                                                {log.project?.name || 'System'}
                                            </td>
                                        )}
                                        <td className="table-td whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] text-[var(--wp-text-muted)]">
                                                    {getIcon(log.action)}
                                                </div>
                                                <span className="text-xs font-mono text-[var(--wp-text-primary)]">{log.action}</span>
                                            </div>
                                        </td>
                                        <td className="table-td whitespace-nowrap text-xs font-mono text-[var(--wp-text-secondary)]">
                                            {log.user?.email || 'system'}
                                        </td>
                                        <td className="table-td">
                                            <div className="text-xs text-[var(--wp-text-secondary)] max-w-xs truncate" title={log.details}>
                                                {log.details}
                                            </div>
                                            {log.ip_address && (
                                                <span className="text-[10px] font-mono text-[var(--wp-text-muted)] block mt-0.5">
                                                    IP: {log.ip_address}
                                                </span>
                                            )}
                                        </td>
                                        <td className="table-td whitespace-nowrap text-right">
                                            {getStatusBadge(log.status)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-3 py-2 border-t border-[var(--wp-border-subtle)] bg-[var(--wp-bg-subtle)]/40 flex items-center justify-between text-xs">
                    <p className="font-mono text-[11px] text-[var(--wp-text-muted)]">
                        Showing <span className="text-[var(--wp-text-primary)] font-medium">{logs.length > 0 ? (page - 1) * 10 + 1 : 0}</span>-
                        <span className="text-[var(--wp-text-primary)] font-medium">{Math.min(page * 10, totalLogs)}</span> of{' '}
                        <span className="text-[var(--wp-text-primary)] font-medium">{totalLogs}</span> entries
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="wp-btn wp-btn-secondary h-6 w-6 p-0 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Previous Page"
                        >
                            <ChevronLeft className="h-3 w-3" />
                        </button>
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const p = i + 1;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`h-6 w-6 rounded flex items-center justify-center transition-colors ${
                                            page === p
                                                ? 'bg-[var(--wp-bg-active)] text-[var(--wp-text-primary)] font-medium'
                                                : 'text-[var(--wp-text-muted)] hover:text-[var(--wp-text-primary)]'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            {totalPages > 5 && <span className="text-[var(--wp-text-muted)] px-1">...</span>}
                        </div>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="wp-btn wp-btn-secondary h-6 w-6 p-0 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Next Page"
                        >
                            <ChevronRight className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
