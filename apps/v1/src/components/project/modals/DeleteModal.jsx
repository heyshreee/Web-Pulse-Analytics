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
      <div className="space-y-4">
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded flex gap-3">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400 leading-relaxed font-mono">
            Warning: This action will permanently erase all data and analytics associated with <span className="text-ink font-semibold">{projectName}</span>.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-mono text-ink-secondary">
            Please type <span className="text-red-400 font-mono bg-subtle px-1.5 py-0.5 rounded border border-line">{projectName}</span> to confirm
          </label>
          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            className="input font-mono text-xs h-8"
            placeholder={projectName}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-line">
          <button
            onClick={() => {
              onClose();
              setDeleteConfirmation('');
            }}
            className="btn-secondary h-7 px-3 text-xs"
          >
            Cancel
          </button>
          <button
            onClick={() => onDelete(deleteConfirmation)}
            disabled={deleteConfirmation !== projectName || deleting}
            className="btn-danger h-7 px-3 text-xs inline-flex items-center gap-1.5"
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Delete Project
          </button>
        </div>
      </div>
    </Modal>
  );
}
