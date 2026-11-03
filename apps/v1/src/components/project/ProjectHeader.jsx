import React from 'react';
import { Share2 } from 'lucide-react';

export default function ProjectHeader({ project, onShowShare }) {
  if (!project) return null;

  return (
    <div className="page-header">
      <div>
        <p className="eyebrow mb-2">
          Infrastructure / <span className="text-violet-600 dark:text-violet-400">{project.name}</span>
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="page-title pr-2">{project.name}</h2>
          <span className={`inline-flex w-max items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${project.is_active !== false
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${project.is_active !== false ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
            {project.is_active !== false ? 'Operational' : 'Paused'}
          </span>
        </div>
      </div>
      <button
        onClick={onShowShare}
        className="btn-secondary btn-md"
      >
        <Share2 className="h-4 w-4 text-violet-500" />
        Share
      </button>
    </div>
  );
}
