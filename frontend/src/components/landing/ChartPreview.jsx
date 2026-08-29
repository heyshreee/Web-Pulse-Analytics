import { useMemo } from 'react';

const GRID = 'rgba(148, 163, 184, 0.18)';
const STROKE = '#8B5CF6';

// Lightweight pure-SVG recreation of the traffic trend chart. Used only for the
// decorative marketing preview so the landing page never has to download or
// execute the production Recharts engine. Axis labels are rendered as HTML
// overlays so they are never distorted by the responsive SVG scaling.
export default function ChartPreview({ data = [], dark }) {
  const isDark = !!dark;
  const labelColor = isDark ? 'rgba(226, 232, 240, 0.75)' : '#94a3b8';
  const tickColor = isDark ? 'rgba(148, 163, 184, 0.5)' : '#cbd5e1';

  const geometry = useMemo(() => {
    const w = 640;
    const h = 220;
    const padX = 12;
    const padTop = 20;
    const padBottom = 24;
    const plotH = h - padTop - padBottom;

    const values = data.map((d) => Number(d.views));
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;

    const step = values.length > 1 ? (w - padX * 2) / (values.length - 1) : 0;
    const pts = values.map((v, i) => {
      const x = padX + i * step;
      const y = padTop + plotH - ((v - min) / range) * plotH;
      return [x, y];
    });

    const line = pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
      .join(' ');

    const lastX = pts.length ? pts[pts.length - 1][0] : w - padX;
    const areaPath = `${line} L${lastX.toFixed(1)},${(padTop + plotH).toFixed(
      1
    )} L${padX},${(padTop + plotH).toFixed(1)} Z`;

    const gridLines = [0, 1, 2, 3].map((i) => {
      const y = padTop + plotH - (i / 3) * plotH;
      return { y, val: max - (i / 3) * range };
    });

    return { line, areaPath, gridLines, maxLabel: (max / 1000).toFixed(0) };
  }, [data]);

  if (!data.length) return null;

  const xTicks = [0, 1, 2, 3].map((i) => {
    const idx = Math.round((i / 3) * (data.length - 1));
    return data[idx]?.name || '';
  });

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox="0 0 640 220"
        className="h-full w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="chartPreviewFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {geometry.gridLines.map((g, i) => (
          <line
            key={i}
            x1="12"
            x2="628"
            y1={g.y}
            y2={g.y}
            stroke={i === 0 ? tickColor : GRID}
            strokeWidth="1"
            strokeDasharray={i === 0 ? undefined : '3 3'}
          />
        ))}

        <path d={geometry.areaPath} fill="url(#chartPreviewFill)" />
        <path
          d={geometry.line}
          fill="none"
          stroke={STROKE}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <span
        className="pointer-events-none absolute left-2 top-1 text-[11px] font-bold tabular-nums"
        style={{ color: labelColor }}
      >
        {geometry.maxLabel}k
      </span>

      <div className="pointer-events-none absolute inset-x-3 bottom-0 flex justify-between text-[10px]"
        style={{ color: labelColor }}>
        {xTicks.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    </div>
  );
}
