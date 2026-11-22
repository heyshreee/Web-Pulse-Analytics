import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { Copy, Key, Shield } from 'lucide-react';
import Reveal from '../components/Reveal';
import { useToast } from '../context/ToastContext';

export default function APIKeys() {
    const { setIsPageLoading } = useOutletContext() || {};
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await apiRequest('/projects');
            setProjects(data);
        } catch (err) {
            showToast('Failed to load projects', 'error');
        } finally {
            setLoading(false);
            setIsPageLoading?.(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard', 'success');
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                {/* Header Skeleton */}
                <div className="page-header">
                    <div className="page-header-title">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
                        <div className="space-y-2">
                            <div className="h-6 w-52 bg-slate-200 dark:bg-slate-800 rounded" />
                            <div className="h-3.5 w-72 bg-slate-200 dark:bg-slate-800/60 rounded" />
                        </div>
                    </div>
                </div>

                {/* Personal Access Token Card Skeleton */}
                <div className="card card-pad p-6 space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <div className="h-5 w-44 bg-slate-200 dark:bg-slate-800 rounded" />
                            <div className="h-3.5 w-80 bg-slate-200 dark:bg-slate-800/60 rounded" />
                        </div>
                        <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </div>
                    <div className="max-w-xl space-y-3">
                        <div className="h-12 w-full bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800" />
                        <div className="h-8 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    </div>
                </div>

                {/* Project Tracking IDs Card Skeleton */}
                <div className="card card-pad p-6 space-y-4">
                    <div className="space-y-2 mb-2">
                        <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-3.5 w-72 bg-slate-200 dark:bg-slate-800/60 rounded" />
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                                        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800/60 rounded" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="h-8 w-44 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                                    <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="page-header">
                <div className="page-header-title">
                    <div className="page-header-icon">
                        <Key className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="page-title">API Keys & Tracking IDs</h1>
                        <p className="page-sub">Manage your access keys and project tracking identifiers.</p>
                    </div>
                </div>
            </div>

            {/* Personal Access Token Section */}
            <div className="card card-pad">
                <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                        <h2 className="section-title mb-1">Personal access tokens</h2>
                        <p className="page-sub">Use personal access tokens to authenticate programmatic API requests.</p>
                    </div>
                    <span className="badge-violet shrink-0">Coming soon</span>
                </div>

                <div className="max-w-xl">
                    <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 dark:text-slate-500 font-mono text-xs shadow-inner">
                        <Key className="h-4 w-4 shrink-0" />
                        <span className="tracking-wider">wp_pat_••••••••••••••••••••••••••••••••</span>
                    </div>
                    <button disabled className="mt-3.5 btn-secondary btn-sm opacity-60 cursor-not-allowed">
                        Generate new token
                    </button>
                </div>
            </div>

            {/* Project Tracking IDs */}
            <Reveal delay={60} className="card card-pad">
                <div className="mb-5">
                    <h2 className="section-title mb-1">Project tracking IDs</h2>
                    <p className="page-sub">Unique project identifiers required for client-side analytics scripts.</p>
                </div>

                <div className="space-y-3">
                    {projects.map(project => (
                        <div key={project.id} className="card card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                            <div className="flex items-center gap-3.5">
                                <div className="page-header-icon">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900 dark:text-white text-base tracking-tight">{project.name}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Created {new Date(project.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 w-full sm:w-auto">
                                <code className="flex-1 sm:flex-none bg-slate-50 dark:bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">
                                    {project.tracking_id?.toLowerCase()}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(project.tracking_id?.toLowerCase())}
                                    className="btn-secondary btn-sm"
                                    title="Copy ID"
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                    <span>Copy</span>
                                </button>
                            </div>
                        </div>
                    ))}

                    {projects.length === 0 && (
                        <div className="card card-pad py-14 text-center">
                            <Key className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-5">
                                No projects found. Create a project to get a tracking ID.
                            </p>
                            <Link to="/dashboard/projects" className="btn-primary btn-sm">
                                Create a Project
                            </Link>
                        </div>
                    )}
                </div>
            </Reveal>
        </div>
    );
}