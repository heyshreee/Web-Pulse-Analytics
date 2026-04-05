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
                <div key={i} className="flex gap-4 p-5 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/50 rounded-2xl hover:bg-white dark:hover:bg-slate-800/50 hover:border-blue-400 dark:hover:border-slate-700 transition-all group/item shadow-sm hover:shadow-md">
                  <div className="relative flex-shrink-0 flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-500 mt-2 shadow-[0_0_12px_rgba(59,130,246,0.3)] ring-4 ring-blue-100 dark:ring-blue-900/30"></div>
                    {i !== activityData.length - 1 && (
                      <div className="flex-1 w-px bg-slate-200 dark:bg-slate-800 my-3"></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-1">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <p className="text-base font-black text-slate-900 dark:text-white truncate group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors tracking-tight" title={activity.title || 'Unknown Page'}>
                        {activity.title || 'Unknown Page'}
                      </p>
                    </div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mb-4 opacity-70 font-mono">{activity.site}{activity.path}</p>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                        <MapPin className="h-3 w-3 text-blue-500" />
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{activity.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                        <Clock className="h-3 w-3 text-blue-500" />
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{new Date(activity.timestamp).toLocaleString()}</span>
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
