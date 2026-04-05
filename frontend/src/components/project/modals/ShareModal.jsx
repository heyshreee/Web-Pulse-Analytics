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
      title="Share Project"
    >
      <div className="space-y-6">
        <div className="flex items-start gap-4 p-5 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl shadow-sm">
          <div className="p-2.5 bg-white dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-500/20">
            <Share2 className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-blue-700/80 dark:text-blue-400/90 leading-relaxed">
            Create a public, read-only link to share this project's dashboard. Anyone with the link can view your analytics.
          </p>
        </div>

        <div className="space-y-2.5">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 flex items-center gap-2 px-1 uppercase tracking-widest">
            <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
            Share Link
          </label>
          <div className="flex gap-3 p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner">
            <input
              type="text"
              readOnly
              value={shareToken ? shareUrl : 'Link not generated yet.'}
              className="flex-1 bg-transparent px-4 py-2 text-slate-900 dark:text-slate-300 font-bold text-sm focus:outline-none"
            />
            {shareToken && <CopyButton text={shareUrl} size="sm" />}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-100 dark:border-slate-800/50">
          {shareToken ? (
            <button
              onClick={onDisableSharing}
              className="px-6 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-100 dark:border-red-500/20 rounded-xl text-sm font-black transition-all flex items-center gap-2 w-full sm:w-auto justify-center shadow-sm"
            >
              <X className="h-4 w-4" /> Disable Link
            </button>
          ) : <div />}

          <button
            onClick={onGenerateLink}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-black tracking-tight transition-all shadow-xl shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" /> {shareToken ? 'Regenerate Link' : 'Generate Link'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
