import React from 'react';
import { X, RefreshCw, Share2, ExternalLink } from 'lucide-react';
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
        <div className="flex items-start gap-4 p-5 bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 rounded-xl">
          <div className="p-2.5 bg-white dark:bg-violet-500/20 rounded-xl text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-500/20">
            <Share2 className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-violet-800/80 dark:text-violet-300/90 leading-relaxed">
            Create a public, read-only link to share this project's dashboard. Anyone with the link can view your analytics.
          </p>
        </div>

        <div className="space-y-2">
          <label className="label flex items-center gap-1.5">
            <ExternalLink className="h-3.5 w-3.5 text-violet-500" />
            Share Link
          </label>
          <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
            <input
              type="text"
              readOnly
              value={shareToken ? shareUrl : 'Link not generated yet.'}
              className="flex-1 bg-transparent px-3 py-2 text-slate-900 dark:text-slate-300 font-medium text-sm focus:outline-none"
            />
            {shareToken && <CopyButton text={shareUrl} size="sm" />}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-100 dark:border-slate-800/50">
          {shareToken ? (
            <button
              onClick={onDisableSharing}
              className="btn-danger btn-md w-full sm:w-auto"
            >
              <X className="h-4 w-4" /> Disable Link
            </button>
          ) : <div />}

          <button
            onClick={onGenerateLink}
            className="btn-primary btn-md w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" /> {shareToken ? 'Regenerate Link' : 'Generate Link'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
