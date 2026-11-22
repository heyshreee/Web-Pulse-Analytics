import { useState, useEffect } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import {
    Plus, Loader2, Search, Grid, List, ArrowRight, Settings
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

export default function Projects() {
    const { user, loadUser, usageStats, setIsPageLoading } = useOutletContext();
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [allowedOrigins, setAllowedOrigins] = useState('');
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [creating, setCreating] = useState(false);
    const [deletingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        loadProjects();
        const interval = setInterval(() => loadProjects(false), 1000);
        return () => clearInterval(interval);
    }, []);

    const loadProjects = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const projectsData = await apiRequest('/projects');
            setProjects(projectsData);

            if (projectsData.length > 0) {
                const statsPromises = projectsData.map(p =>
                    apiRequest(`/analytics/projects/${p.id}/overview`).catch(() => null)
                );
                const allStats = await Promise.all(statsPromises);

                const statsMap = {};
                projectsData.forEach((p, i) => {
                    statsMap[p.id] = allStats[i];
                });
                setStats(statsMap);
            }
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            if (showLoading) {
                setLoading(false);
                setIsPageLoading?.(false);
            }
        }
    };


    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (creating) return;

        if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) {
            showToast('Project name can only contain letters, numbers, underscores, and hyphens', 'error');
            return;
        }

        setCreating(true);
        try {
            await apiRequest('/projects', {
                method: 'POST',
                body: JSON.stringify({ name: projectName, allowedOrigins }),
            });
            setProjectName('');
            setAllowedOrigins('');
            setShowModal(false);
            showToast('Project created successfully!', 'success');
            loadProjects();
            loadUser();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setCreating(false);
        }
    };


    if (loading) {
        return (
            <div className="space-y-3 font-sans animate-pulse">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center h-8">
                    <div className="space-y-1">
                        <div className="h-4 w-32 bg-[var(--wp-border-default)] rounded" />
                        <div className="h-3 w-48 bg-[var(--wp-border-subtle)] rounded hidden sm:block" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-16 bg-[var(--wp-border-subtle)] rounded" />
                        <div className="h-7 w-24 bg-[var(--wp-border-default)] rounded" />
                    </div>
                </div>

                {/* Stat Bar Skeleton */}
                <div className="wp-panel min-h-[76px] grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--wp-border-subtle)] bg-[var(--wp-bg-surface)]">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="p-3 space-y-2">
                            <div className="h-3 w-24 bg-[var(--wp-border-subtle)] rounded" />
                            <div className="h-5 w-28 bg-[var(--wp-border-default)] rounded" />
                            <div className="h-1.5 w-full bg-[var(--wp-border-subtle)] rounded-full" />
                        </div>
                    ))}
                </div>

                {/* Controls Skeleton */}
                <div className="flex justify-between items-center h-8">
                    <div className="h-7 w-64 bg-[var(--wp-border-subtle)] rounded" />
                    <div className="h-7 w-16 bg-[var(--wp-border-subtle)] rounded" />
                </div>

                {/* Projects Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="wp-panel h-[160px] p-3 flex flex-col justify-between bg-[var(--wp-bg-surface)]">
                            <div className="flex justify-between items-start">
                                <div className="h-4 w-28 bg-[var(--wp-border-default)] rounded" />
                                <div className="h-4 w-12 bg-[var(--wp-border-subtle)] rounded" />
                            </div>
                            <div className="h-3 w-36 bg-[var(--wp-border-subtle)] rounded" />
                            <div className="h-4 w-full bg-[var(--wp-border-subtle)] rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const projectLimit = usageStats?.projectLimit || 5;
    const projectsUsed = projects.length;

    // Calculate total monthly views across all projects (fall back to viewCount or total_views if usages table is yet to sync)
    const totalMonthlyViews = Object.values(stats).reduce((acc, curr) => acc + (curr?.current_month_views || curr?.viewCount || curr?.total_views || 0), 0);
    const viewLimit = usageStats?.monthlyLimit || 1000;

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );



    return (
        <div className="space-y-3 font-sans">
            {(deletingId || creating) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <Loader2 className="h-7 w-7 text-[var(--wp-text-primary)] animate-spin" />
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <div>
                    <h1 className="wp-title-page">Your Projects</h1>
                    <p className="text-[11.5px] text-[var(--wp-text-muted)] mt-0.5">
                        Manage and monitor connected domains and tracking endpoints.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="wp-metric-mono text-[10.5px] text-[var(--wp-text-muted)] px-1.5 py-0.5 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] uppercase">
                        {user?.plan || 'Free'} Plan
                    </span>
                    <button
                        onClick={() => setShowModal(true)}
                        disabled={projectsUsed >= projectLimit}
                        className="wp-btn wp-btn-primary h-7 text-xs px-2.5 gap-1.5"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>New Project</span>
                    </button>
                </div>
            </div>

            {/* 3-Column Unified Metric Bar */}
            <div className="wp-panel grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--wp-border-subtle)] bg-[var(--wp-bg-surface)]">
                {/* 1: Project Capacity */}
                <div className="p-3 sm:p-3.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="wp-label-section uppercase">Project capacity</span>
                        <span className="wp-metric-mono font-medium text-[var(--wp-text-primary)]">
                            {projectsUsed} / {projectLimit}
                        </span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                        <span className="wp-kpi-value text-xl font-bold tracking-tight text-[var(--wp-text-primary)] tabular-nums">
                            {projectsUsed}
                        </span>
                        <span className="text-xs font-mono text-[var(--wp-text-muted)]">
                            active domains
                        </span>
                    </div>
                    <div className="mt-1.5 wp-meter-track">
                        <div
                            className="wp-meter-bar"
                            style={{ width: `${Math.min((projectsUsed / projectLimit) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                {/* 2: Monthly Pulse */}
                <div className="p-3 sm:p-3.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="wp-label-section uppercase">Monthly pulse</span>
                        <span className="wp-metric-mono font-medium text-[var(--wp-text-primary)]">
                            {totalMonthlyViews.toLocaleString()} / {viewLimit >= 1000 ? `${(viewLimit / 1000).toFixed(0)}k` : viewLimit}
                        </span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                        <span className="wp-kpi-value text-xl font-bold tracking-tight text-[var(--wp-text-primary)] tabular-nums">
                            {totalMonthlyViews.toLocaleString()}
                        </span>
                        <span className="text-xs font-mono text-[var(--wp-text-muted)]">
                            events tracked
                        </span>
                    </div>
                    <div className="mt-1.5 wp-meter-track">
                        <div
                            className="wp-meter-bar"
                            style={{ width: `${Math.min((totalMonthlyViews / viewLimit) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                {/* 3: Storage Load */}
                <div className="p-3 sm:p-3.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="wp-label-section uppercase">Storage load</span>
                        <span className="wp-metric-mono font-medium text-[var(--wp-text-primary)]">
                            {usageStats?.storageUsed < 1024 * 1024
                                ? `${(usageStats?.storageUsed / 1024).toFixed(1)} KB`
                                : `${(usageStats?.storageUsed / (1024 * 1024)).toFixed(1)} MB`}
                        </span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                        <span className="wp-kpi-value text-xl font-bold tracking-tight text-[var(--wp-text-primary)] tabular-nums">
                            {usageStats?.storageUsed < 1024 * 1024
                                ? `${(usageStats?.storageUsed / 1024).toFixed(1)} KB`
                                : `${(usageStats?.storageUsed / (1024 * 1024)).toFixed(1)} MB`}
                        </span>
                        <span className="text-xs font-mono text-[var(--wp-text-muted)]">
                            / {usageStats?.storageLimit >= 1024 * 1024 * 1024 ? `${(usageStats?.storageLimit / (1024 * 1024 * 1024)).toFixed(0)} GB` : `${(usageStats?.storageLimit / (1024 * 1024)).toFixed(0)} MB`}
                        </span>
                    </div>
                    <div className="mt-1.5 wp-meter-track">
                        <div
                            className="wp-meter-bar"
                            style={{ width: `${Math.min((usageStats?.storageUsed / usageStats?.storageLimit) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between gap-3">
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--wp-text-muted)]" />
                    <input
                        type="text"
                        placeholder="Filter projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-8 h-7 text-xs"
                    />
                </div>
                <div className="inline-flex items-center p-0.5 rounded-md border border-[var(--wp-border-default)] bg-[var(--wp-bg-surface)] text-xs">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`h-6 px-2 rounded text-[11px] flex items-center justify-center transition-colors ${
                            viewMode === 'grid'
                                ? 'bg-[var(--wp-bg-active)] text-[var(--wp-text-primary)]'
                                : 'text-[var(--wp-text-muted)] hover:text-[var(--wp-text-primary)]'
                        }`}
                        title="Grid View"
                    >
                        <Grid className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`h-6 px-2 rounded text-[11px] flex items-center justify-center transition-colors ${
                            viewMode === 'list'
                                ? 'bg-[var(--wp-bg-active)] text-[var(--wp-text-primary)]'
                                : 'text-[var(--wp-text-muted)] hover:text-[var(--wp-text-primary)]'
                        }`}
                        title="List View"
                    >
                        <List className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Projects View */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => navigate(`/dashboard/projects/${encodeURIComponent(project.name)}`)}
                            className="wp-panel group hover:border-[var(--wp-border-strong)] transition-colors cursor-pointer flex flex-col justify-between"
                        >
                            <div className="wp-panel-header">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="wp-live-dot" />
                                    <span className="wp-title-card truncate font-medium">{project.name}</span>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[10.5px] font-mono text-[var(--wp-text-muted)]">
                                    Active
                                </span>
                            </div>

                            <div className="p-3 space-y-2 flex-1">
                                <div className="text-[11px] text-[var(--wp-text-muted)] font-mono flex items-center gap-1.5 truncate">
                                    <span className="px-1.5 py-0.5 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] truncate">
                                        {project.tracking_id?.toLowerCase() || 'trk_pending'}
                                    </span>
                                </div>
                                {project.allowed_origins && (
                                    <p className="text-[11px] text-[var(--wp-text-muted)] truncate">
                                        {project.allowed_origins}
                                    </p>
                                )}
                            </div>

                            <div className="px-3 py-2 border-t border-[var(--wp-border-subtle)] bg-[var(--wp-bg-subtle)]/40 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--wp-text-secondary)]">
                                    <span>{stats[project.id]?.total_views?.toLocaleString() || 0} hits</span>
                                    <span>•</span>
                                    <span>{stats[project.id]?.sessionCount?.toLocaleString() || 0} sessions</span>
                                </div>
                                <ArrowRight className="h-3.5 w-3.5 text-[var(--wp-text-muted)] group-hover:text-[var(--wp-text-primary)] transition-colors" />
                            </div>
                        </div>
                    ))}

                    {/* New Project Dropzone Frame */}
                    <button
                        onClick={() => setShowModal(true)}
                        disabled={projectsUsed >= projectLimit}
                        className="wp-studio-canvas border border-dashed border-[var(--wp-border-strong)] rounded-lg min-h-[140px] flex flex-col items-center justify-center p-4 hover:border-[var(--wp-text-secondary)] transition-colors text-center group disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <div className="w-7 h-7 rounded-md bg-[var(--wp-bg-surface)] border border-[var(--wp-border-default)] flex items-center justify-center text-[var(--wp-text-muted)] group-hover:text-[var(--wp-text-primary)] transition-colors mb-2">
                            <Plus className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-medium text-[var(--wp-text-primary)]">New Project</span>
                        <span className="text-[10.5px] font-mono text-[var(--wp-text-muted)] mt-0.5">
                            {projectsUsed >= projectLimit ? 'Quota reached' : 'Connect domain or API'}
                        </span>
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="wp-panel overflow-hidden">
                        <table className="table">
                            <thead>
                                <tr className="table-head">
                                    <th className="table-th">Project Name</th>
                                    <th className="table-th font-mono">Tracking ID</th>
                                    <th className="table-th text-right">Views</th>
                                    <th className="table-th text-right">Sessions</th>
                                    <th className="table-th text-right">Storage</th>
                                    <th className="table-th">Status</th>
                                    <th className="table-th text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProjects.map((project) => (
                                    <tr
                                        key={project.id}
                                        onClick={() => navigate(`/dashboard/projects/${encodeURIComponent(project.name)}`)}
                                        className="hover:bg-[var(--wp-bg-hover)] transition-colors cursor-pointer group"
                                    >
                                        <td className="table-td whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="wp-live-dot" />
                                                <span className="font-medium text-[var(--wp-text-primary)] truncate max-w-[200px]" title={project.name}>
                                                    {project.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="table-td whitespace-nowrap font-mono text-[11px] text-[var(--wp-text-muted)]">
                                            {project.tracking_id?.toLowerCase() || 'trk_pending'}
                                        </td>
                                        <td className="table-td whitespace-nowrap text-right font-mono tabular-nums">
                                            {stats[project.id]?.total_views?.toLocaleString() || 0}
                                        </td>
                                        <td className="table-td whitespace-nowrap text-right font-mono tabular-nums">
                                            {stats[project.id]?.sessionCount?.toLocaleString() || 0}
                                        </td>
                                        <td className="table-td whitespace-nowrap text-right font-mono tabular-nums">
                                            {stats[project.id]?.storageUsed < 1024 * 1024
                                                ? `${(stats[project.id]?.storageUsed / 1024).toFixed(1)} KB`
                                                : `${(stats[project.id]?.storageUsed / (1024 * 1024)).toFixed(1)} MB`
                                            }
                                        </td>
                                        <td className="table-td whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-mono text-emerald-400">
                                                <span className="wp-live-dot" />
                                                Operational
                                            </span>
                                        </td>
                                        <td className="table-td whitespace-nowrap text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/dashboard/projects/${encodeURIComponent(project.name)}/settings`);
                                                }}
                                                className="wp-btn wp-btn-secondary h-6 px-2 text-[11px]"
                                                title="Project Settings"
                                            >
                                                <Settings className="h-3 w-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setProjectName('');
                    setAllowedOrigins('');
                }}
                title="Create New Project"
            >
                <form onSubmit={handleCreateProject} className="space-y-4">
                    <div>
                        <label className="label">Project Name</label>
                        <input
                            type="text"
                            required
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="input"
                            placeholder="my-portfolio"
                        />
                        <p className="field-hint">Only letters, numbers, hyphens, and underscores allowed.</p>
                    </div>
                    <div>
                        <label className="label">Allowed Origins (optional)</label>
                        <input
                            type="text"
                            value={allowedOrigins}
                            onChange={(e) => setAllowedOrigins(e.target.value)}
                            className="input font-mono"
                            placeholder="https://example.com, https://app.example.com"
                        />
                        <p className="field-hint">Comma separated list of domains allowed to track.</p>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setShowModal(false);
                                setProjectName('');
                                setAllowedOrigins('');
                            }}
                            className="wp-btn wp-btn-secondary text-xs h-7 px-3"
                        >
                            Cancel
                        </button>
                        <button type="submit" disabled={creating} className="wp-btn wp-btn-primary text-xs h-7 px-3">
                            {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {creating ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
