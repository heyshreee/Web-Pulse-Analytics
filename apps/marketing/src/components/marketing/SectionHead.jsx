import Reveal from './Reveal';

/**
 * Editorial Noir section heading with optional numeric Swiss section index.
 */
export default function SectionHead({
  eyebrow,
  title,
  description,
  align = 'left',
  className = '',
  children,
}) {
  const centered = align === 'center';
  return (
    <Reveal
      className={`${centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'} ${className}`.trim()}
    >
      {eyebrow && (
        <p className="noir-meta mb-3 text-[#FFFFFF]">
          {eyebrow}
        </p>
      )}
      <h2 className="mkt-h2">{title}</h2>
      {description && <p className="mkt-lead mt-4">{description}</p>}
      {children}
    </Reveal>
  );
}
