import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
// eslint-disable-next-line no-unused-vars -- motion is only used as a JSX member expression
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
  align = 'center',
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  const alignClass =
    align === 'bottom'
      ? 'items-end justify-center pb-6'
      : align === 'top'
      ? 'items-start justify-center pt-6'
      : 'items-center justify-center';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className={`fixed inset-0 z-[100] flex p-4 ${alignClass}`}
        >
          {/* Full-viewport backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal dialog card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
            className={`relative w-full ${maxWidth} bg-[var(--wp-bg-surface,#0a0a0a)] border border-[var(--wp-border-default,#222222)] rounded-lg shadow-2xl overflow-hidden z-10`}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--wp-border-default,#222222)] bg-[var(--wp-bg-surface,#0a0a0a)]">
              <h3 className="text-sm font-semibold tracking-tight text-[var(--wp-text-primary,#ededed)]">
                {title}
              </h3>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="p-1 rounded text-[var(--wp-text-muted,#737373)] hover:text-[var(--wp-text-primary,#ededed)] hover:bg-[var(--wp-bg-hover,#171717)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-5 text-[var(--wp-text-primary,#ededed)]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
