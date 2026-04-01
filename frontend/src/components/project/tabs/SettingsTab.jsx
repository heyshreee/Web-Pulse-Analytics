import React from 'react';
import { 
  Settings, Loader2, AlertTriangle, Globe, Clock, Hash, Check, 
  Bell, ShieldAlert, Trash2, ShieldOff, Zap, Activity, Cpu, 
  ChevronRight, Save, X
} from 'lucide-react';
import CopyButton from '../../CopyButton';

export default function SettingsTab({
  project, projectName, setProjectName, 
  targetUrl, setTargetUrl, 
  isActive, onToggleActive, onDelete, onSave, 
  saving, timezone, setTimezone, 
  notifications, setNotifications, 
  editing, setEditing
}) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Project Configuration Core */}
      <div className="bg-[#0C0E17] border border-[#1E293B] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500/30 via-transparent to-transparent"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/10 shadow-[0_10px_30px_rgba(59,130,246,0.1)]">
              <Cpu className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight italic uppercase">Protocol Configuration</h2>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic pt-1">Core node identity and synchronization</p>
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-8 py-3.5 bg-[#06080F] border border-[#1E293B] text-slate-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all italic flex items-center gap-3 group/btn shadow-xl hover:border-blue-500/30"
            >
              <Settings className="h-4 w-4 group-hover/btn:rotate-180 transition-transform duration-1000" />
              Tune Protocol
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Project Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <Globe className="h-4 w-4 text-blue-500" />
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Cluster Identifier</label>
            </div>
            <div className="relative group/input">
              <input
                type="text"
                value={projectName}
                disabled={!editing}
                onChange={(e) => setProjectName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                className="w-full bg-[#06080F] border border-[#1E293B] rounded-2xl px-6 py-4 text-sm font-bold text-white italic focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all disabled:opacity-40 disabled:grayscale selection:bg-blue-500/30"
                placeholder="PROT-ALPHA-01"
              />
              {!editing && (
                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                  <div className="bg-[#0B0D16] text-[8px] font-black text-slate-700 px-3 py-1.5 rounded-[10px] border border-[#1E293B] uppercase tracking-widest italic">Immutable</div>
                </div>
              )}
            </div>
            <p className="text-[9px] text-slate-700 font-bold px-1 uppercase tracking-tight italic">Identifier utilized in global dispatch nodes.</p>
          </div>

          {/* Temporal Alignment */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <Clock className="h-4 w-4 text-purple-500" />
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Temporal Alignment</label>
            </div>
            <div className="relative">
              <select
                value={timezone}
                disabled={!editing}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-[#06080F] border border-[#1E293B] rounded-2xl px-6 py-4 text-sm font-bold text-white italic focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 appearance-none disabled:opacity-40 disabled:grayscale transition-all"
              >
                <option value="Asia/Kolkata"> (GMT+05:30) ASIA / IST PROTOCOL</option>
                <option value="UTC"> (GMT+00:00) GLOBAL / UTC PROTOCOL</option>
                <option value="America/New_York"> (GMT-05:00) US / EST PROTOCOL</option>
                <option value="America/Los_Angeles"> (GMT-08:00) US / PST PROTOCOL</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronRight className="h-5 w-5 rotate-90" />
              </div>
            </div>
            <p className="text-[9px] text-slate-700 font-bold px-1 uppercase tracking-tight italic">Synchronizes telemetry cycles across distributed nodes.</p>
          </div>
        </div>

        {/* Global Dispatch Tracking ID */}
        <div className="mb-12 p-6 bg-[#06080F] border border-[#1E293B] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden group/id">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/30"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="p-3 bg-[#0B0D16] border border-[#1E293B] rounded-xl">
              <Hash className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1 italic">Dispatched Tracking ID</p>
              <code className="text-base font-black text-white italic tracking-widest">{project.tracking_id}</code>
            </div>
          </div>
          <div className="relative z-10">
            <CopyButton text={project.tracking_id} label="Clone Signature" />
          </div>
        </div>

        {editing && (
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-10 border-t border-[#1E293B]/50 animate-in slide-in-from-bottom-4 duration-700">
            <button
              onClick={onSave}
              disabled={saving}
              className="flex-1 w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/30 transition-all italic"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Commit Configuration
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setProjectName(project.name);
                setTargetUrl(project.target_url || '');
                setTimezone(project.timezone || '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi');
              }}
              disabled={saving}
              className="flex-1 w-full sm:w-auto px-10 py-4 bg-[#0B0D16] border border-[#1E293B] text-slate-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all italic flex items-center justify-center gap-3 hover:bg-[#1E293B]/50"
            >
              <X className="h-5 w-5" />
              Abort Changes
            </button>
          </div>
        )}
      </div>

      {/* Intelligence Preferences */}
      <div className="bg-[#0C0E17] border border-[#1E293B] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 blur-3xl rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        
        <div className="flex items-center gap-5 mb-12">
          <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-500 border border-purple-500/10 shadow-[0_10px_30px_rgba(168,85,247,0.1)]">
            <Bell className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight uppercase italic leading-none">Intelligence Heartbeats</h2>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic pt-1.5">Manage node-to-entity dispatch logs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { 
              id: 'trafficSpikes', 
              title: 'Telemetry Surge', 
              desc: 'High-frequency magnitude shift alerts (+50%)', 
              icon: <Zap className="h-5 w-5" />,
              color: 'text-yellow-500',
              bg: 'bg-yellow-500/10'
            },
            { 
              id: 'weeklyDigest', 
              title: 'Cluster Intelligence', 
              desc: 'Synchronized weekly topology growth digest', 
              icon: <Activity className="h-5 w-5" />,
              color: 'text-blue-500',
              bg: 'bg-blue-500/10'
            }
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-6 bg-[#06080F]/50 border border-[#1E293B] rounded-2xl hover:border-slate-700 transition-all group/toggle shadow-xl">
              <div className="flex items-center gap-5">
                <div className={`p-3.5 rounded-xl ${item.bg} ${item.color} border border-current/10 shadow-lg`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic">{item.title}</h3>
                  <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tight leading-relaxed max-w-[160px] italic pt-0.5">{item.desc}</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                className={`w-14 h-7 rounded-full transition-all duration-500 relative ${notifications[item.id] ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-[#0B0D16] border border-[#1E293B]'}`}
              >
                <div className={`absolute top-1.5 left-1.5 w-4 h-4 rounded-full shadow-2xl transition-all duration-500 ${notifications[item.id] ? 'translate-x-7 bg-white scale-110' : 'translate-x-0 bg-slate-700'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Extreme Operations / Danger Zone */}
      <div className="bg-[#0C0101] border border-red-950/30 rounded-[2.5rem] overflow-hidden shadow-2xl relative group/danger">
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover/danger:opacity-10 transition-all duration-1000 pointer-events-none -mr-10 -mt-10">
          <ShieldAlert className="h-64 w-64 text-red-500 -rotate-12" />
        </div>
        
        <div className="p-10 border-b border-red-950/20 bg-red-950/5 flex items-center gap-6">
          <div className="p-4 bg-red-500/10 rounded-2xl text-red-600 border border-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-600 uppercase tracking-[0.3em] italic leading-none">EXTREME OPERATIONS</h2>
            <p className="text-[9px] text-red-950/60 font-black uppercase tracking-[0.4em] italic pt-2">Irreversible Cluster Destruction Protocols</p>
          </div>
        </div>

        <div className="p-10 space-y-10">
          {/* Status Override */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 p-8 bg-[#060000] rounded-2xl border border-red-950/20 shadow-inner">
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-2xl ${isActive ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'} border border-current/10`}>
                {isActive ? <ShieldOff className="h-6 w-6" /> : <Check className="h-6 w-6" />}
              </div>
              <div>
                <h4 className="text-sm font-black text-white mb-1 uppercase tracking-widest italic">{isActive ? 'Decommission Nodes' : 'Reactivate Ingress'}</h4>
                <p className="text-[10px] text-slate-700 font-bold uppercase tracking-tight italic">Temporarily halt all temporal telemetry for this cluster.</p>
              </div>
            </div>
            <button
              onClick={onToggleActive}
              className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all italic border ${isActive ? 'bg-red-500/5 text-red-600 border-red-500/10 hover:bg-red-600 hover:text-white' : 'bg-green-600/5 text-green-500 border-green-600/10 hover:bg-green-600 hover:text-white'} shadow-2xl`}
            >
              {isActive ? 'HALT CLUSTER' : 'INITIALIZE'}
            </button>
          </div>

          <div className="h-[1px] bg-red-950/20" />

          {/* Purge Protocol */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 p-8 bg-red-950/5 rounded-2xl border border-red-900/10 relative overflow-hidden">
            <div className="flex items-center gap-6 relative z-10">
              <div className="p-4 bg-red-600/10 rounded-2xl text-red-600 border border-red-600/10 animate-pulse">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-red-600 mb-1 uppercase tracking-widest italic">PURGE PROTOCOL</h4>
                <p className="text-[10px] text-red-900/60 font-bold uppercase tracking-tight leading-relaxed max-w-sm italic">Irreversibly vaporize all analytics datasets, nodes, and configurations for this cluster ID.</p>
              </div>
            </div>
            <button
              onClick={onDelete}
              className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-[0_15px_40px_rgba(220,38,38,0.3)] italic relative z-10"
            >
              DESTROY CLUSTER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
