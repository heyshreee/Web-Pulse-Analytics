import React from 'react';
import { AlertTriangle, ShieldOff, X } from 'lucide-react';
import Modal from '../../Modal';

export default function DisableModal({ isOpen, onClose, onToggleActive, projectName }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Disable Project"
    >
      <div className="space-y-6">
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
          <p className="text-sm text-yellow-500/80">
            You are about to temporarily disable <span className="text-white font-medium">{projectName}</span>. New traffic data will no longer be collected.
          </p>
        </div>

        <p className="text-sm text-slate-400">
          Historical data will remain available. You can re-enable tracking at any time from your project settings.
        </p>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onToggleActive}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <ShieldOff className="h-4 w-4" />
            Disable Project
          </button>
        </div>
      </div>
    </Modal>
  );
}
