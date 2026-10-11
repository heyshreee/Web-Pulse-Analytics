import { cn } from '../../lib/utils';
import Icon from './Icon';

const TONES = {
  neutral: '',
  success: 'badge--success',
  warning: 'badge--warning',
  error: 'badge--error',
  info: 'badge--info',
  outline: 'badge--outline',
};

export function Badge({ tone = 'neutral', size, icon, className, children, ...rest }) {
  return (
    <span className={cn('badge', TONES[tone], size === 'lg' && 'badge--lg', className)} {...rest}>
      {icon ? <Icon name={icon} size={11} /> : null}
      {children}
    </span>
  );
}

/** Pulsing "live" indicator. `count` renders the tabular active-visitor total. */
export function LiveChip({ count, label = 'Live', pulse = true }) {
  return (
    <span className="live-chip">
      {pulse ? <span className="live-dot" /> : null}
      <span className="muted">{label}</span>
      {count != null ? <span className="live-count">{count}</span> : null}
    </span>
  );
}

export function Avatar({ name = '', src, size = 'md', className }) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase() || '?';

  return (
    <span
      className={cn(
        'avatar',
        size === 'sm' && 'avatar--sm',
        size === 'lg' && 'avatar--lg',
        className,
      )}
    >
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : initials}
    </span>
  );
}

export function Progress({ value = 0, tone, className }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      className={cn('progress', className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={cn('progress-bar', tone && `progress-bar--${tone}`)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Skeleton({ className, variant }) {
  return <div className={cn('skeleton', variant && `skeleton--${variant}`, className)} />;
}