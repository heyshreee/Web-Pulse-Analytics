import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { PageHead, PageToolbar } from '../components/ui/Page';
import { Card, CardHead, CardTitle, CardSub, CardActions, CardBody } from '../components/ui/Card';
import { KpiGrid, Bars, Donut } from '../components/ui/Blocks';
import { TrafficChart, Sparkline } from '../components/ui/Charts';
import DataTable from '../components/ui/DataTable';
import { LiveChip } from '../components/ui/Display';
import { BlockSkeleton, TableSkeleton } from '../components/ui/State';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { fetchAnalyticsData } from '../lib/dataService';
import { fmtInt, fmtPct, toCsv, downloadFile } from '../lib/format';

const RANGES = [
  { id: '24h', label: 'Last 24 hours' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' }
];

const METRICS = [
  { id: 'visitors', label: 'Visitors' },
  { id: 'pageViews', label: 'Page views' },
  { id: 'sessions', label: 'Sessions' }
];

export default function Dashboard() {
  const { currentProject, selectedProjectId, openAddProject } = useProject();
  const { showToast } = useToast();

  const [range, setRange] = useState('24h');
  const [metric, setMetric] = useState('visitors');
  const [compare, setCompare] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const loadData = useCallback(async (showSpin = true) => {
    if (showSpin) setLoading(true);
    try {
      const res = await fetchAnalyticsData({
        projectId: selectedProjectId,
        range
      });
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard analytics', err);
      showToast('Could not load recent analytics', 'error');
    } finally {
      if (showSpin) setLoading(false);
    }
  }, [selectedProjectId, range, showToast]);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(false), 12000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleExport = () => {
    if (!data?.pages?.length) {
      showToast('No data available to export');
      return;
    }
    const csv = toCsv(
      data.pages.map((p) => ({
        Page: p.path,
        Title: p.title,
        Views: p.views,
        Visitors: p.visitors,
        AvgTime: p.avg,
        BounceRate: p.bounce == null ? '—' : `${p.bounce}%`
      }))
    );
    downloadFile(`webpulse-analytics-${range}.csv`, csv, 'text/csv');
    showToast('Export complete', 'CSV report downloaded');
  };

  const chartSeries = useMemo(() => {
    if (!data?.trafficData) return [];
    return data.trafficData.map((d) => ({
      name: d.name,
      views: d.views,
      visitors: d.visitors,
      sessions: d.sessions,
      compare: d.compare
    }));
  }, [data]);

  const metricKey = metric === 'pageViews' ? 'views' : metric;

  const browserTop = data?.browsers?.[0];
  const browserTotal = (data?.browsers || []).reduce((a, b) => a + b.value, 0);

  const pageColumns = useMemo(
    () => [
      {
        key: 'path',
        label: 'Page',
        render: (r) => (
          <div className="flex flex-col">
            <span className="font-mono font-semibold text-foreground text-xs">{r.path}</span>
            <span className="text-xs text-muted-foreground">{r.title}</span>
          </div>
        )
      },
      {
        key: 'views',
        label: 'Views',
        align: 'right',
        render: (r) => <span className="font-mono">{fmtInt(r.views)}</span>
      },
      {
        key: 'visitors',
        label: 'Visitors',
        align: 'right',
        render: (r) => <span className="font-mono">{fmtInt(r.visitors)}</span>
      },
      {
        key: 'avg',
        label: 'Avg. time',
        align: 'right',
        render: (r) => <span className="font-mono">{r.avg}</span>
      },
      {
        key: 'bounce',
        label: 'Bounce',
        align: 'right',
        render: (r) => <span className="font-mono">{r.bounce == null ? '—' : fmtPct(r.bounce)}</span>
      },
      {
        key: 'delta',
        label: 'Change',
        align: 'right',
        render: (r) => {
          if (r.delta == null) return <span className="text-muted-foreground">—</span>;
          const positive = r.delta >= 0;
          return (
            <span className={`trend ${positive ? 'trend--up' : 'trend--down'}`}>
              <Icon name={positive ? 'upRight' : 'downRight'} size={13} />
              {positive ? '+' : ''}
              {r.delta}%
            </span>
          );
        }
      }
    ],
    []
  );

  return (
    <div className="page animate-fade-in">
      <PageHead
        title="Dashboard"
        desc="Monitor your website performance in real time."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" icon="download" onClick={handleExport}>
              Export
            </Button>
            <Button icon="plus" onClick={openAddProject}>
              Add project
            </Button>
          </div>
        }
        meta={
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <LiveChip live={data?.installed || currentProject?.installed} label={data?.installed ? 'Live' : 'Not receiving data'} />
            <span className="text-muted-foreground">Updated just now</span>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                loadData(true);
                showToast('Refreshing analytics…');
              }}
            >
              <Icon name="refresh" size={13} />
              Refresh
            </button>
          </div>
        }
      />

      <PageToolbar>
        <select
          className="select w-auto min-w-[150px]"
          value={range}
          onChange={(e) => setRange(e.target.value)}
          aria-label="Date range"
        >
          {RANGES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={compare}
            onChange={(e) => setCompare(e.target.checked)}
          />
          Compare to previous period
        </label>
      </PageToolbar>

      {/* KPI Cards */}
      <KpiGrid loading={loading} items={data?.kpis || []} compare={compare} />

      <div className="space-y-4 mt-4">
        {/* Dominant Traffic Overview Chart */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>{METRICS.find((m) => m.id === metric)?.label || 'Traffic'} over time</CardTitle>
              <CardSub>
                {RANGES.find((r) => r.id === range)?.label}
                {compare ? ' · compared to previous period' : ''}
              </CardSub>
            </div>
            <CardActions>
              <div className="segmented" role="group" aria-label="Date range selection">
                {RANGES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    aria-pressed={range === r.id}
                    onClick={() => setRange(r.id)}
                  >
                    {r.id}
                  </button>
                ))}
              </div>
              <select
                className="select btn--sm w-auto min-w-[120px]"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                aria-label="Metric"
              >
                {METRICS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </CardActions>
          </CardHead>
          <CardBody>
            {loading ? (
              <BlockSkeleton height={280} />
            ) : (
              <TrafficChart
                data={chartSeries}
                dataKey={metricKey}
                compare={compare}
                height={260}
                seriesLabel={METRICS.find((m) => m.id === metric)?.label || 'Page views'}
              />
            )}
          </CardBody>
        </Card>

        {/* Dash Grid: Live Activity + Traffic Sources */}
        <div className="dash-grid">
          <Card>
            <CardHead>
              <div>
                <CardTitle>Live visitors</CardTitle>
                <CardSub>Updated just now</CardSub>
              </div>
              <CardActions>
                <Link to="/dashboard/live" className="btn btn--ghost btn--sm">
                  View all
                  <Icon name="chevronRight" size={14} />
                </Link>
              </CardActions>
            </CardHead>
            <CardBody>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-3xl font-bold font-mono tracking-tight text-foreground">
                  {data?.realTimeVisitors || 0}
                </span>
                <span className="live-chip">
                  <span className="live-dot" aria-hidden="true" />
                  right now
                </span>
              </div>
              <div className="h-14 my-2">
                <Sparkline
                  data={data?.sparkline || []}
                  dataKey="value"
                  width={280}
                  height={52}
                  color="var(--live)"
                />
              </div>
              <div className="space-y-2 mt-4">
                {(data?.pages || []).slice(0, 3).map((p) => (
                  <div key={p.path} className="flex items-center justify-between text-xs py-1 border-b border-border/50">
                    <span className="font-mono text-muted-foreground truncate max-w-[200px]">{p.path}</span>
                    <span className="font-mono font-semibold text-foreground">{fmtInt(p.views)}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHead>
              <div>
                <CardTitle>Traffic sources</CardTitle>
                <CardSub>Where visitors came from</CardSub>
              </div>
              <CardActions>
                <Link to="/dashboard/sources" className="btn btn--ghost btn--sm">
                  Details
                </Link>
              </CardActions>
            </CardHead>
            <CardBody>
              {loading ? (
                <BlockSkeleton height={200} />
              ) : (
                <Bars
                  rows={(data?.sources || []).map((s) => ({
                    name: s.name,
                    value: s.visitors,
                    color: s.color,
                    note: `${s.share}% of traffic`
                  }))}
                />
              )}
            </CardBody>
          </Card>
        </div>

        {/* Pages Table */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>Top pages</CardTitle>
              <CardSub>Most visited pages this period</CardSub>
            </div>
            <CardActions>
              <Link to="/dashboard/pages" className="btn btn--outline btn--sm">
                All pages
                <Icon name="chevronRight" size={14} />
              </Link>
            </CardActions>
          </CardHead>
          <CardBody className="p-0">
            <DataTable
              id="dash-pages-table"
              columns={pageColumns}
              rows={data?.pages || []}
              loading={loading}
              searchPlaceholder="Search pages…"
              searchKeys={['path', 'title']}
              pageSize={6}
              defaultSort="views"
            />
          </CardBody>
        </Card>

        {/* Dash Grid: Geography + Devices */}
        <div className="dash-grid dash-grid--even">
          <Card>
            <CardHead>
              <div>
                <CardTitle>Top countries</CardTitle>
                <CardSub>By unique visitors</CardSub>
              </div>
              <CardActions>
                <Link to="/dashboard/geography" className="btn btn--ghost btn--sm">
                  Details
                </Link>
              </CardActions>
            </CardHead>
            <CardBody>
              {loading ? (
                <BlockSkeleton height={180} />
              ) : (
                <Bars
                  rows={(data?.geography || []).slice(0, 5).map((g) => ({
                    name: `${g.flag} ${g.name}`,
                    value: g.visitors,
                    note: `${fmtInt(g.sessions)} sessions`
                  }))}
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHead>
              <div>
                <CardTitle>Devices</CardTitle>
                <CardSub>Share of visitors</CardSub>
              </div>
            </CardHead>
            <CardBody>
              {loading ? (
                <BlockSkeleton height={180} />
              ) : (
                <Donut
                  data={data?.devices || []}
                  centerValue={fmtInt((data?.devices || []).reduce((a, d) => a + d.value, 0))}
                  centerLabel="visitors"
                />
              )}
            </CardBody>
          </Card>
        </div>

        {/* Dash Grid: Browsers + Operating Systems */}
        <div className="dash-grid dash-grid--even">
          <Card>
            <CardHead>
              <div>
                <CardTitle>Browsers</CardTitle>
                <CardSub>Share of visitors</CardSub>
              </div>
            </CardHead>
            <CardBody>
              {loading ? (
                <BlockSkeleton height={180} />
              ) : (
                <Donut
                  data={data?.browsers || []}
                  centerValue={browserTop?.name || '—'}
                  centerLabel={`${browserTotal ? Math.round((browserTop.value / browserTotal) * 100) : 0}% share`}
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHead>
              <div>
                <CardTitle>Operating systems</CardTitle>
                <CardSub>Share of visitors</CardSub>
              </div>
            </CardHead>
            <CardBody>
              {loading ? (
                <BlockSkeleton height={180} />
              ) : (
                <Bars
                  rows={(data?.os || []).map((o) => ({
                    name: o.name,
                    value: o.value,
                    note: `${fmtInt(o.sessions || o.value * 20)} sessions`
                  }))}
                  fmt={(r) => `${r.value}%`}
                />
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
