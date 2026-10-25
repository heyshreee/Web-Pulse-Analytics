import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { PageHead, PageToolbar } from '../components/ui/Page';
import { Card, CardHead, CardTitle, CardSub, CardBody } from '../components/ui/Card';
import { Bars } from '../components/ui/Blocks';
import DataTable from '../components/ui/DataTable';
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

export default function Sources() {
  const { selectedProjectId } = useProject();
  const { showToast } = useToast();

  const [range, setRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const loadData = useCallback(async (showSpin = true) => {
    if (showSpin) setLoading(true);
    try {
      const res = await fetchAnalyticsData({ projectId: selectedProjectId, range });
      setData(res);
    } catch {
      showToast('Failed to load referral sources', 'error');
    } finally {
      if (showSpin) setLoading(false);
    }
  }, [selectedProjectId, range, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = () => {
    if (!data?.sources?.length) {
      showToast('No sources to export');
      return;
    }
    const csv = toCsv(
      data.sources.map((s) => ({
        Source: s.name,
        Domain: s.key,
        Visitors: s.visitors,
        Share: `${s.share}%`
      }))
    );
    downloadFile(`sources-${range}.csv`, csv, 'text/csv');
    showToast('Export complete', 'Sources report downloaded');
  };

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Source',
        render: (r) => (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-xs">{r.name}</span>
            <span className="font-mono text-xs text-muted-foreground">{r.key}</span>
          </div>
        )
      },
      {
        key: 'visitors',
        label: 'Visitors',
        align: 'right',
        render: (r) => <span className="font-mono">{fmtInt(r.visitors)}</span>
      },
      {
        key: 'share',
        label: 'Share',
        align: 'right',
        render: (r) => <span className="font-mono">{r.share}%</span>
      },
      {
        key: 'bar',
        label: 'Share of traffic',
        sortable: false,
        render: (r) => (
          <div className="progress w-32">
            <div className="progress-bar" style={{ width: `${r.share}%` }} />
          </div>
        )
      }
    ],
    []
  );

  return (
    <div className="page animate-fade-in">
      <PageHead
        title="Sources"
        desc="Where your visitors come from."
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
        {/* Traffic by Source Chart */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>Traffic by source</CardTitle>
              <CardSub>{RANGES.find((r) => r.id === range)?.label}</CardSub>
            </div>
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
                  note: `${s.share}% of total traffic`
                }))}
              />
            )}
          </CardBody>
        </Card>

        {/* Sources DataTable */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>Top referring channels</CardTitle>
              <CardSub>Domains, search engines, and direct hits</CardSub>
            </div>
          </CardHead>
          <CardBody className="p-0">
            <DataTable
              id="sources-table"
              columns={columns}
              rows={data?.sources || []}
              loading={loading}
              searchPlaceholder="Search sources…"
              searchKeys={['name', 'key']}
              pageSize={8}
              defaultSort="visitors"
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
