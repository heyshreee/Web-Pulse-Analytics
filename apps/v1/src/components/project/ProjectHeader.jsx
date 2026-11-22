import React from 'react';
import { Link } from 'react-router-dom';
import { Share2 } from 'lucide-react';

export default function ProjectHeader({ project, onShowShare }) {
  if (!project) return null;

  return (
    <div className="page-header">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 mb-1.5">
          <Link to="/dashboard/projects" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
            Projects
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-slate-700 dark:text-slate-300 font-medium">{project.name}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="page-title pr-2">{project.name}</h2>
          <span className={`inline-flex w-max items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${project.is_active !== false
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${project.is_active !== false ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
            {project.is_active !== false ? 'Operational' : 'Paused'}
          </span>
        </div>
      </div>
      <button
        onClick={onShowShare}
        className="btn-secondary btn-sm"
      >
        <Share2 className="h-3.5 w-3.5 text-violet-500" />
        Share
      </button>
    </div>
  );
}
