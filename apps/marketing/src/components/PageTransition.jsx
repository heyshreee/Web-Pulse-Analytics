import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Route transition wrapper used by every shell (marketing, auth, docs and the
 * dashboard).
 *
 * Children stay mounted between navigations, so page state and in-flight
 * requests survive (e.g. switching a project tab does not refetch the
 * project). Only the entrance animation is replayed whenever the pathname
 * changes. The animation itself is pure CSS, so it also plays on the very
 * first render, and the global prefers-reduced-motion rule collapses it for
 * visitors who ask for less motion.
 */
export default function PageTransition({ children, className = '', variant = 'up' }) {
  const { pathname } = useLocation();
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    // Restart the CSS animation without unmounting the subtree.
    el.classList.remove('page-enter');
    void el.offsetWidth; // force reflow so the animation restarts
    el.classList.add('page-enter');
  }, [pathname]);

  return (
    <div
      ref={ref}
      data-page-transition={variant}
      className={`page-enter ${className}`.trim()}
    >
      {children}
    </div>
  );
}
