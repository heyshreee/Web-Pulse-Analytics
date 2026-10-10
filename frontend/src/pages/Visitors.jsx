import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { PageHead, PageToolbar } from '../components/ui/Page';
import { Card, CardHead, CardTitle, CardSub, CardBody } from '../components/ui/Card';
import { KpiGrid, Timeline } from '../components/ui/Blocks';
import { TrafficChart, Sparkline } from '../components/ui/Charts';
import DataTable from '../components/ui/DataTable';
import { Sheet } from '../components/ui/Overlay';
import { BlockSkeleton } from '../components/ui/State';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { fetchAnalyticsData } from '../lib/dataService';
import { fmtInt, toCsv, downloadFile } from '../lib/format';

const RANGES = [
  { id: '24h', label: 'Last 24 hours' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' }
];

export default function Visitors() {
  const { selectedProjectId } = useProject();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [range, setRange] = useState('24h');
  const [compare, setCompare] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeVisitor, setActiveVisitor] = useState(null);

  const loadData = useCallback(async (showSpin = true) => {
    if (showSpin) setLoading(true);
    try {
      const res = await fetchAnalyticsData({ projectId: selectedProjectId, range });
      setData(res);
    } catch {
      showToast('Failed to load visitors', 'error');
    } finally {
      if (showSpin) setLoading(false);
    }
  }, [selectedProjectId, range, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = () => {
    if (!data?.visitorsList?.length) {
      showToast('No visitor records to export');
      return;
    }
    const csv = toCsv(
      data.visitorsList.map((v) => ({
        VisitorID: v.id,
        Country: v.country,
        Device: v.device,
        Browser: v.browser,
        OS: v.os,
        Pages: v.pages,
        Duration: v.duration,
        Events: v.events,
        LastSeen: v.started
      }))
    );
    downloadFile(`visitors-${range}.csv`, csv, 'text/csv');
    showToast('Export complete', 'Visitors list downloaded');
  };

  const columns = useMemo(
    () => [
      {
        key: 'id',
        label: 'Visitor',
        render: (r) => (
          <div className="flex flex-col">
            <span className="font-mono font-semibold text-foreground text-xs">{r.id}</span>
            <span className="text-xs text-muted-foreground">First seen {r.firstSeen}</span>
          </div>
        )
      },
      {
        key: 'country',
        label: 'Country',
        render: (r) => (
          <span className="inline-flex items-center gap-1.5 text-xs">
            <span>{r.flag}</span>
            <span>{r.country}</span>
          </span>
        )
      },
      {
        key: 'device',
        label: 'Device',
        render: (r) => (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon
              name={r.device === 'Mobile' ? 'smartphone' : r.device === 'Tablet' ? 'tablet' : 'monitor'}
              size={14}
            />
            <span className="text-foreground">{r.device}</span>
          </span>
        )
      },
      {
        key: 'browser',
        label: 'Browser / OS',
        render: (r) => (
          <span className="text-xs text-muted-foreground">
            {r.browser} · {r.os}
          </span>
        )
      },
      {
        key: 'pages',
        label: 'Pages',
        align: 'right',
        render: (r) => <span className="font-mono">{r.pages}</span>
      },
      {
        key: 'duration',
        label: 'Duration',
        align: 'right',
        render: (r) => <span className="font-mono">{r.duration}</span>
      },
      {
        key: 'events',
        label: 'Events',
        align: 'right',
        render: (r) => <span className="font-mono">{r.events}</span>
      },
      {
        key: 'started',
        label: 'Last seen',
        align: 'right',
        render: (r) => <span className="text-muted-foreground text-xs">{r.started}</span>
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
            onClick={() => setActiveVisitor(r)}
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
        title="Visitors"
        desc="Understand who is visiting your website."
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
      {loading ? (
        <BlockSkeleton height={100} />
      ) : (
        <KpiGrid items={data?.kpis?.slice(0, 4) || []} compare={compare} />
      )}

      <div className="space-y-4 mt-4">
        {/* Visitors Chart */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>Visitors over time</CardTitle>
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
                seriesLabel="Visitors"
              />
            )}
          </CardBody>
        </Card>

        {/* Visitors DataTable */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>All visitors</CardTitle>
              <CardSub>Detailed log of unique visitors across the period</CardSub>
            </div>
          </CardHead>
          <CardBody className="p-0">
            <DataTable
              id="visitors-table"
              columns={columns}
              rows={data?.visitorsList || []}
              loading={loading}
              searchPlaceholder="Search country, browser, device…"
              searchKeys={['id', 'country', 'device', 'browser', 'os']}
              pageSize={8}
              defaultSort="events"
            />
          </CardBody>
        </Card>
      </div>

      {/* Visitor Detail Sheet */}
      <Sheet
        open={Boolean(activeVisitor)}
        onClose={() => setActiveVisitor(null)}
        title={activeVisitor ? `Visitor ${activeVisitor.id}` : 'Visitor detail'}
        description={activeVisitor ? `First seen ${activeVisitor.firstSeen} · ${activeVisitor.started}` : ''}
        footer={
          <div className="flex w-full items-center justify-between">
            <button type="button" className="btn btn--ghost" onClick={() => setActiveVisitor(null)}>
              Close
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setActiveVisitor(null);
                navigate('/dashboard/sessions');
              }}
            >
              View sessions
            </button>
          </div>
        }
      >
        {activeVisitor && (
          <div className="space-y-6">
            <div className="dl">
              <div className="dl-item">
                <span className="dl-label">Country</span>
                <span className="dl-value">
                  {activeVisitor.flag} {activeVisitor.country}
                </span>
              </div>
              <div className="dl-item">
                <span className="dl-label">Device</span>
                <span className="dl-value">{activeVisitor.device}</span>
              </div>
              <div className="dl-item">
                <span className="dl-label">Browser</span>
                <span className="dl-value">{activeVisitor.browser}</span>
              </div>
              <div className="dl-item">
                <span className="dl-label">OS</span>
                <span className="dl-value">{activeVisitor.os}</span>
              </div>
              <div className="dl-item">
                <span className="dl-label">Pages viewed</span>
                <span className="dl-value font-mono">{activeVisitor.pages}</span>
              </div>
              <div className="dl-item">
                <span className="dl-label">Events fired</span>
                <span className="dl-value font-mono">{activeVisitor.events}</span>
              </div>
              <div className="dl-item">
                <span className="dl-label">Duration</span>
                <span className="dl-value font-mono">{activeVisitor.duration}</span>
              </div>
              <div className="dl-item">
                <span className="dl-label">Last seen</span>
                <span className="dl-value">{activeVisitor.started}</span>
              </div>
            </div>

            <div>
              <p className="eyebrow mb-2">Recent activity sparkline</p>
              <div className="h-16 p-2 rounded-lg bg-card border border-border">
                <Sparkline
                  data={data?.sparkline || []}
                  dataKey="value"
                  width={340}
                  height={48}
                  color="var(--chart-1)"
                />
              </div>
            </div>

            <div>
              <p className="eyebrow mb-3">Recent path</p>
              <Timeline
                items={[
                  {
                    time: activeVisitor.firstSeen,
                    title: `Landed on ${activeVisitor.device === 'Desktop' ? 'homepage' : '/'}`,
                    meta: 'Referrer · google search'
                  },
                  {
                    time: activeVisitor.firstSeen,
                    title: 'Viewed /pricing',
                    meta: '2m 14s on page'
                  },
                  {
                    time: activeVisitor.started,
                    title: 'Fired event: cta_click',
                    meta: 'button = start_free_trial'
                  }
                ]}
              />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
