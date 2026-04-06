import React from 'react';
import { ArrowLeft, ExternalLink, Calendar, Share2, Globe, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProjectHeader({ project, onShowShare }) {
  if (!project) return null;

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
      <div className="flex items-start gap-4">
        <div>
          <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-2">
            Infrastructure / <span className="text-blue-600 dark:text-blue-400">{project.name}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 md:gap-4 mb-3 mt-1">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white pr-2 tracking-tighter leading-none">{project.name}</h1>
            <div className="flex items-center">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 uppercase tracking-widest ${project.is_active !== false
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm'
                  : 'bg-slate-500/10 text-slate-400 border border-slate-500/20 shadow-sm'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${project.is_active !== false ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                {project.is_active !== false ? 'Operational' : 'Paused'}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onShowShare}
          className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900/40 backdrop-blur-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/50 text-slate-900 dark:text-white rounded-2xl text-sm font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm uppercase tracking-widest"
        >
          <Share2 className="h-4 w-4 text-blue-500" />
          Share Intelligence
        </button>
      </div>
    </div>
  );
}
