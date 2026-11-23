import useInView from '../hooks/useInView';
import CountUp from './CountUp';

export default function AnimatedNumber({
  value,
  end,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  duration = 2,
  className,
  run,
}) {
  const [ref, inView] = useInView(0.4);
  const active = run !== undefined ? run : inView;
  const target = Number(end !== undefined ? end : value ?? 0);
  const safeEnd = isNaN(target) ? 0 : target;

  return (
    <span ref={ref} className={className}>
      <CountUp
        end={safeEnd}
        decimals={decimals}
        prefix={prefix}
        suffix={suffix}
        separator={separator}
        duration={duration}
        run={active}
      />
    </span>
  );
}
