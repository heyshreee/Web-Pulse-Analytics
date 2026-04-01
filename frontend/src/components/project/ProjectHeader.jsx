import React from 'react';
import { ArrowLeft, ExternalLink, Calendar, Share2, Globe, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProjectHeader({ project, onShowShare }) {
  if (!project) return null;

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
      <div className="flex items-start gap-6">
        <Link
          to="/dashboard/projects"
          className="mt-1 p-3 bg-[#0C0E17] border border-[#1E293B] text-slate-500 hover:text-white rounded-2xl transition-all group shadow-xl hover:shadow-blue-500/10"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        </Link>
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 mb-2">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase">{project.name}</h1>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] italic border ${
                project.is_active !== false 
                  ? 'bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                  : 'bg-red-500/10 text-red-500 border-red-500/20'
              }`}>
                {project.is_active !== false ? 'Live Protocol' : 'Paused Node'}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-blue-500" />
              Registry: {new Date(project.created_at).toLocaleDateString()}
            </div>
            {project.target_url && (
              <a 
                href={project.target_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors group"
              >
                <Globe className="h-3.5 w-3.5 text-blue-500 group-hover:animate-pulse" />
                {new URL(project.target_url).hostname}
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            )}
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-blue-500" />
              ID: {project.tracking_id?.substring(0, 8)}...
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onShowShare}
          className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/30 active:scale-95 group"
        >
          <Share2 className="h-4 w-4 group-hover:rotate-12 transition-transform" />
          Dispatch Report
        </button>
      </div>
    </div>
  );
}
