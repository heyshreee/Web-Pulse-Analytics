import React from 'react';
import { Loader2, Search, Database } from 'lucide-react';
import Modal from '../../Modal';

export default function PagesModal({ isOpen, onClose, loading, pagesData }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resource Node Index"
      maxWidth="max-w-2xl"
    >
      <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
              <Database className="absolute inset-0 m-auto h-6 w-6 text-blue-500 animate-pulse" />
            </div>
            <p className="text-[10px] font-black text-slate-500 animate-pulse uppercase tracking-[0.3em] italic">Indexing Nodes...</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#0C0E17] z-20">
              <tr className="border-b border-[#1E293B] text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] italic">
                <th className="pb-6 pl-4 font-black">Resource Identifier</th>
                <th className="pb-6 text-right pr-4 font-black">Magnitude</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {pagesData.map((page, i) => (
                <tr key={i} className="border-b border-[#1E293B]/30 hover:bg-[#06080F]/80 transition-all group/row">
                  <td className="py-6 pl-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-black text-white italic truncate max-w-[350px] group-hover/row:text-blue-400 transition-colors uppercase leading-tight" title={page.title}>{page.title || 'Inert Entity'}</span>
                      <span className="text-[9px] font-bold text-slate-600 truncate max-w-[350px] uppercase tracking-tight">{page.url}</span>
                    </div>
                  </td>
                  <td className="py-6 text-right pr-4">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-white italic">{page.views.toLocaleString()}</span>
                      <span className="text-[9px] font-black text-blue-500/50 uppercase tracking-tighter italic">Hits</span>
                    </div>
                  </td>
                </tr>
              ))}
              {pagesData.length === 0 && (
                <tr>
                  <td colSpan="2" className="py-20 text-center opacity-20">
                    <Search className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 italic">No Network Data Indexed</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </Modal>
  );
}
