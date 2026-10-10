import { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { PageHead, PageToolbar } from '../components/ui/Page';
import { Card, CardHead, CardTitle, CardSub, CardBody } from '../components/ui/Card';
import { KpiGrid, Bars } from '../components/ui/Blocks';
import { TrafficChart } from '../components/ui/Charts';
import DataTable from '../components/ui/DataTable';
import { Sheet } from '../components/ui/Overlay';
import { BlockSkeleton } from '../components/ui/State';
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

export default function Pages() {
  const { selectedProjectId } = useProject();
  const { showToast } = useToast();

  const [range, setRange] = useState('24h');
  const [compare, setCompare] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activePage, setActivePage] = useState(null);

  const loadData = useCallback(async (showSpin = true) => {
    if (showSpin) setLoading(true);
    try {
      const res = await fetchAnalyticsData({ projectId: selectedProjectId, range });
      setData(res);
    } catch {
      showToast('Failed to load page statistics', 'error');
    } finally {
      if (showSpin) setLoading(false);
    }
  }, [selectedProjectId, range, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = () => {
    if (!data?.pages?.length) {
      showToast('No pages to export');
      return;
    }
    const csv = toCsv(
      data.pages.map((p) => ({
        Path: p.path,
        Title: p.title,
        Views: p.views,
        Visitors: p.visitors,
        AvgTime: p.avg,
        Bounce: `${p.bounce}%`,
        Change: `${p.delta}%`
      }))
    );
    downloadFile(`pages-${range}.csv`, csv, 'text/csv');
    showToast('Export complete', 'Pages report downloaded');
  };

  const columns = useMemo(
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
        render: (r) => <span className="font-mono">{fmtPct(r.bounce)}</span>
      },
      {
        key: 'delta',
        label: 'Change',
        align: 'right',
        render: (r) => {
          const positive = r.delta >= 0;
          return (
            <span className={`trend ${positive ? 'trend--up' : 'trend--down'}`}>
              <Icon name={positive ? 'upRight' : 'downRight'} size={13} />
              {positive ? '+' : ''}
              {r.delta}%
            </span>
          );
        }
      },
      {
        key: '_action',
        label: '',
        sortable: false,
        align: 'right',
        render: (r) => (
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setActivePage(r)}
          >
            Details
          </button>
        )
      }
    ],
    []
  );

  return (
    <div className="page animate-fade-in">
      <PageHead
        title="Pages"
        desc="See which pages perform and where visitors drop off."
        actions={
          <Button variant="outline" icon="download" onClick={handleExport}>
            Export
          </Button>
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

      {/* KPI Grid */}
      <KpiGrid loading={loading} items={data?.kpis?.slice(0, 4) || []} compare={compare} />

      <div className="space-y-4 mt-4">
        {/* Page Views Chart */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>Page views over time</CardTitle>
              <CardSub>
                {RANGES.find((r) => r.id === range)?.label}
                {compare ? ' · compared to previous period' : ''}
              </CardSub>
            </div>
          </CardHead>
          <CardBody>
            {loading ? (
              <BlockSkeleton height={260} />
            ) : (
              <TrafficChart
                data={data?.trafficData || []}
                dataKey="views"
                compare={compare}
                height={260}
                seriesLabel="Views"
              />
            )}
          </CardBody>
        </Card>

        {/* Pages DataTable */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>All pages</CardTitle>
              <CardSub>URL paths tracked for this project</CardSub>
            </div>
          </CardHead>
          <CardBody className="p-0">
            <DataTable
              id="pages-table"
              columns={columns}
              rows={data?.pages || []}
              loading={loading}
              searchPlaceholder="Search pages…"
              searchKeys={['path', 'title']}
              pageSize={8}
              defaultSort="views"
            />
          </CardBody>
        </Card>
      </div>

      {/* Page Detail Sheet */}
      <Sheet
        open={Boolean(activePage)}
        onClose={() => setActivePage(null)}
        title={activePage ? activePage.path : 'Page detail'}
        description={activePage ? activePage.title : ''}
        footer={
          <div className="flex w-full items-center justify-between">
            <button type="button" className="btn btn--ghost" onClick={() => setActivePage(null)}>
              Close
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => showToast('Page analytics exported')}
            >
              <Icon name="download" size={15} />
              Export
            </button>
          </div>
        }
      >
        {activePage && (
          <div className="space-y-6">
            <div className="dl">
              <div className="dl-item">
                <span className="dl-label">Views</span>
                <span className="dl-value font-mono">{fmtInt(activePage.views)}</span>
              </div>
              <div className="dl-item">
                <span className="dl-label">Unique visitors</span>
                <span className="dl-value font-mono">{fmtInt(activePage.visitors)}</span>
              </div>
              <div className="dl-item">
                <span className="dl-label">Avg. time on page</span>
                <span className="dl-value font-mono">{activePage.avg}</span>
              </div>
              <div className="dl-item">
                <span className="dl-label">Bounce rate</span>
                <span className="dl-value font-mono">{fmtPct(activePage.bounce)}</span>
              </div>
            </div>

            <div>
              <p className="eyebrow mb-3">Views compared with your top pages</p>
              <Bars
                rows={(data?.pages || []).slice(0, 5).map((p) => ({
                  name: p.path,
                  value: p.views,
                  color: p.path === activePage.path ? 'var(--chart-1)' : 'var(--muted)'
                }))}
              />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
