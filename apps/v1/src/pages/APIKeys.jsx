import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { Copy, Key } from 'lucide-react';
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
            <div className="space-y-3 font-sans animate-pulse">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center h-8">
                    <div className="space-y-1">
                        <div className="h-4 w-44 bg-[var(--wp-border-default)] rounded" />
                        <div className="h-3 w-64 bg-[var(--wp-border-subtle)] rounded hidden sm:block" />
                    </div>
                </div>

                {/* Personal Access Token Skeleton */}
                <div className="wp-panel bg-[var(--wp-bg-surface)]">
                    <div className="wp-panel-header">
                        <div className="h-3.5 w-36 bg-[var(--wp-border-subtle)] rounded" />
                        <div className="h-3.5 w-20 bg-[var(--wp-border-subtle)] rounded" />
                    </div>
                    <div className="p-3 sm:p-4 space-y-3">
                        <div className="h-3 w-80 bg-[var(--wp-border-subtle)] rounded" />
                        <div className="h-8 w-full max-w-md bg-[var(--wp-bg-subtle)] rounded border border-[var(--wp-border-subtle)]" />
                    </div>
                </div>

                {/* Project Tracking IDs Skeleton */}
                <div className="wp-panel bg-[var(--wp-bg-surface)]">
                    <div className="wp-panel-header">
                        <div className="h-3.5 w-36 bg-[var(--wp-border-subtle)] rounded" />
                        <div className="h-3.5 w-20 bg-[var(--wp-border-subtle)] rounded" />
                    </div>
                    <div className="p-3 space-y-2">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="h-10 rounded border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-canvas)]" />
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
                    <h1 className="wp-title-page">API Keys & Tracking IDs</h1>
                    <p className="text-[11.5px] text-[var(--wp-text-muted)] mt-0.5">
                        Manage your access keys and project tracking identifiers.
                    </p>
                </div>
            </div>

            {/* Personal Access Token Section */}
            <div className="wp-panel bg-[var(--wp-bg-surface)]">
                <div className="wp-panel-header">
                    <span className="wp-title-card">Personal access tokens</span>
                    <span className="wp-metric-mono text-[10.5px] text-[var(--wp-text-muted)] px-1.5 py-0.5 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] uppercase">
                        Coming soon
                    </span>
                </div>

                <div className="p-3 sm:p-4 space-y-3 max-w-xl">
                    <p className="text-[11.5px] text-[var(--wp-text-muted)]">
                        Authenticate programmatic API and telemetry ingest endpoints securely with a scoped bearer key.
                    </p>
                    <div className="flex items-center justify-between p-2.5 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] font-mono text-xs text-[var(--wp-text-muted)]">
                        <div className="flex items-center gap-2">
                            <Key className="h-3.5 w-3.5 text-[var(--wp-text-muted)]" />
                            <span className="tracking-wider">wp_sk_••••••••••••••••••••••••••••••••</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        disabled
                        className="wp-btn wp-btn-secondary text-xs h-7 px-2.5 opacity-50 cursor-not-allowed"
                    >
                        Generate new token
                    </button>
                </div>
            </div>

            {/* Project Tracking IDs */}
            <div className="wp-panel bg-[var(--wp-bg-surface)]">
                <div className="wp-panel-header">
                    <span className="wp-title-card">Project tracking IDs</span>
                    <span className="text-[11px] font-mono text-[var(--wp-text-muted)]">
                        {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                    </span>
                </div>

                <div className="p-3 space-y-2">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] hover:border-[var(--wp-border-strong)] transition-colors"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className="wp-live-dot" />
                                <div className="min-w-0">
                                    <Link
                                        to={`/dashboard/projects/${encodeURIComponent(project.name)}`}
                                        className="text-xs font-medium text-[var(--wp-text-primary)] hover:underline truncate block"
                                    >
                                        {project.name}
                                    </Link>
                                    <span className="text-[10.5px] font-mono text-[var(--wp-text-muted)]">
                                        Created {new Date(project.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <code className="flex-1 sm:flex-none bg-[var(--wp-bg-subtle)] px-2.5 py-1 rounded border border-[var(--wp-border-subtle)] text-[var(--wp-text-secondary)] font-mono text-[11px] truncate">
                                    {project.tracking_id?.toLowerCase() || 'trk_pending'}
                                </code>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(project.tracking_id?.toLowerCase() || '')}
                                    className="wp-btn wp-btn-secondary h-6 text-[11px] px-2 gap-1 shrink-0"
                                    title="Copy Tracking ID"
                                >
                                    <Copy className="h-3 w-3" />
                                    <span>Copy</span>
                                </button>
                            </div>
                        </div>
                    ))}

                    {projects.length === 0 && (
                        <div className="wp-studio-canvas p-8 text-center space-y-2 rounded border border-[var(--wp-border-subtle)]">
                            <Key className="h-6 w-6 text-[var(--wp-text-muted)] mx-auto" />
                            <p className="text-xs text-[var(--wp-text-secondary)]">
                                No projects registered yet. Create a project to receive a tracking ID.
                            </p>
                            <Link to="/dashboard/projects" className="wp-btn wp-btn-primary text-xs h-7 px-3 inline-flex">
                                Create a Project
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}