import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { Copy, Key, Shield } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function APIKeys() {
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
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard', 'success');
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                        <Key className="h-5 w-5 text-violet-500" />
                    </div>
                    <div>
                        <h1 className="page-title">API Keys & Tracking IDs</h1>
                        <p className="page-sub">Manage your access keys and project tracking identifiers.</p>
                    </div>
                </div>
            </div>

            {/* Personal Access Token Section (Placeholder) */}
            <div className="card card-pad">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Personal Access Token</h2>
                        <p className="prose-quiet">Use this key to authenticate with the API programmatically.</p>
                    </div>
                    <span className="badge-violet shrink-0">Coming Soon</span>
                </div>

                <div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-500 font-bold font-mono text-xs shadow-inner uppercase tracking-widest">
                        <Key className="h-4 w-4" />
                        <span>obs_sk_................................</span>
                    </div>
                    <button disabled className="mt-4 btn-secondary btn-md">
                        Generate New Token
                    </button>
                </div>
            </div>

            {/* Project Tracking IDs */}
            <div className="card card-pad">
                <h2 className="page-title !text-xl mb-6">Project Tracking IDs</h2>

                <div className="space-y-3">
                    {projects.map(project => (
                        <div key={project.id} className="card card-pad card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4 !p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                                    <Shield className="h-5 w-5 text-violet-500" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">{project.name}</div>
                                    <div className="eyebrow mt-0.5">Created {new Date(project.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <code className="flex-1 sm:flex-none bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold font-mono text-xs shadow-inner">
                                    {project.tracking_id}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(project.tracking_id)}
                                    className="btn-secondary btn-sm"
                                    title="Copy ID"
                                >
                                    <Copy className="h-4 w-4" />
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
            </div>
        </div>
    );
}