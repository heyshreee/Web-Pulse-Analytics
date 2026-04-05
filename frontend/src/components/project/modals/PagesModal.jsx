import React from 'react';
import { Loader2, Search, Database } from 'lucide-react';
import Modal from '../../Modal';

export default function PagesModal({ isOpen, onClose, loading, pagesData }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Top Pages"
      maxWidth="max-w-2xl"
    >
      <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="text-sm font-medium text-slate-500">Loading pages data...</p>
          </div>
        ) : (
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead className="sticky top-0 bg-white dark:bg-slate-950 z-20">
              <tr className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <th className="pb-4 pl-4">Page Details</th>
                <th className="pb-4 text-right pr-4">Views</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {pagesData?.map((page, i) => (
                <tr key={i} className="group bg-slate-50/50 dark:bg-slate-900/20 hover:bg-white dark:hover:bg-slate-900/50 transition-all border-b border-slate-100 dark:border-slate-800/50 shadow-sm hover:shadow-md">
                  <td className="py-4 pl-4 rounded-l-2xl">
                    <div className="flex flex-col gap-1">
                      <span className="font-black text-slate-900 dark:text-slate-200 truncate max-w-[350px] tracking-tight" title={page.title}>{page.title || 'Unknown Page'}</span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[350px] font-mono opacity-60 group-hover:opacity-100 transition-opacity">{page.url}</span>
                    </div>
                  </td>
                  <td className="py-4 text-right pr-4 rounded-r-2xl">
                    <span className="font-black text-blue-600 dark:text-blue-400 tabular-nums">{page.views?.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
              {(!pagesData || pagesData.length === 0) && (
                <tr>
                  <td colSpan="2" className="py-16 text-center">
                    <Search className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No page data available</p>
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
