import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import Icon from './Icon';
import { Button, IconButton } from './Button';

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

function useDismiss(open, onClose) {
  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      }
    };
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    if (!document.body.dataset.wpScrollLock) {
      document.body.dataset.wpScrollLock = '1';
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', onKey);
      if (document.body.dataset.wpScrollLock) {
        delete document.body.dataset.wpScrollLock;
        document.body.style.overflow = prevOverflow;
      }
    };
  }, [open, onClose]);
}

function useFocusTrap(open, ref) {
  useEffect(() => {
    if (!open) return undefined;
    const node = ref.current;
    if (!node) return undefined;

    const first = node.querySelector('[data-autofocus]') || node.querySelector(FOCUSABLE);
    first?.focus?.();

    const onKey = (e) => {
      if (e.key !== 'Tab') return;
      const items = Array.from(node.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (!items.length) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    node.addEventListener('keydown', onKey);
    return () => node.removeEventListener('keydown', onKey);
  }, [open, ref]);
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide = false,
  className,
}) {
  const ref = useRef(null);
  useDismiss(open, onClose);
  useFocusTrap(open, ref);

  if (!open) return null;

  return createPortal(
    <>
      <div className="scrim" onClick={onClose} />
      <div className="overlay-center" role="presentation">
        <div
          ref={ref}
          className={cn('dialog', wide && 'dialog--wide', className)}
          role="dialog"
          aria-modal="true"
          aria-label={typeof title === 'string' ? title : undefined}
        >
          <div className="dialog-head">
            <div className="dialog-head-text">
              {title ? <h2 className="dialog-title">{title}</h2> : null}
              {description ? <p className="dialog-desc">{description}</p> : null}
            </div>
            <IconButton icon="close" label="Close dialog" size="sm" onClick={onClose} />
          </div>
          <div className="dialog-body">{children}</div>
          {footer ? <div className="dialog-foot">{footer}</div> : null}
        </div>
      </div>
    </>,
    document.body,
  );
}

export function Sheet({ open, onClose, title, description, children, footer, className }) {
  const ref = useRef(null);
  useDismiss(open, onClose);
  useFocusTrap(open, ref);

  if (!open) return null;

  return createPortal(
    <>
      <div className="scrim" onClick={onClose} />
      <div className="overlay-right" role="presentation">
        <div
          ref={ref}
          className={cn('sheet', className)}
          role="dialog"
          aria-modal="true"
          aria-label={typeof title === 'string' ? title : undefined}
        >
          <div className="sheet-head">
            <div className="dialog-head-text">
              {title ? <h2 className="dialog-title">{title}</h2> : null}
              {description ? <p className="dialog-desc">{description}</p> : null}
            </div>
            <IconButton icon="close" label="Close panel" size="sm" onClick={onClose} />
          </div>
          <div className="sheet-body">{children}</div>
          {footer ? <div className="sheet-foot">{footer}</div> : null}
        </div>
      </div>
    </>,
    document.body,
  );
}

/**
 * Anchored dropdown. Positions against the trigger with viewport flipping so it
 * never renders off-screen, and closes on outside click, Escape, scroll, or resize.
 */
export function Popover({ open, onClose, trigger, anchorRef: externalAnchorRef, children, align = 'end', width = 240, className }) {
  const internalAnchorRef = useRef(null);
  const panelRef = useRef(null);
  const [pos, setPos] = useState(null);

  const place = useCallback(() => {
    const a = externalAnchorRef?.current || internalAnchorRef.current;
    if (!a) return;
    // The default trigger wrapper uses `display: contents`, which has no box of
    // its own (getBoundingClientRect returns 0,0,0,0). Fall back to the trigger
    // element itself so the panel anchors to what the user actually clicked.
    let r = a.getBoundingClientRect();
    if (!r.width && !r.height && a.firstElementChild) {
      r = a.firstElementChild.getBoundingClientRect();
    }
    const left = (align === 'start' || align === 'left') ? r.left : (align === 'end' || align === 'right') ? r.right - width : r.left;
    const flipUp = r.bottom + 260 > window.innerHeight && r.top > 300;
    setPos({
      left: Math.max(8, Math.min(left, window.innerWidth - width - 8)),
      top: flipUp ? undefined : r.bottom + 6,
      bottom: flipUp ? window.innerHeight - r.top + 6 : undefined,
    });
  }, [align, width, externalAnchorRef]);

  useEffect(() => {
    if (!open) return undefined;

    // Measure after paint so the panel never renders at a stale offset.
    const raf = requestAnimationFrame(place);

    const onDown = (e) => {
      const a = externalAnchorRef?.current || internalAnchorRef.current;
      if (a?.contains(e.target) || panelRef.current?.contains(e.target)) return;
      onClose?.();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, onClose, place, externalAnchorRef]);

  return (
    <>
      {trigger ? (
        <span ref={internalAnchorRef} className="contents">
          {trigger}
        </span>
      ) : null}
      {open
        ? createPortal(
            <div className="overlay-anchor" role="presentation">
              <div
                ref={panelRef}
                className={cn('popover-panel', className)}
                style={{
                  width,
                  left: pos?.left ?? 0,
                  top: pos?.top,
                  bottom: pos?.bottom,
                  visibility: pos ? 'visible' : 'hidden',
                }}
                role="menu"
              >
                {children}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export function MenuItem({ icon, danger, meta, className, children, ...rest }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn('menu-item', danger && 'menu-item-danger', className)}
      {...rest}
    >
      {icon ? <Icon name={icon} size={15} /> : null}
      <span className="truncate">{children}</span>
      {meta ? <span className="menu-meta">{meta}</span> : null}
    </button>
  );
}

export function MenuLabel({ children }) {
  return <div className="menu-label">{children}</div>;
}

export function MenuSep() {
  return <div className="menu-sep" role="separator" />;
}

export { Button };