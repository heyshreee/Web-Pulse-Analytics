import React from 'react';
import { Loader2, Search } from 'lucide-react';
import Modal from '../../Modal';

export default function PagesModal({ isOpen, onClose, loading, pagesData }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Top Pages"
      maxWidth="max-w-2xl"
    >
      <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            <p className="text-sm font-medium text-slate-500">Loading pages data...</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="table">
              <thead>
                <tr className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Page Details</th>
                  <th className="px-4 py-3 text-right font-semibold">Views</th>
                </tr>
              </thead>
              <tbody>
                {pagesData?.map((page, i) => (
                  <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all border-t border-slate-100 dark:border-slate-800/50">
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-900 dark:text-slate-200 truncate max-w-[350px]" title={page.title}>{page.title || 'Unknown Page'}</span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[350px] font-mono">{page.url}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-semibold text-violet-600 dark:text-violet-400 tabular-nums">{page.views?.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
                {(!pagesData || pagesData.length === 0) && (
                  <tr>
                    <td colSpan="2" className="py-16 text-center">
                      <Search className="h-8 w-8 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No page data available</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}
