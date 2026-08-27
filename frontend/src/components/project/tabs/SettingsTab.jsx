import React from 'react';
import {
  Settings, Loader2, AlertTriangle, ChevronRight, Save, X
} from 'lucide-react';
import CopyButton from '../../CopyButton';

export default function SettingsTab({
  project, projectName, setProjectName, setTargetUrl,
  isActive, onToggleActive, onDelete, onSave,
  saving, timezone, setTimezone,
  notifications, setNotifications,
  editing, setEditing
}) {
  return (
    <div className="space-y-8">
      {/* Project Information */}
      <div className="card card-pad">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="section-title mb-1">Project Information</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Update your project basics.</p>
          </div>
          {!editing && (
            <button
               onClick={() => setEditing(true)}
              className="btn-secondary btn-md"
            >
              <Settings className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>

        <div className="max-w-xl space-y-6">
          {/* Project Name */}
          <div>
            <label className="label">Project Name</label>
            <input
              type="text"
              value={projectName}
              disabled={!editing}
              onChange={(e) => setProjectName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
               className="input"
              placeholder="my-project"
            />
             <p className="field-hint">Only letters, numbers, hyphens, and underscores allowed.</p>
           </div>

          {/* Time Zone */}
          <div>
             <label className="label">Time Zone</label>
            <div className="relative">
               <select
                value={timezone}
                disabled={!editing}
                onChange={(e) => setTimezone(e.target.value)}
                className="input appearance-none cursor-pointer pr-10"
              >
                <option value="Asia/Kolkata">(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                <option value="UTC">(GMT+00:00) UTC</option>
                <option value="America/New_York">(GMT-05:00) Eastern Time (US & Canada)</option>
                <option value="America/Los_Angeles">(GMT-08:00) Pacific Time (US & Canada)</option>
              </select>
               <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronRight className="h-4 w-4 rotate-90" />
              </div>
            </div>
          </div>

           {/* Tracking ID */}
          <div>
            <label className="label">Tracking ID</label>
            <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
               <code className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">{project.tracking_id}</code>
               <CopyButton text={project.tracking_id} />
            </div>
          </div>
        </div>

        {editing && (
          <div className="flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-8">
            <button
              onClick={onSave}
              disabled={saving}
              className="btn-primary btn-md"
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
              className="btn-secondary btn-md"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

        {/* Notification Preferences */}
      <div className="card card-pad">
        <div className="mb-6">
          <h2 className="section-title mb-1">Notification Preferences</h2>
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
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${notifications[item.id] ? 'bg-slate-900 dark:bg-violet-500' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${notifications[item.id] ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card overflow-hidden border-red-100 dark:border-red-900/30">
        <div className="p-6 bg-red-500/5 dark:bg-red-950/10 border-b border-red-100 dark:border-red-900/20 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
           <h2 className="text-base font-semibold text-red-600 dark:text-red-500">Danger Zone</h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{isActive ? 'Disable Project' : 'Enable Project'}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Temporarily stop tracking traffic for this project.</p>
            </div>
            <button
               onClick={onToggleActive}
              className="btn-secondary btn-md whitespace-nowrap"
            >
               {isActive ? 'Disable Project' : 'Enable Project'}
            </button>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Delete Project</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Permanently delete this project and all of its analytics data.</p>
            </div>
            <button
              onClick={onDelete}
              className="btn-danger btn-md whitespace-nowrap"
            >
              Delete Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
