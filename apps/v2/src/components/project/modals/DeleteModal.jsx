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
        <div className="p-5 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex gap-4">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-800/80 dark:text-red-400 leading-relaxed">
            Warning: This action will permanently delete all data and analytics associated with <span className="text-slate-900 dark:text-white font-semibold">{projectName}</span>. This cannot be undone.
          </p>
        </div>

        <div className="space-y-2">
          <label className="label">
            Please type <span className="text-red-600 dark:text-white font-mono bg-red-50 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-red-200 dark:border-slate-700">{projectName}</span> to confirm
          </label>
          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            className="input"
            placeholder={projectName}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-8 border-t border-slate-100 dark:border-slate-800/50">
          <button
            onClick={() => {
              onClose();
              setDeleteConfirmation('');
            }}
            className="btn-secondary btn-md"
          >
            Cancel
          </button>
          <button
            onClick={() => onDelete(deleteConfirmation)}
            disabled={deleteConfirmation !== projectName || deleting}
            className="btn-danger btn-md"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete Project
          </button>
        </div>
      </div>
    </Modal>
  );
}
