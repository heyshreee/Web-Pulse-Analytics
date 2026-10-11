import { cn } from '../../lib/utils';

export function Card({ className, ...rest }) {
  return <section className={cn('card', className)} {...rest} />;
}

export function CardHead({ className, children, ...rest }) {
  return (
    <div className={cn('card-head', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }) {
  return (
    <h3 className={cn('card-title', className)} {...rest}>
      {children}
    </h3>
  );
}

export function CardSub({ className, children, ...rest }) {
  return (
    <p className={cn('card-sub', className)} {...rest}>
      {children}
    </p>
  );
}

export function CardActions({ className, children, ...rest }) {
  return (
    <div className={cn('card-actions', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardBody({ className, flush = false, children, ...rest }) {
  return (
    <div className={cn('card-body', flush && 'card-body--flush', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFoot({ className, children, ...rest }) {
  return (
    <div className={cn('card-foot', className)} {...rest}>
      {children}
    </div>
  );
}
