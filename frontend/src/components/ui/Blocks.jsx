import { useMemo } from 'react';
import { cn } from '../../lib/utils';
import { kpiValue } from '../../lib/format';
import Icon from './Icon';

/**
 * Delta pill. `invert` flips the good/bad mapping for metrics where a rise is
 * bad (e.g. bounce rate).
 */
export function Trend({ delta, invert = false, className }) {
  const d = Number(delta) || 0;
  const rising = d > 0;
  const good = invert ? !rising : rising;
  const tone = d === 0 ? 'flat' : good ? 'up' : 'down';
  const glyph = d > 0 ? 'upRight' : d < 0 ? 'downRight' : 'minus';

  return (
    <span className={cn('trend', `trend--${tone}`, className)}>
      <Icon name={glyph} size={13} />
      {d > 0 ? '+' : ''}
      {d.toFixed(1)}%
    </span>
  );
}

export function Kpi({ label, value, format, delta, invert, icon, compare, className }) {
  return (
    <div className={cn('kpi', className)}>
      <div className="kpi-head">
        <span className="kpi-label">{label}</span>
        {icon ? (
          <span className="kpi-icon">
            <Icon name={icon} size={15} />
          </span>
        ) : null}
      </div>
      <div className="kpi-value">{kpiValue(value, format)}</div>
      <div className="kpi-foot">
        {delta != null ? <Trend delta={delta} invert={invert} /> : null}
        {compare ? <span className="kpi-compare">{compare}</span> : null}
      </div>
    </div>
  );
}

export function KpiGrid({ items, compare, loading, count, children, className }) {
  if (loading) {
    const skeletonCount = count || 6;
    return (
      <div className={cn('kpi-grid', className)} aria-hidden="true">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="kpi">
            <div className="kpi-head justify-between">
              <div className="skeleton skeleton--text w-20" />
              <div className="skeleton w-4 h-4 rounded-full" />
            </div>
            <div className="skeleton h-7 w-24 my-1.5" />
            <div className="kpi-foot">
              <div className="skeleton skeleton--text w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (Array.isArray(items)) {
    return (
      <div className={cn('kpi-grid', className)}>
        {items.map((item, idx) => (
          <Kpi
            key={item.id || item.label || idx}
            label={item.label}
            value={item.value}
            format={item.format}
            delta={item.delta}
            invert={item.invert}
            icon={item.icon}
            compare={compare ? item.compareLabel || 'vs prior period' : undefined}
          />
        ))}
      </div>
    );
  }

  return <div className={cn('kpi-grid', className)}>{children}</div>;
}

/** Horizontal ranked bar list — top pages, referrers, browsers, countries. */
export function Bars({ items = [], rows, emptyText = 'No data in this range.', color = 'var(--chart-1)', className }) {
  const list = items && items.length > 0 ? items : (rows || []);
  if (!list.length) return <p className="text-sm muted">{emptyText}</p>;
  const max = Math.max(...list.map((i) => Number(i.value) || 0), 1);

  return (
    <div className={cn('bars', className)}>
      {list.map((item) => (
        <div className="bar-row" key={item.name}>
          <div className="bar-meta">
            <span className="bar-name truncate">{item.name}</span>
            <span className="bar-value">
              {item.value}
              {item.suffix || ''}
            </span>
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                width: `${Math.max(2, ((Number(item.value) || 0) / max) * 100)}%`,
                background: item.color || color,
              }}
            />
          </div>
          {item.note ? <span className="bar-note">{item.note}</span> : null}
        </div>
      ))}
    </div>
  );
}

/** Donut with a centered total and a value legend. */
const PALETTE = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-3)'];

export function Donut({ items = [], data, size = 132, thickness = 14, centerLabel = 'Total', centerValue, colors, className }) {
  const list = useMemo(() => (items && items.length > 0 ? items : (data || [])), [items, data]);
  const palette = colors || PALETTE;
  const total = list.reduce((sum, i) => sum + (Number(i.value) || 0), 0);
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;

  // Pure accumulation keeps each arc's dash offset stable across renders.
  const arcs = useMemo(
    () =>
      list.reduce(
        (acc, item, i) => {
          const frac = total ? (Number(item.value) || 0) / total : 0;
          const len = frac * circumference;
          const start = acc.acc;
          return {
            acc: acc.acc + len,
            list: [
              ...acc.list,
              {
                key: item.name,
                color: item.color || palette[i % palette.length],
                dash: `${len} ${circumference - len}`,
                offset: -start,
              },
            ],
          };
        },
        { acc: 0, list: [] },
      ).list,
    [list, total, circumference, palette],
  );

  return (
    <div className={cn('donut-wrap', className)}>
      <div className="donut" style={{ width: size, height: size }}>
        <svg width={size} height={size} role="img" aria-label={`${centerLabel}: ${centerValue || total}`}>
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="var(--muted)"
              strokeWidth={thickness}
            />
            {arcs.map((a) => (
              <circle
                key={a.key}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={a.color}
                strokeWidth={thickness}
                strokeDasharray={a.dash}
                strokeDashoffset={a.offset}
              />
            ))}
          </g>
        </svg>
        <div className="donut-center">
          <span className="donut-center-value">{centerValue != null ? centerValue : total.toLocaleString('en-US')}</span>
          <span className="donut-center-label">{centerLabel}</span>
        </div>
      </div>
      <div className="donut-legend">
        {list.map((item, i) => (
          <div className="donut-legend-item" key={item.name}>
            <span
              className="legend-swatch legend-swatch--dot"
              style={{ background: item.color || palette[i % palette.length] }}
            />
            <span className="truncate">{item.name}</span>
            <span className="bar-value">
              {total ? Math.round(((Number(item.value) || 0) / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Definition list used for detail panels. */
export function DefList({ items = [], className }) {
  return (
    <dl className={cn('dl', className)}>
      {items.map((it) => (
        <div className="dl-item" key={it.label}>
          <dt className="dl-label">{it.label}</dt>
          <dd className="dl-value" title={typeof it.value === 'string' ? it.value : undefined}>
            {it.value ?? '—'}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Real-time activity feed row used on Dashboard and Live Activity. */
export function FeedItem({ icon = 'click', iconTone, line1, line2, time, onClick }) {
  return (
    <button type="button" className="feed-item" onClick={onClick}>
      <span className={cn('feed-icon', iconTone && `feed-icon--${iconTone}`)}>
        <Icon name={icon} size={14} />
      </span>
      <span className="feed-text">
        <span className="feed-line1 clamp-2">{line1}</span>
        {line2 ? <span className="feed-line2 truncate">{line2}</span> : null}
      </span>
      {time ? <span className="feed-time">{time}</span> : null}
    </button>
  );
}

/** Vertical timeline used for session/event drill-downs. */
export function Timeline({ items = [] }) {
  return (
    <div className="timeline">
      {items.map((it, i) => (
        <div className="timeline-item" key={it.id ?? i}>
          <span className="timeline-time">{it.time}</span>
          <span className="timeline-rail">
            <span className="timeline-dot" />
            {i < items.length - 1 ? <span className="timeline-line" /> : null}
          </span>
          <span className="timeline-body">
            <span className="timeline-title">{it.title}</span>
            {it.meta ? <span className="timeline-meta">{it.meta}</span> : null}
          </span>
        </div>
      ))}
    </div>
  );
}