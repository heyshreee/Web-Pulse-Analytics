import Reveal from './Reveal';

/**
 * Consistent section heading used across the marketing surface.
 * `align="center"` is the default editorial treatment; `align="start"` is used
 * for split two-column sections.
 */
export default function SectionHead({
  eyebrow,
  title,
  description,
  align = 'center',
  className = '',
  children,
}) {
  const centered = align === 'center';
  return (
    <Reveal
      className={`${centered ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl'} ${className}`.trim()}
    >
      {eyebrow && <p className="mkt-eyebrow mb-4">{eyebrow}</p>}
      <h2 className="mkt-h2">{title}</h2>
      {description && <p className="mkt-lead mt-5">{description}</p>}
      {children}
    </Reveal>
  );
}
