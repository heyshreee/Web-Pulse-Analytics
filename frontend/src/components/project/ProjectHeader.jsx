import React from 'react';
import { ArrowLeft, ExternalLink, Calendar, Share2, Globe, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProjectHeader({ project, onShowShare }) {
  if (!project) return null;

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
      <div className="flex items-start gap-4">
        <div>
          <div className="text-sm text-slate-400 mb-1">
            Projects / <span className="text-white">{project.name}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 mb-3 mt-1">
            <h1 className="text-3xl font-bold text-white pr-2">{project.name}</h1>
            <div className="flex items-center">
              <span className={`px-2 py-[2px] rounded text-[10px] font-bold flex items-center gap-1.5 ${project.is_active !== false
                  ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                  : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${project.is_active !== false ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                {project.is_active !== false ? 'LIVE' : 'PAUSED'}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onShowShare}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Share Report
        </button>
      </div>
    </div>
  );
}
