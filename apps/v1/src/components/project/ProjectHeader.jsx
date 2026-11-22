import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, ArrowLeft } from 'lucide-react';
import CopyButton from '../CopyButton';

export default function ProjectHeader({ project, onShowShare }) {
  if (!project) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--wp-border-subtle)]">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--wp-text-muted)] mb-1">
          <Link to="/dashboard/projects" className="inline-flex items-center gap-1 hover:text-[var(--wp-text-primary)] transition-colors">
            <ArrowLeft className="h-3 w-3" />
            Projects
          </Link>
          <span className="text-[var(--wp-border-strong)]">/</span>
          <span className="text-[var(--wp-text-primary)] font-medium">{project.name}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="wp-title-page">{project.name}</h1>
          
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-subtle)] text-[11px] font-mono text-[var(--wp-text-secondary)]">
            <span className={`w-1.5 h-1.5 rounded-full ${project.is_active !== false ? 'bg-[var(--wp-status-live)]' : 'bg-[var(--wp-text-muted)]'}`} />
            <span>{project.is_active !== false ? 'Operational' : 'Paused'}</span>
          </div>

          {project.tracking_id && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-subtle)] text-[11px] font-mono text-[var(--wp-text-secondary)]">
              <span>{project.tracking_id}</span>
              <CopyButton text={project.tracking_id} size="sm" />
            </div>
          )}
        </div>
      </div>
      <button
        onClick={onShowShare}
        className="wp-btn wp-btn-secondary h-7 px-2.5 text-xs gap-1.5 self-start sm:self-auto"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </button>
    </div>
  );
}
