import { useEffect, useRef, useState } from 'react';

export default function CountUp({
  end,
  duration = 2,
  decimals = 0,
  separator = ',',
  prefix = '',
  suffix = '',
  start = 0,
  run = true,
  className,
}) {
  const [value, setValue] = useState(start);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(start);

  useEffect(() => {
    if (!run) return;
    const from = fromRef.current;
    const to = end;
    if (from === to) {
      setValue(to);
      return;
    }

    const step = (now) => {
      if (startRef.current == null) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      const val = from + (to - from) * eased;
      setValue(val);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafRef.current);
      fromRef.current = value;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end, duration, run]);

  const fixed = value.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  const formattedInt = separator
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    : intPart;

  return (
    <span className={className}>
      {prefix}
      {formattedInt}
      {decimals > 0 && decPart !== undefined && `.${decPart}`}
      {suffix}
    </span>
  );
}
