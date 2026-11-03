import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { PageHead, PageToolbar } from '../components/ui/Page';
import { Card, CardHead, CardTitle, CardSub, CardBody } from '../components/ui/Card';
import { Bars } from '../components/ui/Blocks';
import DataTable from '../components/ui/DataTable';
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

export default function Events() {
  const { selectedProjectId } = useProject();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [range, setRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const loadData = useCallback(async (showSpin = true) => {
    if (showSpin) setLoading(true);
    try {
      const res = await fetchAnalyticsData({ projectId: selectedProjectId, range });
      setData(res);
    } catch {
      showToast('Failed to load events', 'error');
    } finally {
      if (showSpin) setLoading(false);
    }
  }, [selectedProjectId, range, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = () => {
    if (!data?.eventsList?.length) {
      showToast('No events to export');
      return;
    }
    const csv = toCsv(
      data.eventsList.map((e) => ({
        Event: e.name,
        Label: e.label,
        Occurrences: e.occurrences,
        Visitors: e.visitors,
        Conversion: e.conversion ? `${e.conversion}%` : 'N/A',
        LastFired: e.last
      }))
    );
    downloadFile(`events-${range}.csv`, csv, 'text/csv');
    showToast('Export complete', 'Events report downloaded');
  };

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Event',
        render: (r) => (
          <div className="flex flex-col">
            <span className="font-mono font-semibold text-foreground text-xs">{r.name}</span>
            <span className="text-xs text-muted-foreground">{r.label}</span>
          </div>
        )
      },
      {
        key: 'occurrences',
        label: 'Occurrences',
        align: 'right',
        render: (r) => <span className="font-mono">{fmtInt(r.occurrences)}</span>
      },
      {
        key: 'visitors',
        label: 'Visitors',
        align: 'right',
        render: (r) => <span className="font-mono">{fmtInt(r.visitors)}</span>
      },
      {
        key: 'conversion',
        label: 'Conversion',
        align: 'right',
        render: (r) => (
          <span className="font-mono">
            {r.conversion == null ? <span className="text-muted-foreground">—</span> : fmtPct(r.conversion)}
          </span>
        )
      },
      {
        key: 'last',
        label: 'Last fired',
        align: 'right',
        sortable: false,
        render: (r) => <span className="text-muted-foreground text-xs">{r.last}</span>
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
            onClick={() => navigate(`/dashboard/events/${encodeURIComponent(r.name)}`)}
          >
            Open
            <Icon name="chevronRight" size={14} />
          </button>
        )
      }
    ],
    [navigate]
  );

  return (
    <div className="page animate-fade-in">
      <PageHead
        title="Events"
        desc="Tracked events across the site and their conversion rates."
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
        {/* Events by Visitors Chart */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>Events by visitors</CardTitle>
              <CardSub>Which events engage the highest number of visitors</CardSub>
            </div>
          </CardHead>
          <CardBody>
            {loading ? (
              <BlockSkeleton height={200} />
            ) : (
              <Bars
                rows={(data?.eventsList || []).map((e) => ({
                  name: e.name,
                  value: e.visitors,
                  note: `${fmtInt(e.occurrences)} occurrences`
                }))}
              />
            )}
          </CardBody>
        </Card>

        {/* Events DataTable */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>Custom events</CardTitle>
              <CardSub>All track() events registered for this project</CardSub>
            </div>
          </CardHead>
          <CardBody className="p-0">
            <DataTable
              id="events-table"
              columns={columns}
              rows={data?.eventsList || []}
              loading={loading}
              searchPlaceholder="Search events…"
              searchKeys={['name', 'label']}
              pageSize={8}
              defaultSort="occurrences"
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
