import { useState, useEffect } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import {
    Plus, BarChart2, Loader2, Search, Grid, List, Folder, Zap,
    Database, ArrowRight, Eye, Users, Settings
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useToast } from '../context/ToastContext';

export default function Projects() {
    const { user, loadUser, loadSidebarData, usageStats } = useOutletContext();
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [allowedOrigins, setAllowedOrigins] = useState('');
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [creating, setCreating] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
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
            setLoading(false);
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


    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;

        setDeletingId(id);
        try {
            await apiRequest(`/projects/${id}`, { method: 'DELETE' });
            showToast('Project deleted', 'success');
            loadProjects();
            loadUser();
            loadSidebarData();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const handleTogglePin = async (project) => {
        try {
            const updatedProject = await apiRequest(`/projects/${project.id}/pin`, { method: 'PUT' });
            setProjects(projects.map(p => p.id === project.id ? { ...p, is_pinned: updatedProject.is_pinned } : p));
            loadSidebarData();
            showToast(updatedProject.is_pinned ? 'Project pinned' : 'Project unpinned', 'success');
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    if (loading) return <Spinner />;

    const projectLimit = usageStats?.projectLimit || 5;
    const projectsUsed = projects.length;

    // Calculate total monthly views across all projects
    const totalMonthlyViews = Object.values(stats).reduce((acc, curr) => acc + (curr?.current_month_views || 0), 0);
    const viewLimit = usageStats?.monthlyLimit || 1000;

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const statCards = [
        {
            label: 'Project Capacity',
            icon: <Folder className="h-5 w-5 text-violet-500" />,
            value: projectsUsed,
            suffix: `/ ${projectLimit}`,
            pct: (projectsUsed / projectLimit) * 100,
            bar: 'bg-violet-500'
        },
        {
            label: 'Monthly Pulse',
            icon: <Zap className="h-5 w-5 text-amber-500" />,
            value: totalMonthlyViews > 1000 ? (totalMonthlyViews / 1000).toFixed(1) + 'K' : totalMonthlyViews,
            suffix: `/ ${viewLimit >= 1000 ? (viewLimit / 1000).toFixed(0) + 'K' : viewLimit}`,
            pct: Math.min((totalMonthlyViews / viewLimit) * 100, 100),
            bar: 'bg-amber-500'
        },
        {
            label: 'Storage Load',
            icon: <Database className="h-5 w-5 text-emerald-500" />,
            value: usageStats?.storageUsed < 1024 * 1024
                ? `${(usageStats?.storageUsed / 1024).toFixed(1)} KB`
                : usageStats?.storageUsed < 1024 * 1024 * 1024
                    ? `${(usageStats?.storageUsed / (1024 * 1024)).toFixed(1)} MB`
                    : `${(usageStats?.storageUsed / (1024 * 1024 * 1024)).toFixed(1)} GB`,
            suffix: `of ${usageStats?.storageLimit < 1024 * 1024 * 1024 ? `${(usageStats?.storageLimit / (1024 * 1024)).toFixed(0)}MB` : `${(usageStats?.storageLimit / (1024 * 1024 * 1024)).toFixed(0)}GB`}`,
            pct: Math.min((usageStats?.storageUsed / usageStats?.storageLimit) * 100, 100),
            bar: 'bg-emerald-500'
        },
    ];

    return (
        <div className="space-y-8 animate-fade-up">
            {(deletingId || creating) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 dark:bg-slate-950/80 backdrop-blur-md">
                    <Spinner fullScreen={false} />
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
                <div>
                    <h1 className="page-title">Your Projects</h1>
                    <p className="page-sub">Manage and monitor your connected domains and tracking infrastructure.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="badge-slate capitalize">{user?.plan ? user.plan : 'Free'} Tier</span>
                    <div className="relative group/btn">
                        <button
                            onClick={() => setShowModal(true)}
                            disabled={projectsUsed >= projectLimit}
                            className="btn-primary btn-md"
                        >
                            <Plus className="h-4 w-4" />
                            Launch Project
                        </button>
                        {projectsUsed >= projectLimit && (
                            <div className="absolute top-full right-0 mt-2 w-48 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lift text-xs text-slate-600 dark:text-slate-300 hidden group-hover/btn:block z-50">
                                Project limit reached. Please upgrade to Pro to create more projects.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((card) => (
                    <div key={card.label} className="card card-pad relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <span className="eyebrow">{card.label}</span>
                            {card.icon}
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-4xl font-bold text-slate-900 dark:text-white tracking-tight ${card.label === 'Storage Load' ? '!text-2xl' : ''}`}>{card.value}</span>
                            <span className="text-base font-medium text-slate-400 dark:text-slate-500">{card.suffix}</span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800/60">
                            <div className={`h-full ${card.bar} transition-all duration-700 ease-out`} style={{ width: `${card.pct}%` }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="card card-pad flex flex-col md:flex-row gap-4 justify-between items-center !p-4">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-10"
                    />
                </div>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                            ? 'text-violet-600 dark:text-violet-400 bg-white dark:bg-slate-700 shadow-sm'
                            : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <Grid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list'
                            ? 'text-violet-600 dark:text-violet-400 bg-white dark:bg-slate-700 shadow-sm'
                            : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Projects View */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => navigate(`/dashboard/projects/${encodeURIComponent(project.name)}`)}
                            className="card card-pad card-hover relative flex flex-col cursor-pointer group/card"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-slate-900 dark:bg-violet-500 text-white rounded-xl group-hover/card:scale-105 transition-transform">
                                    <BarChart2 className="h-5 w-5" />
                                </div>
                                <span className="badge-green">Active</span>
                            </div>

                            <div className="mb-8 flex-1">
                                <h3 className="font-bold text-slate-900 dark:text-white text-xl tracking-tight group-hover/card:text-violet-600 dark:group-hover/card:text-violet-400 transition-colors mb-1">{project.name}</h3>
                                <div className="eyebrow !tracking-[0.14em] flex items-center gap-1.5">
                                    <Database className="h-3 w-3" />
                                    {project.tracking_id}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                                        <Eye className="h-4 w-4 text-slate-400" />
                                        <span className="font-medium">{stats[project.id]?.total_views?.toLocaleString() || 0} Pulses</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                                        <Users className="h-4 w-4 text-slate-400" />
                                        <span className="font-medium">{stats[project.id]?.sessionCount?.toLocaleString() || 0} Sessions</span>
                                    </div>
                                </div>
                                <Link
                                    to={`/dashboard/projects/${encodeURIComponent(project.name)}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="btn-secondary btn-sm"
                                >
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    ))}

                    {/* New Project Card */}
                    <button
                        onClick={() => setShowModal(true)}
                        disabled={projectsUsed >= projectLimit}
                        className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:border-violet-400 hover:bg-violet-50/40 dark:hover:bg-violet-500/5 transition-all group min-h-[250px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:scale-110 transition-transform">
                            <Plus className="h-6 w-6 text-slate-400 group-hover:text-violet-500 dark:group-hover:text-violet-400" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-slate-900 dark:text-white font-semibold mb-1">New Project</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                {projectsUsed >= projectLimit ? 'Project limit reached' : 'Create a new tracking project'}
                            </p>
                        </div>
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="card overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.14em]">
                                    <th className="px-6 py-4">Project Name</th>
                                    <th className="px-6 py-4">Total Views</th>
                                    <th className="px-6 py-4">Sessions</th>
                                    <th className="px-6 py-4">Storage</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {filteredProjects.map((project) => (
                                    <tr
                                        key={project.id}
                                        onClick={() => navigate(`/dashboard/projects/${encodeURIComponent(project.name)}`)}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-slate-900 dark:bg-violet-500 text-white rounded-lg group-hover:scale-105 transition-transform">
                                                    <BarChart2 className="h-4 w-4" />
                                                </div>
                                                <span className="font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate max-w-[200px]" title={project.name}>{project.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 font-medium">
                                            {stats[project.id]?.total_views?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 font-medium">
                                            {stats[project.id]?.sessionCount?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 font-medium">
                                            {stats[project.id]?.storageUsed < 1024 * 1024
                                                ? `${(stats[project.id]?.storageUsed / 1024).toFixed(1)} KB`
                                                : `${(stats[project.id]?.storageUsed / (1024 * 1024)).toFixed(1)} MB`
                                            }
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="badge-green">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Operational
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/dashboard/projects/${encodeURIComponent(project.name)}/settings`);
                                                }}
                                                className="btn-ghost btn-sm"
                                                title="Project Settings"
                                            >
                                                <Settings className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        disabled={projectsUsed >= projectLimit}
                        className="w-full py-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:border-violet-400 hover:bg-slate-50 dark:hover:bg-violet-500/5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm font-medium">
                            {projectsUsed >= projectLimit ? 'Project Limit Reached' : 'Create New Project'}
                        </span>
                    </button>
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
                <form onSubmit={handleCreateProject}>
                    <div className="mb-5">
                        <label className="label">Project Name</label>
                        <input
                            type="text"
                            required
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="input"
                            placeholder="my-portfolio"
                        />
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mt-2">Only letters, numbers, hyphens, and underscores allowed.</p>
                    </div>
                    <div className="mb-6">
                        <label className="label">Allowed Origins (optional)</label>
                        <input
                            type="text"
                            value={allowedOrigins}
                            onChange={(e) => setAllowedOrigins(e.target.value)}
                            className="input"
                            placeholder={`https://example.com, ${(import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')}`}
                        />
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mt-2">Comma separated list of domains allowed to track.</p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setShowModal(false);
                                setProjectName('');
                                setAllowedOrigins('');
                            }}
                            className="btn-ghost btn-md"
                        >
                            Cancel
                        </button>
                        <button type="submit" disabled={creating} className="btn-primary btn-md">
                            {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                            {creating ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
