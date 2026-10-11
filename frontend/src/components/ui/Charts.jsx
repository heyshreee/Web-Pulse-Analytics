import { useMemo } from 'react';
import {
  Area,
  AreaChart as RAreaChart,
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  Cell,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from 'recharts';
import { cn } from '../../lib/utils';
import { fmtInt, compact } from '../../lib/format';

const AXIS = {
  stroke: 'var(--chart-axis)',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  // Anchor the panel directly above the hovered data point (Recharts positions
  // the wrapper at the active point; the transform lifts the panel above it).
  return (
    <div
      className="chart-tip"
      data-open="true"
      style={{ position: 'relative', top: 'auto', left: 'auto', transform: 'none' }}
    >
      <div className="chart-tip-label">{label}</div>
      {payload.map((p) => (
        <div className="chart-tip-value" key={p.dataKey ?? p.name}>
          {fmtInt(p.value)}
          {unit ? ` ${unit}` : ''}
        </div>
      ))}
      {payload.length > 1 ? (
        <div className="chart-tip-compare">
          {payload[1].name || 'Previous'}: {fmtInt(payload[1].value)}
        </div>
      ) : null}
    </div>
  );
}

// Shared styling for the dot that marks the currently hovered data point.
const ACTIVE_DOT = { r: 4, fill: 'var(--chart-1)', stroke: 'var(--card)', strokeWidth: 2 };

function Legend({ series }) {
  return (
    <div className="chart-legend">
      {series.map((s) => (
        <span className="legend-item" key={s.label}>
          <span
            className={cn('legend-swatch', s.dot && 'legend-swatch--dot')}
            style={{ background: s.color }}
          />
          {s.label}
        </span>
      ))}
    </div>
  );
}

/**
 * Traffic-over-time area chart with an optional previous-period comparison
 * series, matching the exported chart treatment.
 */
export function TrafficChart({
  data = [],
  dataKey = 'views',
  compare = false,
  height = 260,
  seriesLabel = 'Page views',
  ariaLabel,
}) {
  const series = useMemo(
    () => [
      { label: seriesLabel, color: 'var(--chart-1)' },
      ...(compare ? [{ label: 'Previous period', color: 'var(--chart-series-compare)' }] : []),
    ],
    [seriesLabel, compare],
  );

  return (
    <>
      <div className="chart" style={{ height }} role="img" aria-label={ariaLabel || seriesLabel}>
        <ResponsiveContainer width="100%" height="100%">
          <RAreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="wpAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="name" {...AXIS} minTickGap={24} />
            <YAxis {...AXIS} width={38} tickFormatter={compact} />
            <Tooltip
              content={<ChartTooltip />}
              wrapperStyle={{ position: 'absolute', zIndex: 20 }}
              cursor={{ stroke: 'var(--chart-1)', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#wpAreaFill)"
              dot={false}
              activeDot={ACTIVE_DOT}
              isAnimationActive={false}
            />
            {compare ? (
              <Line
                type="monotone"
                dataKey="compare"
                name="Previous period"
                stroke="var(--chart-series-compare)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
                activeDot={{ r: 3, fill: 'var(--chart-series-compare)', stroke: 'var(--card)', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            ) : null}
          </RAreaChart>
        </ResponsiveContainer>
      </div>
      {compare ? <Legend series={series} /> : null}
    </>
  );
}

/** Bar chart for hourly/daily distributions. */
export function DistributionChart({ data = [], dataKey = 'views', height = 200, colors, ariaLabel }) {
  const palette = colors || ['var(--chart-1)'];
  return (
    <div className="chart" style={{ height }} role="img" aria-label={ariaLabel || 'Distribution'}>
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="name" {...AXIS} minTickGap={16} />
          <YAxis {...AXIS} width={34} tickFormatter={compact} />
          <Tooltip
            content={<ChartTooltip />}
            wrapperStyle={{ position: 'absolute' }}
            cursor={{ fill: 'var(--hover-tint)' }}
          />
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell key={d.name ?? i} fill={palette[i % palette.length]} />
            ))}
          </Bar>
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Main + comparison lines without a filled area — used on secondary cards. */
export function TrendChart({ data = [], dataKey = 'views', compareKey, height = 200, ariaLabel }) {
  return (
    <div className="chart" style={{ height }} role="img" aria-label={ariaLabel || 'Trend'}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="name" {...AXIS} minTickGap={20} />
          <YAxis {...AXIS} width={34} tickFormatter={compact} />
          <Tooltip
            wrapperStyle={{ position: 'absolute' }}
            content={<ChartTooltip />}
            cursor={{ stroke: 'var(--chart-1)', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={false}
            activeDot={ACTIVE_DOT}
            isAnimationActive={false}
          />
          {compareKey ? (
            <Line
              type="monotone"
              dataKey={compareKey}
              stroke="var(--chart-series-compare)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              isAnimationActive={false}
            />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Compact inline sparkline for KPI tiles and table rows. */
export function Sparkline({ data = [], dataKey = 'value', width = 96, height = 26, color = 'var(--chart-1)' }) {
  return (
    <svg width={width} height={height} aria-hidden="true" style={{ display: 'block' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={buildPoints(data, dataKey, width, height)}
      />
    </svg>
  );
}

function buildPoints(data, dataKey, width, height) {
  if (!data.length) return '';
  const values = data.map((d) => Number(d[dataKey]) || 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = data.length > 1 ? width / (data.length - 1) : width;

  return values
    .map((v, i) => `${(i * step).toFixed(1)},${(height - ((v - min) / span) * (height - 3) - 1.5).toFixed(1)}`)
    .join(' ');
}
