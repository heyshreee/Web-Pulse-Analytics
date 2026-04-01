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
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-slate-950 z-20">
              <tr className="border-b border-slate-800 text-xs font-medium text-slate-400">
                <th className="pb-4 pl-2">Page Details</th>
                <th className="pb-4 text-right pr-2">Views</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {pagesData?.map((page, i) => (
                <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors">
                  <td className="py-4 pl-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-slate-200 truncate max-w-[350px]" title={page.title}>{page.title || 'Unknown Page'}</span>
                      <span className="text-xs text-slate-500 truncate max-w-[350px]">{page.url}</span>
                    </div>
                  </td>
                  <td className="py-4 text-right pr-2">
                    <span className="font-medium text-slate-200">{page.views?.toLocaleString()}</span>
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
