import { forwardRef, useId } from 'react';
import { cn } from '../../lib/utils';
import Icon from './Icon';

/** Label + control + hint/error wrapper used by every form in the product. */
export function Field({ label, hint, error, required, htmlFor, className, children }) {
  return (
    <div className={cn('field', className)}>
      {label ? (
        <label className="label" htmlFor={htmlFor}>
          {label}
          {required ? <span className="req">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <span className="field-error" role="alert">
          <Icon name="warn" size={12} />
          {error}
        </span>
      ) : hint ? (
        <span className="hint">{hint}</span>
      ) : null}
    </div>
  );
}

export const Input = forwardRef(function Input(
  { label, hint, error, required, icon, className, id, suffix, ...rest },
  ref,
) {
  const auto = useId();
  const inputId = id || auto;

  const control = (
    <input
      ref={ref}
      id={inputId}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={hint || error ? `${inputId}-desc` : undefined}
      className={cn('input', className)}
      {...rest}
    />
  );

  const body = icon ? (
    <div className="search-wrap">
      <Icon name={icon} size={14} />
      {control}
    </div>
  ) : suffix ? (
    <div className="input-group">
      {control}
      {suffix}
    </div>
  ) : (
    control
  );

  if (!label && !hint && !error) return body;
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
      {body}
      {hint || error ? <span id={`${inputId}-desc`} className="sr-only" /> : null}
    </Field>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, hint, error, required, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const tid = id || auto;
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={tid}>
      <textarea
        ref={ref}
        id={tid}
        aria-invalid={error ? 'true' : undefined}
        className={cn('textarea', className)}
        {...rest}
      />
    </Field>
  );
});

export const Select = forwardRef(function Select(
  { label, hint, error, required, className, id, options = [], placeholder, children, ...rest },
  ref,
) {
  const auto = useId();
  const sid = id || auto;
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={sid}>
      <select
        ref={ref}
        id={sid}
        aria-invalid={error ? 'true' : undefined}
        className={cn('select', className)}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        {children}
      </select>
    </Field>
  );
});

export function Switch({ checked, onChange, label, disabled, id }) {
  const auto = useId();
  const sid = id || auto;
  return (
    <label className="switch" htmlFor={sid}>
      <input
        id={sid}
        type="checkbox"
        role="switch"
        checked={!!checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className="switch-track" />
      <span className="switch-thumb" />
      <span className="sr-only">{label}</span>
    </label>
  );
}

/** Label + description + trailing control row used across Settings. */
export function SettingRow({ title, description, control, children, className }) {
  return (
    <div className={cn('setting-row', className)}>
      <div className="setting-row-text">
        <div className="setting-row-title">{title}</div>
        {description ? <p className="setting-row-desc">{description}</p> : null}
        {children}
      </div>
      {control ? <div className="setting-row-control">{control}</div> : null}
    </div>
  );
}

export function Checkbox({ label, className, ...rest }) {
  return (
    <label className={cn('checkbox', className)}>
      <input type="checkbox" {...rest} />
      <span>{label}</span>
    </label>
  );
}

export function Radio({ label, className, ...rest }) {
  return (
    <label className={cn('checkbox radio', className)}>
      <input type="radio" {...rest} />
      <span>{label}</span>
    </label>
  );
}

export function Alert({ tone = 'info', icon, className, children }) {
  const fallback = { error: 'warn', success: 'checkCircle', warning: 'warn', info: 'info' }[tone];
  return (
    <div className={cn('alert', `alert--${tone}`, className)} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={icon || fallback} size={15} />
      <span>{children}</span>
    </div>
  );
}