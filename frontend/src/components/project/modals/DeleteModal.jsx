import React from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import Modal from '../../Modal';

export default function DeleteModal({ isOpen, onClose, onDelete, projectName, deleting, deleteConfirmation, setDeleteConfirmation }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setDeleteConfirmation('');
      }}
      title="Purge Protocol"
    >
      <div className="space-y-8">
        <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl flex gap-5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500/30"></div>
          <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
          <p className="text-[11px] font-bold text-red-400 uppercase tracking-wider leading-relaxed italic">
            Caution: This action initializes the IRREVERSIBLE destruction of all telemetry datasets associated with cluster <span className="text-white underline">{projectName}</span>. 
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 italic">Confirm Cluster ID</label>
            <span className="text-[9px] font-black text-red-950 uppercase italic opacity-40 select-none">Authorization Required</span>
          </div>
          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            className="w-full bg-[#06080F] border border-[#1E293B] rounded-2xl px-6 py-4 text-white font-bold italic focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/40 transition-all placeholder:text-slate-800"
            placeholder={projectName}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#1E293B]/30">
          <button
            onClick={() => {
              onClose();
              setDeleteConfirmation('');
            }}
            className="flex-1 px-8 py-4 bg-[#0B0D16] text-slate-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic border border-[#1E293B]"
          >
            Abort
          </button>
          <button
            onClick={() => onDelete(deleteConfirmation)}
            disabled={deleteConfirmation !== projectName || deleting}
            className="flex-[1.5] px-8 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_15px_40px_rgba(220,38,38,0.3)] transition-all disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-3 italic"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Confirm Destruction
          </button>
        </div>
      </div>
    </Modal>
  );
}
