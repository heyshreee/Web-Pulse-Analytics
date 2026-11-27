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
      <div className="wp-panel bg-[var(--wp-bg-surface)]">
        <div className="wp-panel-header">
          <span className="wp-title-card">Project Information</span>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="wp-btn wp-btn-secondary h-7 px-2.5 text-xs inline-flex items-center gap-1.5"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
          )}
        </div>

        <div className="p-3.5 sm:p-4 max-w-xl space-y-3">
          {/* Project Name */}
          <div>
            <label className="wp-label-section uppercase block mb-1">Project Name</label>
            <input
              type="text"
              value={projectName}
              disabled={!editing}
              onChange={(e) => setProjectName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
              className="w-full h-8 px-2.5 text-xs font-mono rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] text-[var(--wp-text-primary)] focus:border-[var(--wp-border-strong)] focus:outline-none disabled:opacity-50"
              placeholder="my-project"
            />
            <p className="text-[11px] text-[var(--wp-text-muted)] mt-1 font-mono">Only letters, numbers, hyphens, and underscores allowed.</p>
          </div>

          {/* Time Zone */}
          <div>
            <label className="wp-label-section uppercase block mb-1">Time Zone</label>
            <div className="relative">
              <select
                value={timezone}
                disabled={!editing}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-8 px-2.5 appearance-none cursor-pointer pr-10 text-xs font-mono rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] text-[var(--wp-text-primary)] focus:border-[var(--wp-border-strong)] focus:outline-none disabled:opacity-50"
              >
                <option value="Asia/Kolkata">(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                <option value="UTC">(GMT+00:00) UTC</option>
                <option value="America/New_York">(GMT-05:00) Eastern Time (US & Canada)</option>
                <option value="America/Los_Angeles">(GMT-08:00) Pacific Time (US & Canada)</option>
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--wp-text-muted)]">
                <ChevronRight className="h-3.5 w-3.5 rotate-90" />
              </div>
            </div>
          </div>

          {/* Tracking ID */}
          <div>
            <label className="wp-label-section uppercase block mb-1">Tracking ID</label>
            <div className="flex items-center justify-between gap-3 p-2 bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] rounded font-mono">
              <code className="text-xs text-[var(--wp-text-primary)]">{project.tracking_id}</code>
              <CopyButton text={project.tracking_id} size="sm" />
            </div>
          </div>

          {editing && (
            <div className="flex items-center gap-2 pt-3 border-t border-[var(--wp-border-subtle)] mt-4">
              <button
                onClick={onSave}
                disabled={saving}
                className="wp-btn wp-btn-primary h-7 px-3 text-xs inline-flex items-center gap-1.5"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>Save Changes</span>
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setProjectName(project.name);
                  setTargetUrl(project.target_url || '');
                  setTimezone(project.timezone || '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi');
                }}
                disabled={saving}
                className="wp-btn wp-btn-secondary h-7 px-3 text-xs inline-flex items-center gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="wp-panel bg-[var(--wp-bg-surface)]">
        <div className="wp-panel-header">
          <span className="wp-title-card">Notification Preferences</span>
          <span className="wp-metric-mono text-[10.5px] text-[var(--wp-text-muted)]">Alerts & digests</span>
        </div>

        <div className="p-3.5 sm:p-4 space-y-2 divide-y divide-[var(--wp-border-subtle)]">
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
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <div>
                <p className="text-xs font-medium text-[var(--wp-text-primary)]">{item.title}</p>
                <p className="text-[11px] text-[var(--wp-text-muted)] mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  notifications[item.id] ? 'bg-[var(--wp-accent-solid)]' : 'bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-default)]'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full ${
                  notifications[item.id] ? 'bg-[var(--wp-text-inverted)] translate-x-4' : 'bg-[var(--wp-text-muted)] translate-x-1'
                } transition-transform`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Team Members (1/1 Owner on Nano) */}
      <div className="wp-panel bg-[var(--wp-bg-surface)]">
        <div className="wp-panel-header">
          <span className="wp-title-card">Team Access</span>
          <span className="text-[10.5px] font-mono text-[var(--wp-text-muted)]">1 / 1 Owner Seat</span>
        </div>
        <div className="p-3.5 sm:p-4 space-y-2 text-xs">
          <p className="text-[var(--wp-text-secondary)]">
            Nano includes 1 owner seat. Team invitations and role-based access control require Pro or higher.
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="wp-panel border-rose-500/20 overflow-hidden bg-[var(--wp-bg-surface)]">
        <div className="wp-panel-header bg-rose-500/5 border-b border-rose-500/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            <span className="wp-title-card text-rose-400">Danger Zone</span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-[var(--wp-text-primary)]">{isActive ? 'Disable Project' : 'Enable Project'}</p>
              <p className="text-[11px] text-[var(--wp-text-muted)] mt-0.5">Temporarily halt telemetry ingestion for this project ID.</p>
            </div>
            <button
              onClick={onToggleActive}
              className="wp-btn wp-btn-secondary h-7 px-3 text-xs self-start sm:self-auto"
            >
              {isActive ? 'Disable Project' : 'Enable Project'}
            </button>
          </div>

          <div className="border-t border-[var(--wp-border-subtle)] pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-rose-400">Delete Project</p>
              <p className="text-[11px] text-[var(--wp-text-muted)] mt-0.5">Permanently erase this project and all associated telemetry records.</p>
            </div>
            <button
              onClick={onDelete}
              className="wp-btn wp-btn-secondary h-7 px-3 text-xs text-rose-400 hover:text-rose-300 hover:border-rose-500/40 self-start sm:self-auto"
            >
              Delete Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
