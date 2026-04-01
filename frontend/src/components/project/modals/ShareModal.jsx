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
        <div className="flex items-start gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="p-2 bg-blue-500/20 rounded-md text-blue-400">
            <Share2 className="h-5 w-5" />
          </div>
          <p className="text-sm text-blue-400/90 leading-relaxed">
            Create a public, read-only link to share this project's dashboard. Anyone with the link can view your analytics.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Share Link
          </label>
          <div className="flex gap-3 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <input
              type="text"
              readOnly
              value={shareToken ? shareUrl : 'Link not generated yet.'}
              className="flex-1 bg-transparent px-3 py-2 text-slate-300 font-medium text-sm focus:outline-none"
            />
            {shareToken && <CopyButton text={shareUrl} size="sm" />}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
          {shareToken ? (
            <button
              onClick={onDisableSharing}
              className="px-4 py-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <X className="h-4 w-4" /> Disable Link
            </button>
          ) : <div />}

          <button
            onClick={onGenerateLink}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" /> {shareToken ? 'Regenerate Link' : 'Generate Link'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
