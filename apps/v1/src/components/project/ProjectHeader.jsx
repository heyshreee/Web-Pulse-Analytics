import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, ArrowLeft } from 'lucide-react';
import CopyButton from '../CopyButton';

export default function ProjectHeader({ project, onShowShare }) {
  if (!project) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1.5">
          <Link to="/dashboard/projects" className="inline-flex items-center gap-1 hover:text-ink transition-colors">
            <ArrowLeft className="h-3 w-3" />
            Projects
          </Link>
          <span>/</span>
          <span className="text-ink font-medium">{project.name}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight text-ink">{project.name}</h1>
          
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-line bg-subtle text-xs font-mono text-ink-secondary">
            <span className={`w-1.5 h-1.5 rounded-full ${project.is_active !== false ? 'bg-emerald-500' : 'bg-ink-muted'}`} />
            <span>{project.is_active !== false ? 'Operational' : 'Paused'}</span>
          </div>

          {project.tracking_id && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-line bg-subtle text-xs font-mono text-ink-secondary">
              <span>{project.tracking_id}</span>
              <CopyButton text={project.tracking_id} size="sm" />
            </div>
          )}
        </div>
      </div>
      <button
        onClick={onShowShare}
        className="btn-secondary h-7 px-3 text-xs self-start sm:self-auto"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </button>
    </div>
  );
}
