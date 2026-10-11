import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import Icon from './Icon';

const VARIANTS = {
  default: '',
  outline: 'btn--outline',
  ghost: 'btn--ghost',
  secondary: 'btn--secondary',
  destructive: 'btn--destructive',
};

const SIZES = {
  sm: 'btn--sm',
  md: '',
  lg: 'btn--lg',
};

const Button = forwardRef(function Button(
  {
    variant = 'default',
    size = 'md',
    icon,
    iconRight,
    loading = false,
    block = false,
    className,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  const iconOnly = !children && (icon || iconRight);

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'btn',
        VARIANTS[variant],
        SIZES[size],
        iconOnly && 'btn--icon',
        block && 'btn--block',
        loading && 'is-loading',
        className,
      )}
      {...rest}
    >
      {loading ? null : icon ? <Icon name={icon} size={size === 'sm' ? 14 : 15} /> : null}
      {children}
      {loading ? null : iconRight ? <Icon name={iconRight} size={size === 'sm' ? 14 : 15} /> : null}
    </button>
  );
});

const IconButton = forwardRef(function IconButton(
  { icon, label, size = 'md', variant = 'ghost', badge, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'icon-btn',
        variant === 'outline' && 'border border-border',
        size === 'sm' && 'h-7 w-7',
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={size === 'sm' ? 14 : 16} />
      {badge ? <span className="dot-badge">{badge > 9 ? '9+' : badge}</span> : null}
    </button>
  );
});

export { Button, IconButton };