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
      <div className="max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-6 w-6 text-ink-muted animate-spin" />
            <p className="text-xs font-mono text-ink-muted">Loading pages data...</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-line rounded">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-subtle border-b border-line text-[10px] font-mono text-ink-muted uppercase tracking-wider">
                  <th className="px-3.5 py-2.5 font-medium">Page Details</th>
                  <th className="px-3.5 py-2.5 text-right font-medium">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pagesData?.map((page, i) => (
                  <tr key={i} className="hover:bg-hover transition-colors">
                    <td className="px-3.5 py-2.5">
                      <div className="flex flex-col">
                        <span className="font-medium text-ink truncate max-w-[350px]" title={page.title}>{page.title || 'Untitled'}</span>
                        <span className="text-[11px] text-ink-muted truncate max-w-[350px] font-mono">{page.url}</span>
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5 text-right">
                      <span className="font-mono text-ink tabular-nums">{page.views?.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
                {(!pagesData || pagesData.length === 0) && (
                  <tr>
                    <td colSpan="2" className="py-12 text-center">
                      <Search className="h-6 w-6 text-ink-muted mx-auto mb-2 opacity-40" />
                      <p className="text-xs font-mono text-ink-muted">No page data available</p>
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
