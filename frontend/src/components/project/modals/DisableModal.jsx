import React from 'react';
import { AlertTriangle, ShieldOff, X } from 'lucide-react';
import Modal from '../../Modal';

export default function DisableModal({ isOpen, onClose, onToggleActive, projectName }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Halt Protocol"
    >
      <div className="space-y-8">
        <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl flex gap-5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/30"></div>
          <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
          <p className="text-[11px] font-bold text-yellow-500/80 uppercase tracking-wider leading-relaxed italic">
            Initialing temporary suspension for cluster <span className="text-white underline">{projectName}</span>. New telemetry ingress will be HEAVILY filtered.
          </p>
        </div>
        
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic leading-relaxed px-1">
          Historical resonance data will remain accessible in the archives. You may re-initialize the dispatch service at any temporal coordinate.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#1E293B]/30">
          <button
            onClick={onClose}
            className="flex-1 px-8 py-4 bg-[#0B0D16] text-slate-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic border border-[#1E293B]"
          >
            Abort
          </button>
          <button
            onClick={onToggleActive}
            className="flex-1 px-8 py-4 bg-yellow-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_15px_40px_rgba(202,138,4,0.3)] transition-all flex items-center justify-center gap-3 italic"
          >
            <ShieldOff className="h-4 w-4" />
            Halt Cluster
          </button>
        </div>
      </div>
    </Modal>
  );
}
