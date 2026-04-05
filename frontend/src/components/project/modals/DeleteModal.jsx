import React from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import Modal from '../../Modal';

export default function DeleteModal({ isOpen, onClose, onDelete, projectName, deleting, deleteConfirmation, setDeleteConfirmation }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setDeleteConfirmation('');
      }}
      title="Delete Project"
    >
      <div className="space-y-6">
        <div className="p-5 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl flex gap-4 shadow-sm">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500 flex-shrink-0" />
          <p className="text-sm font-medium text-red-800/80 dark:text-red-400 leading-relaxed">
            Warning: This action will permanently delete all data and analytics associated with <span className="text-slate-900 dark:text-white font-black tracking-tight">{projectName}</span>. This cannot be undone.
          </p>
        </div>

        <div className="space-y-3 px-1">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Please type <span className="text-red-600 dark:text-white font-mono bg-red-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-red-200 dark:border-slate-700">{projectName}</span> to confirm
          </label>
          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
            placeholder={projectName}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-8 border-t border-slate-100 dark:border-slate-800/50">
          <button
            onClick={() => {
              onClose();
              setDeleteConfirmation('');
            }}
            className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-white rounded-xl text-sm font-black transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onDelete(deleteConfirmation)}
            disabled={deleteConfirmation !== projectName || deleting}
            className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-black tracking-tight transition-all shadow-xl shadow-red-500/30 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete Project
          </button>
        </div>
      </div>
    </Modal>
  );
}
