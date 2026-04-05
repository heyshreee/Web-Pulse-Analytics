import { useState, useEffect } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import {
    Plus, ExternalLink, BarChart2, Trash2, Loader2, Pin,
    Search, Grid, List, MoreVertical, Folder, Zap, Database,
    Layout, ArrowRight, Eye, Users, Settings
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

    return (
        <div className="space-y-10 pb-20 transition-colors duration-500">
            {(deletingId || creating) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 dark:bg-slate-950/80 backdrop-blur-md">
                    <Spinner fullScreen={false} />
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Your Projects</h1>
                    <p className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl italic opacity-80">
                        Manage and monitor your connected domains and tracking infrastructure.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black rounded-2xl border border-blue-100 dark:border-blue-500/20 shadow-sm uppercase tracking-widest">
                        {user?.plan ? user.plan : 'Free'} Tier
                    </div>
                    <div className="relative group/btn">
                        <button
                            onClick={() => setShowModal(true)}
                            disabled={projectsUsed >= projectLimit}
                            className="inline-flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-2xl text-sm font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-black/10 dark:shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 uppercase tracking-widest border border-slate-900 dark:border-white"
                        >
                            <Plus className="h-5 w-5" />
                            Launch Project
                        </button>
                        {projectsUsed >= projectLimit && (
                            <div className="absolute top-full right-0 mt-2 w-48 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl text-xs text-slate-600 dark:text-slate-300 hidden group-hover/btn:block z-50">
                                Project limit reached. Please upgrade to Pro to create more projects.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[2rem] p-8 relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Project Capacity</span>
                        <Folder className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex items-baseline gap-3 relative z-10">
                        <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{projectsUsed}</span>
                        <span className="text-lg font-black text-slate-400 dark:text-slate-500 uppercase">/ {projectLimit}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800/50">
                        <div
                            className="h-full bg-blue-600 transition-all duration-700 ease-out"
                            style={{ width: `${(projectsUsed / projectLimit) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[2rem] p-8 relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Monthly Pulse</span>
                        <Zap className="h-6 w-6 text-amber-500" />
                    </div>
                    <div className="flex items-baseline gap-3 relative z-10">
                        <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{totalMonthlyViews > 1000 ? (totalMonthlyViews / 1000).toFixed(1) + 'K' : totalMonthlyViews}</span>
                        <span className="text-lg font-black text-slate-400 dark:text-slate-500 uppercase">/ {viewLimit >= 1000 ? (viewLimit / 1000).toFixed(0) + 'K' : viewLimit}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800/50">
                        <div
                            className="h-full bg-amber-500 transition-all duration-700 ease-out"
                            style={{ width: `${Math.min((totalMonthlyViews / viewLimit) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[2rem] p-8 relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Storage Load</span>
                        <Database className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div className="flex items-baseline gap-3 relative z-10">
                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {usageStats?.storageUsed < 1024 * 1024
                                ? `${(usageStats?.storageUsed / 1024).toFixed(1)} KB`
                                : usageStats?.storageUsed < 1024 * 1024 * 1024
                                    ? `${(usageStats?.storageUsed / (1024 * 1024)).toFixed(1)} MB`
                                    : `${(usageStats?.storageUsed / (1024 * 1024 * 1024)).toFixed(1)} GB`
                            }
                        </span>
                        <span className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest opacity-60">
                            of {usageStats?.storageLimit < 1024 * 1024 * 1024 ? `${(usageStats?.storageLimit / (1024 * 1024)).toFixed(0)}MB` : `${(usageStats?.storageLimit / (1024 * 1024 * 1024)).toFixed(0)}GB`}
                        </span>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800/50">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-700 ease-out"
                            style={{ width: `${Math.min((usageStats?.storageUsed / usageStats?.storageLimit) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-220 dark:border-slate-800/50 shadow-sm transition-all focus-within:shadow-md">
                <div className="relative w-full md:w-md group/search">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/search:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search projects by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-6 py-3.5 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-1.5 shadow-inner">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'grid' 
                                ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 shadow-md ring-1 ring-black/5 dark:ring-white/5' 
                                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            <Grid className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'list' 
                                ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 shadow-md ring-1 ring-black/5 dark:ring-white/5' 
                                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            <List className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Projects View */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => navigate(`/dashboard/projects/${encodeURIComponent(project.name)}`)}
                            className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[2rem] p-8 hover:border-blue-500/30 dark:hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5 transition-all group relative flex flex-col cursor-pointer shadow-sm group/card"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="p-4 bg-blue-600 shadow-lg shadow-blue-600/20 rounded-2xl group-hover/card:rotate-12 transition-transform">
                                    <Layout className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex gap-2">
                                     <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-500/20">Active</span>
                                </div>
                            </div>

                            <div className="mb-10 flex-1">
                                <h3 className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors mb-1">{project.name}</h3>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 flex items-center gap-2">
                                    <Database className="h-3 w-3" />
                                    {project.tracking_id}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/50">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-bold uppercase tracking-tight">
                                        <Eye className="h-4 w-4 text-slate-400" />
                                        <span>{stats[project.id]?.total_views?.toLocaleString() || 0} Pulses</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-bold uppercase tracking-tight">
                                        <Users className="h-4 w-4 text-slate-400" />
                                        <span>{stats[project.id]?.sessionCount?.toLocaleString() || 0} Sessions</span>
                                    </div>
                                </div>
                                <Link
                                    to={`/dashboard/projects/${encodeURIComponent(project.name)}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-3 bg-slate-900 dark:bg-white/5 text-white dark:text-white rounded-2xl group/link hover:bg-blue-600 transition-all active:scale-90"
                                >
                                    <ArrowRight className="h-5 w-5 rotate-[-45deg] group-hover/link:rotate-0 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ))}

                    {/* New Project Card */}
                    <button
                        onClick={() => setShowModal(true)}
                        disabled={projectsUsed >= projectLimit}
                        className="bg-white dark:bg-transparent border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group min-h-[250px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-800 disabled:hover:bg-transparent"
                    >
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full group-hover:scale-110 transition-transform">
                            <Plus className="h-6 w-6 text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-slate-900 dark:text-white font-bold mb-1">New Project</h3>
                            <p className="text-slate-500 text-sm">
                                {projectsUsed >= projectLimit ? 'Project limit reached' : 'Create a new tracking project'}
                            </p>
                        </div>
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
                                    <th className="px-8 py-5">Project Name</th>
                                    <th className="px-8 py-5">Total Views</th>
                                    <th className="px-8 py-5">Sessions</th>
                                    <th className="px-8 py-5">Storage</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {filteredProjects.map((project) => (
                                <tr
                                        key={project.id}
                                        onClick={() => navigate(`/dashboard/projects/${encodeURIComponent(project.name)}`)}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group shadow-sm border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                                    >
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-600 shadow-lg shadow-blue-600/10 rounded-2xl group-hover:rotate-12 transition-transform">
                                                    <Layout className="h-5 w-5 text-white" />
                                                </div>
                                                <span className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate max-w-[200px] tracking-tight" title={project.name}>{project.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 font-black tabular-nums tracking-tight">
                                            {stats[project.id]?.total_views?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 font-black tabular-nums tracking-tight">
                                            {stats[project.id]?.sessionCount?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 font-black tabular-nums tracking-tight">
                                            {stats[project.id]?.storageUsed < 1024 * 1024
                                                ? `${(stats[project.id]?.storageUsed / 1024).toFixed(1)} KB`
                                                : `${(stats[project.id]?.storageUsed / (1024 * 1024)).toFixed(1)} MB`
                                            }
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full border border-emerald-500/20 uppercase tracking-widest shadow-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                Operational
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/dashboard/projects/${encodeURIComponent(project.name)}/settings`);
                                                    }}
                                                    className="p-2.5 rounded-xl bg-slate-900 dark:bg-white/5 text-white dark:text-white hover:bg-blue-600 transition-all active:scale-90 shadow-md"
                                                    title="Project Settings"
                                                >
                                                    <Settings className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        disabled={projectsUsed >= projectLimit}
                        className="w-full py-4 bg-white dark:bg-transparent border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-blue-500/5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-800 disabled:hover:bg-transparent"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm font-bold">
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
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Project Name
                        </label>
                        <input
                            type="text"
                            required
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                            placeholder="my-portfolio"
                        />
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-2">Only letters, numbers, hyphens, and underscores allowed.</p>
                    </div>
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Allowed Origins (optional)
                        </label>
                        <input
                            type="text"
                            value={allowedOrigins}
                            onChange={(e) => setAllowedOrigins(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                            placeholder={`https://example.com, ${(import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')}`}
                        />
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-2">Comma separated list of domains allowed to track.</p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setShowModal(false);
                                setProjectName('');
                                setAllowedOrigins('');
                            }}
                            className="px-6 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all font-bold text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={creating}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                            {creating ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
