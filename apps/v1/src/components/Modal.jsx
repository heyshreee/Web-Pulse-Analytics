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
          className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ type: 'spring', stiffness: 360, damping: 30 }}
          className={`relative w-full ${maxWidth} bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden`}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
            <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h3>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="px-6 py-5">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
