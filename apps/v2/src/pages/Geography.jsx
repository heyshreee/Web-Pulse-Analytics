import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { PageHead, PageToolbar } from '../components/ui/Page';
import { Card, CardHead, CardTitle, CardSub, CardBody } from '../components/ui/Card';
import { Bars } from '../components/ui/Blocks';
import NetworkGlobe from '../components/dashboard/NetworkGlobe';
import DataTable from '../components/ui/DataTable';
import { BlockSkeleton } from '../components/ui/State';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { fetchAnalyticsData } from '../lib/dataService';
import { countryCentroid } from '../lib/countryGeo';
import { fmtInt, fmtPct, toCsv, downloadFile } from '../lib/format';

const RANGES = [
  { id: '24h', label: 'Last 24 hours' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' }
];

export default function Geography() {
  const { selectedProjectId } = useProject();
  const { showToast } = useToast();
  const { theme } = useTheme();

  const [range, setRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const loadData = useCallback(async (showSpin = true) => {
    if (showSpin) setLoading(true);
    try {
      const res = await fetchAnalyticsData({ projectId: selectedProjectId, range });
      setData(res);
    } catch {
      showToast('Failed to load geography analytics', 'error');
    } finally {
      if (showSpin) setLoading(false);
    }
  }, [selectedProjectId, range, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = () => {
    if (!data?.geography?.length) {
      showToast('No country data to export');
      return;
    }
    const csv = toCsv(
      data.geography.map((g) => ({
        Country: g.name,
        Visitors: g.visitors,
        Sessions: g.sessions,
        BounceRate: g.bounce == null ? '—' : `${g.bounce}%`,
        Share: `${g.share}%`
      }))
    );
    downloadFile(`geography-${range}.csv`, csv, 'text/csv');
    showToast('Export complete', 'Geography report downloaded');
  };

  const globeData = useMemo(() => {
    const geo = data?.geography || [];
    return geo
      .map((g) => {
        const c = countryCentroid(g.name);
        if (!c) return null;
        return {
          id: c.iso2 || g.name,
          lat: c.lat,
          lng: c.lng,
          location: `${g.flag ? `${g.flag} ` : ''}${g.name}`,
          count: g.visitors || 0
        };
      })
      .filter(Boolean);
  }, [data]);

  const liveVisitors = useMemo(
    () => (data?.geography || []).reduce((acc, g) => acc + (g.visitors || 0), 0),
    [data]
  );

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Country',
        render: (r) => (
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-foreground">
            <span>{r.flag}</span>
            <span>{r.name}</span>
          </span>
        )
      },
      {
        key: 'visitors',
        label: 'Visitors',
        align: 'right',
        render: (r) => <span className="font-mono">{fmtInt(r.visitors)}</span>
      },
      {
        key: 'sessions',
        label: 'Sessions',
        align: 'right',
        render: (r) => <span className="font-mono">{fmtInt(r.sessions)}</span>
      },
      {
        key: 'bounce',
        label: 'Bounce',
        align: 'right',
        render: (r) => <span className="font-mono">{r.bounce == null ? '—' : fmtPct(r.bounce)}</span>
      },
      {
        key: 'share',
        label: 'Share',
        sortable: false,
        render: (r) => (
          <div className="flex items-center gap-2">
            <div className="progress w-28">
              <div className="progress-bar progress-bar--info" style={{ width: `${r.share}%` }} />
            </div>
            <span className="font-mono text-xs text-muted-foreground">{r.share}%</span>
          </div>
        )
      }
    ],
    []
  );

  return (
    <div className="page animate-fade-in">
      <PageHead
        title="Geography"
        desc="Visitors by country and region."
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
      </PageToolbar>

      <div className="space-y-4 mt-4">
        {/* Global network map */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>Visitor network</CardTitle>
              <CardSub>Live geography of recent visitors across countries</CardSub>
            </div>
          </CardHead>
          <CardBody>
            <div className="h-[360px]">
              <NetworkGlobe
                activityData={globeData}
                loading={loading}
                isDark={theme === 'dark'}
                realTimeVisitors={liveVisitors}
                metricLabel="Visitors"
                statusLabel="Tracked"
                loadingLabel="Loading geography"
                emptyTitle="No location data yet"
                emptyText="We'll plot countries here as soon as visitors arrive."
              />
            </div>
          </CardBody>
        </Card>

        {/* Visitors by country chart */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>Visitors by country</CardTitle>
              <CardSub>{RANGES.find((r) => r.id === range)?.label}</CardSub>
            </div>
          </CardHead>
          <CardBody>
            {loading ? (
              <BlockSkeleton height={220} />
            ) : (
              <Bars
                rows={(data?.geography || []).map((g) => ({
                  name: `${g.flag} ${g.name}`,
                  value: g.visitors,
                  note: `${fmtInt(g.sessions)} sessions`
                }))}
              />
            )}
          </CardBody>
        </Card>

        {/* Countries DataTable */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>All countries</CardTitle>
              <CardSub>Traffic distribution and engagement by location</CardSub>
            </div>
          </CardHead>
          <CardBody className="p-0">
            <DataTable
              id="geo-table"
              columns={columns}
              rows={data?.geography || []}
              loading={loading}
              searchPlaceholder="Search countries…"
              searchKeys={['name']}
              pageSize={8}
              defaultSort="visitors"
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
