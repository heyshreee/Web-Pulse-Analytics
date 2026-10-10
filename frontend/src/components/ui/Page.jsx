import { useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { copyText } from '../../lib/clipboard';
import { Button } from './Button';

/**
 * Standard page header: eyebrow, title, description and action cluster.
 * Every route uses this so headings stay hierarchical across the product.
 */
export function PageHead({ eyebrow, title, desc, actions, meta, children }) {
  return (
    <header className="page-head">
      <div className="page-head-text">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="page-title mt-1">{title}</h1>
        {desc ? <p className="page-desc">{desc}</p> : null}
        {meta ? <div className="page-meta mt-3">{meta}</div> : null}
        {children}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}

/** Filter/search strip that sits between the page head and content. */
export function PageToolbar({ children, className }) {
  return <div className={cn('page-toolbar', className)}>{children}</div>;
}

export function CopyButton({
  value,
  label = 'Copy',
  copiedLabel = 'Copied',
  size = 'sm',
  variant = 'outline',
  showLabel = true,
  className,
}) {
  const [done, setDone] = useState(false);

  const onClick = useCallback(async () => {
    try {
      await copyText(value);
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    } catch {
      /* clipboard unavailable — button simply resets */
    }
  }, [value]);

  return (
    <Button
      variant={variant}
      size={size}
      icon={done ? 'check' : 'copy'}
      onClick={onClick}
      className={className}
      aria-label={done ? copiedLabel : label}
    >
      {showLabel ? (done ? copiedLabel : label) : null}
    </Button>
  );
}

export function CodeBlock({ lang = 'html', code, action }) {
  return (
    <div className="code-block">
      <div className="code-head">
        <span className="code-lang">{lang}</span>
        <span className="spacer" />
        {action}
      </div>
      <pre className="code-pre">{code}</pre>
    </div>
  );
}