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
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-subtle border border-line rounded">
          <Share2 className="h-4 w-4 text-ink-muted shrink-0 mt-0.5" />
          <p className="text-xs text-ink-secondary leading-relaxed">
            Generate a read-only token to share this project's dashboard publicly. Anyone holding the link can view live telemetry.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-mono text-ink-secondary flex items-center gap-1.5">
            <ExternalLink className="h-3 w-3 text-ink-muted" />
            Share Link
          </label>
          <div className="flex gap-2 p-1.5 bg-subtle border border-line rounded">
            <input
              type="text"
              readOnly
              value={shareToken ? shareUrl : 'Link not generated yet.'}
              className="flex-1 bg-transparent px-2 py-1 text-ink font-mono text-xs focus:outline-none"
            />
            {shareToken && <CopyButton text={shareUrl} size="sm" />}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-line">
          {shareToken ? (
            <button
              onClick={onDisableSharing}
              className="btn-danger h-7 px-3 text-xs w-full sm:w-auto inline-flex items-center gap-1.5"
            >
              <X className="h-3.5 w-3.5" /> Disable Link
            </button>
          ) : <div />}

          <button
            onClick={onGenerateLink}
            className="btn-primary h-7 px-3 text-xs w-full sm:w-auto inline-flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> {shareToken ? 'Regenerate Link' : 'Generate Link'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
