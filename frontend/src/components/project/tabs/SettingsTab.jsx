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
    <div className="space-y-6 pb-20">
      {/* Project Information */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Project Information</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Update your project basics.</p>
          </div>
          {!editing && (
            <button
               onClick={() => setEditing(true)}
              className="px-4 py-2 bg-white dark:bg-transparent border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <Settings className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>

        <div className="space-y-6 mb-8">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Project Name</label>
            <input
              type="text"
              value={projectName}
              disabled={!editing}
              onChange={(e) => setProjectName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
               className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 transition-all"
              placeholder="my-project"
            />
             <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-2">Only letters, numbers, hyphens, and underscores allowed.</p>
           </div>

          {/* Time Zone */}
          <div>
             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Time Zone</label>
            <div className="relative">
               <select
                value={timezone}
                disabled={!editing}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none disabled:opacity-60 transition-all cursor-pointer"
              >
                <option value="Asia/Kolkata">(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                <option value="UTC">(GMT+00:00) UTC</option>
                <option value="America/New_York">(GMT-05:00) Eastern Time (US & Canada)</option>
                <option value="America/Los_Angeles">(GMT-08:00) Pacific Time (US & Canada)</option>
              </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronRight className="h-4 w-4 rotate-90" />
              </div>
            </div>
           </div>
           
           {/* Tracking ID */}
           <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tracking ID</label>
             <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-inner">
                <code className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">{project.tracking_id}</code>
                <CopyButton text={project.tracking_id} />
             </div>
           </div>
        </div>

        {editing && (
          <div className="flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
             <button
              onClick={onSave}
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
             <button
              onClick={() => {
                setEditing(false);
                setProjectName(project.name);
                setTargetUrl(project.target_url || '');
                setTimezone(project.timezone || '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi');
              }}
              disabled={saving}
              className="px-6 py-2.5 bg-white dark:bg-transparent border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

        {/* Notification Preferences */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-xl">
         <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Notification Preferences</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Stay updated on your website's traffic performance.</p>
        </div>

        <div className="space-y-6">
          {[
            {
               id: 'trafficSpikes',
              title: 'Traffic Spikes',
              desc: 'Get an email notification when traffic increases by more than 50% in an hour.',
            },
            {
               id: 'weeklyDigest',
              title: 'Weekly Digest',
              desc: 'Receive a weekly summary of your top performing pages and visitor growth.',
            }
          ].map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
               <button
                onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${notifications[item.id] ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${notifications[item.id] ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-slate-900/50 border border-red-100 dark:border-red-900/30 rounded-xl overflow-hidden shadow-sm dark:shadow-xl shadow-red-500/5">
        <div className="p-6 bg-red-500/5 dark:bg-red-950/10 border-b border-red-100 dark:border-red-900/20 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
           <h2 className="text-lg font-bold text-red-600 dark:text-red-500">Danger Zone</h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{isActive ? 'Disable Project' : 'Enable Project'}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Temporarily stop tracking traffic for this project.</p>
            </div>
            <button
               onClick={onToggleActive}
              className="px-6 py-2.5 bg-white dark:bg-transparent border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl text-sm font-bold transition-all whitespace-nowrap shadow-sm"
            >
               {isActive ? 'Disable Project' : 'Enable Project'}
            </button>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-red-600 dark:text-red-400 mb-1">Delete Project</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Permanently delete this project and all of its analytics data.</p>
            </div>
             <button
              onClick={onDelete}
              className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-600 dark:text-red-500 rounded-xl text-sm font-bold transition-all whitespace-nowrap shadow-sm"
            >
              Delete Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
