import React from 'react';
import { Loader2, Database, Search, MapPin, Clock } from 'lucide-react';
import Modal from '../../Modal';

export default function ActivityModal({ isOpen, onClose, loading, activityData }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Temporal Ingress Logs"
      maxWidth="max-w-2xl"
    >
      <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
              <Database className="absolute inset-0 m-auto h-6 w-6 text-blue-500 animate-pulse" />
            </div>
            <p className="text-[10px] font-black text-slate-500 animate-pulse uppercase tracking-[0.3em] italic">Resyncing Logs...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activityData.length > 0 ? (
              activityData.map((activity, i) => (
                <div key={i} className="flex gap-6 p-5 bg-[#06080F]/50 border border-[#1E293B]/30 rounded-[1.5rem] hover:bg-[#0B0D16] hover:border-blue-500/30 transition-all group/item shadow-xl">
                  <div className="relative flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse"></div>
                    <div className="absolute top-4 bottom-0 left-1.5 w-[1px] bg-[#1E293B] group-last/item:hidden"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <p className="text-xs font-black text-white italic truncate uppercase tracking-tight group-hover/item:text-blue-400 transition-colors" title={activity.title || 'Unknown Entity'}>
                        {activity.title || 'Inert Entity'}
                      </p>
                      <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest whitespace-nowrap pt-0.5">#{activity.id?.toString().slice(-4) || i}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-600 truncate uppercase tracking-tighter mb-4 opacity-60">{activity.site}{activity.path}</p>
                    
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 px-2.5 py-1 bg-blue-500/5 rounded-lg border border-blue-500/10">
                        <MapPin className="h-3 w-3 text-blue-500" />
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest italic">{activity.location}</span>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1 bg-[#0B0D16] rounded-lg border border-[#1E293B]">
                        <Clock className="h-3 w-3 text-slate-600" />
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{new Date(activity.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center opacity-20">
                <Search className="h-16 w-16 text-slate-600 mx-auto mb-6" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">No Ingress Records Dispatched</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
