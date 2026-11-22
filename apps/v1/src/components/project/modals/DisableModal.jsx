import React from 'react';
import { AlertTriangle, ShieldOff } from 'lucide-react';
import Modal from '../../Modal';

export default function DisableModal({ isOpen, onClose, onToggleActive, projectName }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Disable Project"
    >
      <div className="space-y-4">
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded flex gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400 leading-relaxed font-mono">
            You are about to temporarily pause ingestion for <span className="text-ink font-semibold">{projectName}</span>. New telemetry will be rejected.
          </p>
        </div>

        <p className="text-xs text-ink-secondary leading-relaxed">
          Historical records and telemetry logs remain preserved. You can re-enable tracking at any time from your settings tab.
        </p>

        <div className="flex justify-end gap-2 pt-4 border-t border-line">
          <button
            onClick={onClose}
            className="btn-secondary h-7 px-3 text-xs"
          >
            Cancel
          </button>
          <button
            onClick={onToggleActive}
            className="btn-danger h-7 px-3 text-xs inline-flex items-center gap-1.5"
          >
            <ShieldOff className="h-3.5 w-3.5" />
            Disable Project
          </button>
        </div>
      </div>
    </Modal>
  );
}
