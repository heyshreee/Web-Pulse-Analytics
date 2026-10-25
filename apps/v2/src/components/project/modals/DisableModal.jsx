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
      <div className="space-y-6">
        <div className="p-5 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20 rounded-xl flex gap-4">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-yellow-800/80 dark:text-yellow-500/80 leading-relaxed">
            You are about to temporarily disable <span className="text-slate-900 dark:text-white font-semibold">{projectName}</span>. New traffic data will no longer be collected.
          </p>
        </div>

        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
          Historical data will remain available. You can re-enable tracking at any time from your project settings.
        </p>

        <div className="flex justify-end gap-3 pt-8 border-t border-slate-100 dark:border-slate-800/50">
          <button
            onClick={onClose}
            className="btn-secondary btn-md"
          >
            Cancel
          </button>
          <button
            onClick={onToggleActive}
            className="btn-danger btn-md"
          >
            <ShieldOff className="h-4 w-4" />
            Disable Project
          </button>
        </div>
      </div>
    </Modal>
  );
}
