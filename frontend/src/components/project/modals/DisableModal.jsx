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
        <div className="p-5 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20 rounded-2xl flex gap-4 shadow-sm">
          <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
          <p className="text-sm font-medium text-yellow-800/80 dark:text-yellow-500/80 leading-relaxed">
            You are about to temporarily disable <span className="text-slate-900 dark:text-white font-black tracking-tight">{projectName}</span>. New traffic data will no longer be collected.
          </p>
        </div>

        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed px-1">
          Historical data will remain available. You can re-enable tracking at any time from your project settings.
        </p>

        <div className="flex justify-end gap-3 pt-8 border-t border-slate-100 dark:border-slate-800/50">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-white rounded-xl text-sm font-black transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={onToggleActive}
            className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl text-sm font-black tracking-tight transition-all shadow-xl shadow-yellow-500/30 active:scale-95 flex items-center justify-center gap-2"
          >
            <ShieldOff className="h-4 w-4" />
            Disable Project
          </button>
        </div>
      </div>
    </Modal>
  );
}
