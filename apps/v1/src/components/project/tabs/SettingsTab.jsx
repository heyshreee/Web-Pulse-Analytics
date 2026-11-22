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
    <div className="space-y-3 font-sans">
      {/* Project Information */}
      <div className="wp-panel p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-sm font-medium text-ink mb-1">Project Information</h2>
            <p className="text-xs text-ink-muted">Manage your project credentials and regional preferences.</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="btn-secondary h-7 px-3 text-xs self-start sm:self-auto inline-flex items-center gap-1.5"
            >
              <Settings className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
        </div>

        <div className="max-w-xl space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-xs font-mono text-ink-secondary mb-1">Project Name</label>
            <input
              type="text"
              value={projectName}
              disabled={!editing}
              onChange={(e) => setProjectName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
              className="input font-mono text-xs h-8"
              placeholder="my-project"
            />
            <p className="text-[11px] text-ink-muted mt-1 font-mono">Only letters, numbers, hyphens, and underscores allowed.</p>
          </div>

          {/* Time Zone */}
          <div>
            <label className="block text-xs font-mono text-ink-secondary mb-1">Time Zone</label>
            <div className="relative">
              <select
                value={timezone}
                disabled={!editing}
                onChange={(e) => setTimezone(e.target.value)}
                className="input appearance-none cursor-pointer pr-10 text-xs h-8 font-mono"
              >
                <option value="Asia/Kolkata">(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                <option value="UTC">(GMT+00:00) UTC</option>
                <option value="America/New_York">(GMT-05:00) Eastern Time (US & Canada)</option>
                <option value="America/Los_Angeles">(GMT-08:00) Pacific Time (US & Canada)</option>
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted">
                <ChevronRight className="h-3.5 w-3.5 rotate-90" />
              </div>
            </div>
          </div>

          {/* Tracking ID */}
          <div>
            <label className="block text-xs font-mono text-ink-secondary mb-1">Tracking ID</label>
            <div className="flex items-center justify-between gap-3 p-2 bg-subtle border border-line rounded">
              <code className="text-xs font-mono text-ink">{project.tracking_id}</code>
              <CopyButton text={project.tracking_id} size="sm" />
            </div>
          </div>
        </div>

        {editing && (
          <div className="flex items-center gap-2 pt-4 border-t border-line mt-6">
            <button
              onClick={onSave}
              disabled={saving}
              className="btn-primary h-7 px-3 text-xs inline-flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
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
              className="btn-secondary h-7 px-3 text-xs inline-flex items-center gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="wp-panel p-5">
        <div className="mb-4">
          <h2 className="text-sm font-medium text-ink mb-1">Notification Preferences</h2>
          <p className="text-xs text-ink-muted">Configure telemetry alert channels and weekly performance recaps.</p>
        </div>

        <div className="space-y-3 divide-y divide-line">
          {[
            {
              id: 'trafficSpikes',
              title: 'Traffic Spikes',
              desc: 'Receive alerts when traffic increases by more than 50% in a single hour window.',
            },
            {
              id: 'weeklyDigest',
              title: 'Weekly Digest',
              desc: 'Summary of top performing domains, routes, and visitor momentum.',
            }
          ].map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 first:pt-0">
              <div>
                <h3 className="text-xs font-medium text-ink mb-0.5">{item.title}</h3>
                <p className="text-[11px] text-ink-muted">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${notifications[item.id] ? 'bg-ink' : 'bg-subtle border border-line'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full ${notifications[item.id] ? 'bg-canvas translate-x-4' : 'bg-ink-muted translate-x-1'} transition-transform`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="wp-panel border-red-500/20 overflow-hidden">
        <div className="p-4 border-b border-red-500/10 bg-red-500/5 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <h2 className="text-xs font-semibold text-red-500 uppercase tracking-wider font-mono">Danger Zone</h2>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-medium text-ink mb-0.5">{isActive ? 'Disable Project' : 'Enable Project'}</h4>
              <p className="text-[11px] text-ink-muted">Temporarily halt telemetry ingestion for this project ID.</p>
            </div>
            <button
              onClick={onToggleActive}
              className="btn-secondary h-7 px-3 text-xs self-start sm:self-auto"
            >
              {isActive ? 'Disable Project' : 'Enable Project'}
            </button>
          </div>

          <div className="h-px bg-line" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-medium text-red-500 mb-0.5">Delete Project</h4>
              <p className="text-[11px] text-ink-muted">Permanently erase this project and all associated telemetry records.</p>
            </div>
            <button
              onClick={onDelete}
              className="btn-danger h-7 px-3 text-xs self-start sm:self-auto"
            >
              Delete Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
