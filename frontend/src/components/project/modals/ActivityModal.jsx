import React from 'react';
import { Loader2, Database, Search, MapPin, Clock } from 'lucide-react';
import Modal from '../../Modal';

export default function ActivityModal({ isOpen, onClose, loading, activityData }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recent Activity"
      maxWidth="max-w-2xl"
    >
      <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="text-sm font-medium text-slate-500">Loading activity data...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activityData?.length > 0 ? (
              activityData.map((activity, i) => (
                <div key={i} className="flex gap-4 p-4 bg-slate-900/50 border border-slate-800/50 rounded-xl hover:bg-slate-800/50 hover:border-slate-700 transition-colors group/item">
                  <div className="relative flex-shrink-0 flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.3)]"></div>
                    {i !== activityData.length - 1 && (
                      <div className="flex-1 w-px bg-slate-800 my-2"></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-1">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <p className="text-sm font-medium text-white truncate group-hover/item:text-blue-400 transition-colors" title={activity.title || 'Unknown Page'}>
                        {activity.title || 'Unknown Page'}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 truncate mb-3">{activity.site}{activity.path}</p>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded-md border border-slate-700/50">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-300">{activity.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded-md border border-slate-700/50">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-300">{new Date(activity.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center">
                <Search className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No recent activity found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
