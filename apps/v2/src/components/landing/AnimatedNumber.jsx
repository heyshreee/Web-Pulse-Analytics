import useInView from '../../hooks/useInView';
import CountUp from './CountUp';

export default function AnimatedNumber({
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
  return (
    <span ref={ref} className={className}>
      <CountUp
        end={end}
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
