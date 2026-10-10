import { cn } from '../../lib/utils';

export function Tabs({ value, onChange, items = [], className, children }) {
  return (
    <>
      <div className={cn('tabs', className)} role="tablist">
        {items.map((item) => {
          const active = item.value === value;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              className="tab"
              aria-selected={active}
              aria-controls={item.value}
              onClick={() => onChange?.(item.value)}
            >
              {item.label}
              {item.count != null ? <span className="ml-1.5 tnum muted">{item.count}</span> : null}
            </button>
          );
        })}
      </div>
      {children}
    </>
  );
}

export function Segmented({ value, onChange, options = [], size = 'md', className, ariaLabel }) {
  return (
    <div className={cn('segmented', className)} role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          className={size === 'sm' ? 'text-xs' : undefined}
          onClick={() => onChange?.(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Breadcrumb trail rendered in the app header. */
export function Breadcrumb({ crumbs = [] }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={`${c.label}-${i}`} className="row-2">
            {i > 0 ? (
              <span className="breadcrumb-sep" aria-hidden="true">
                /
              </span>
            ) : null}
            {c.to && !last ? (
              <button
                type="button"
                className="breadcrumb-item breadcrumb-link"
                onClick={() => c.onClick?.()}
              >
                {c.label}
              </button>
            ) : (
              <span className={last ? 'breadcrumb-item' : 'breadcrumb-item'} aria-current={last ? 'page' : undefined}>
                {c.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}