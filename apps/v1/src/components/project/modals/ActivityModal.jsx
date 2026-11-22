import React from 'react';
import { Loader2, Search, MapPin, Clock } from 'lucide-react';
import Modal from '../../Modal';

export default function ActivityModal({ isOpen, onClose, loading, activityData }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recent Activity"
      maxWidth="max-w-2xl"
    >
      <div className="max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-6 w-6 text-ink-muted animate-spin" />
            <p className="text-xs font-mono text-ink-muted">Loading activity data...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activityData?.length > 0 ? (
              activityData.map((activity, i) => (
                <div key={i} className="flex gap-3 p-3 bg-surface border border-line rounded hover:bg-hover transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-ink shrink-0 mt-2" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4 mb-0.5">
                      <p className="text-xs font-medium text-ink truncate" title={activity.title || 'Untitled'}>
                        {activity.title || 'Untitled'}
                      </p>
                      <span className="text-[10px] text-ink-muted font-mono tabular-nums shrink-0">
                        {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-muted truncate mb-2 font-mono">{activity.site}{activity.path}</p>

                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-ink-secondary">
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-subtle rounded border border-line">
                        <MapPin className="h-3 w-3 text-ink-muted" />
                        <span>{activity.location}</span>
                      </div>
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-subtle rounded border border-line">
                        <Clock className="h-3 w-3 text-ink-muted" />
                        <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-ink-muted">
                <Search className="h-6 w-6 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-mono">No recent activity found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
