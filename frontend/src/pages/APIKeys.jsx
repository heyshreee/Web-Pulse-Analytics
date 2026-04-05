import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { Copy, Key, Shield, Loader2 } from 'lucide-react';
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
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">API Keys & Tracking IDs</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage your access keys and project tracking identifiers.</p>
            </div>

            {/* Personal Access Token Section (Placeholder) */}
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-8 shadow-sm dark:shadow-xl">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Personal Access Token</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Use this key to authenticate with the API programmatically.</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-100 dark:border-blue-500/20 shadow-sm">
                        Coming Soon
                    </span>
                </div>

                <div className="relative">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-500 font-bold font-mono text-xs shadow-inner uppercase tracking-widest">
                        <Key className="h-4 w-4" />
                        <span>obs_sk_................................</span>
                    </div>
                    <button disabled className="mt-4 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl text-sm font-bold cursor-not-allowed border border-slate-200 dark:border-slate-700 shadow-sm transition-all grayscale">
                        Generate New Token
                    </button>
                </div>
            </div>

            {/* Project Tracking IDs */}
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-xl">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Project Tracking IDs</h2>

                <div className="space-y-4">
                    {projects.map(project => (
                        <div key={project.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl group hover:border-blue-400 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-lg hover:scale-[1.005]">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-xl transition-all group-hover:scale-110 shadow-sm">
                                    <Shield className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">{project.name}</div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Created {new Date(project.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <code className="flex-1 sm:flex-none bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold font-mono text-xs shadow-inner">
                                    {project.tracking_id}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(project.tracking_id)}
                                    className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                                    title="Copy ID"
                                >
                                    <Copy className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {projects.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            No projects found. Create a project to get a tracking ID.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
