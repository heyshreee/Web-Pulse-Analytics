import React from 'react';
import { X, RefreshCw, Share2, Clipboard, ExternalLink } from 'lucide-react';
import Modal from '../../Modal';
import CopyButton from '../../CopyButton';

export default function ShareModal({ isOpen, onClose, shareToken, onDisableSharing, onGenerateLink }) {
  const shareUrl = `${window.location.origin}/share/${shareToken}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Public Report Dispatch"
    >
      <div className="space-y-8">
        <div className="flex items-start gap-5 p-1">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/10">
            <Share2 className="h-5 w-5" />
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed italic">
            Initializing external read-only telemetry link. Authorized entities may monitor this cluster's magnitude without protocol access.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <ExternalLink className="h-3.5 w-3.5 text-slate-700" />
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 italic">Dispatched URL</label>
          </div>
          <div className="flex gap-4 p-2 bg-[#06080F] border border-[#1E293B] rounded-2xl group/input">
            <input
              type="text"
              readOnly
              value={shareToken ? shareUrl : 'PROTOCOL LINK NOT DISPATCHED'}
              className="flex-1 bg-transparent px-4 py-2 text-blue-400 font-bold text-xs focus:outline-none selection:bg-blue-500/20 italic"
            />
            {shareToken && <CopyButton text={shareUrl} size="sm" />}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-[#1E293B]/30">
          {shareToken ? (
            <button
              onClick={onDisableSharing}
              className="px-6 py-3 bg-red-950/10 hover:bg-red-900/20 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all italic border border-red-900/10 flex items-center gap-2"
            >
              <X className="h-4 w-4" /> Terminate Link
            </button>
          ) : <div />}
          
          <button
            onClick={onGenerateLink}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 italic"
          >
            <RefreshCw className="h-4 w-4" /> {shareToken ? 'Regenerate Dispatch' : 'Initialize Dispatch'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
