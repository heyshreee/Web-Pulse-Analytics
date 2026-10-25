import { useEffect, useRef } from 'react';

const VARIANTS = new Set(['up', 'down', 'left', 'right', 'fade', 'scale']);

/**
 * Scroll-reveal wrapper used across every surface.
 *
 * The reveal is strictly progressive enhancement: content renders visible, and
 * JavaScript only "arms" the hidden state right before observing the element.
 * If JS is unavailable, the element has no IntersectionObserver, or the
 * visitor prefers reduced motion, the content is shown immediately.
 *
 * Variants: up (default), down, left, right, fade, scale.
 */
export default function Reveal({
  as = 'div',
  delay = 0,
  variant = 'up',
  className = '',
  children,
  ...rest
}) {
  const ref = useRef(null);
  const Tag = as;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    el.setAttribute('data-reveal-armed', '');
    if (delay) el.style.transitionDelay = `${delay}ms`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add('is-revealed');
        observer.disconnect();
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <Tag
      ref={ref}
      data-reveal={VARIANTS.has(variant) ? variant : 'up'}
      className={`reveal ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
}
