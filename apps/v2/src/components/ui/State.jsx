import { cn } from '../../lib/utils';
import Icon from './Icon';
import { Button } from './Button';

export function EmptyState({ icon = 'database', tone, title, text, actions, className }) {
  return (
    <div className={cn('state', className)}>
      <span className={cn('state-icon', tone === 'error' && 'state-icon--error')} aria-hidden="true">
        <Icon name={icon} size={20} />
      </span>
      <h3 className="state-title">{title}</h3>
      {text ? <p className="state-text">{text}</p> : null}
      {actions ? <div className="state-actions">{actions}</div> : null}
    </div>
  );
}

/** Shown when a project has no tracking installed yet. */
export function NotInstalledState({ onInstall, onDocs }) {
  return (
    <EmptyState
      icon="database"
      title="No analytics data yet"
      text="Install the WebPulse tracking script to start collecting visitor data for this project."
      actions={
        <>
          <Button icon="plus" onClick={onInstall}>
            Install WebPulse
          </Button>
          {onDocs ? (
            <Button variant="outline" icon="book" onClick={onDocs}>
              Read Documentation
            </Button>
          ) : null}
        </>
      }
    />
  );
}

/** Shown when a data region fails to load, with a retry affordance. */
export function ErrorState({ message, onRetry }) {
  return (
    <EmptyState
      icon="warn"
      tone="error"
      title="Unable to load analytics"
      text={message || 'Something went wrong while fetching your project data.'}
      actions={
        onRetry ? (
          <Button icon="refresh" onClick={onRetry}>
            Try again
          </Button>
        ) : null
      }
    />
  );
}

export function TableSkeleton({ rows = 6, cols = 4 }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div className="skeleton-row" key={r}>
          {Array.from({ length: cols }).map((__, c) => (
                <div className="skeleton skeleton--text flex-1" key={c} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function KpiSkeleton({ count = 4, className }) {
  return (
    <div className={cn('kpi-grid', className)} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="kpi">
          <div className="kpi-head justify-between">
            <div className="skeleton skeleton--text w-24" />
            <div className="skeleton w-4 h-4 rounded-full" />
          </div>
          <div className="skeleton h-8 w-28 my-1" />
          <div className="kpi-foot">
            <div className="skeleton skeleton--text w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BlockSkeleton({ className, height, width, style }) {
  const dynamicStyle = {
    ...(height ? { height: typeof height === 'number' ? `${height}px` : height, minHeight: typeof height === 'number' ? `${height}px` : height } : {}),
    ...(width ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...style,
  };
  return <div className={cn('skeleton skeleton--block', className)} style={dynamicStyle} aria-hidden="true" />;
}