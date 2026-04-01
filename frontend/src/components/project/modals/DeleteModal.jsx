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
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-400">
            Warning: This action will permanently delete all data and analytics associated with <span className="text-white font-medium">{projectName}</span>. This cannot be undone.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Please type <span className="text-white font-mono bg-slate-800 px-1 rounded">{projectName}</span> to confirm
          </label>
          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-600"
            placeholder={projectName}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-800">
          <button
            onClick={() => {
              onClose();
              setDeleteConfirmation('');
            }}
            className="px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onDelete(deleteConfirmation)}
            disabled={deleteConfirmation !== projectName || deleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete Project
          </button>
        </div>
      </div>
    </Modal>
  );
}
