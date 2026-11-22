import { X } from 'lucide-react';
// eslint-disable-next-line no-unused-vars -- motion is only used as a JSX member expression
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md', align = 'center' }) {
  if (!isOpen) return null;

  const alignClass = align === 'bottom' ? 'items-end justify-center pb-6' : align === 'top' ? 'items-start justify-center pt-6' : 'items-center justify-center';

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-50 flex p-4 ${alignClass}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 6 }}
          transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
          className={`relative w-full ${maxWidth} bg-surface border border-line rounded-lg shadow-2xl overflow-hidden`}
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
            <h3 className="text-sm font-medium tracking-tight text-ink">{title}</h3>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1 rounded text-ink-muted hover:text-ink hover:bg-hover transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="px-5 py-5">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
