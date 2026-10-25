import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { PageHead } from '../components/ui/Page';
import { Card, CardHead, CardTitle, CardSub, CardBody } from '../components/ui/Card';
import { KpiGrid } from '../components/ui/Blocks';
import { TrafficChart } from '../components/ui/Charts';
import { useToast } from '../context/ToastContext';
import { toCsv, downloadFile } from '../lib/format';

export default function EventDetail() {
  const { name } = useParams();
  const eventName = decodeURIComponent(name || 'page_view');
  const { showToast } = useToast();

  const kpis = useMemo(
    () => [
      { key: 'occ', label: 'Occurrences', value: 8420, delta: 12.4, format: 'int', icon: 'zap' },
      { key: 'vis', label: 'Unique visitors', value: 5210, delta: 8.1, format: 'int', icon: 'users' },
      { key: 'per', label: 'Per visitor', value: '1.62', delta: 3.6, format: 'int', icon: 'activity' },
      { key: 'conv', label: 'Conversion', value: 18.2, delta: -1.2, format: 'pct', icon: 'percent' }
    ],
    []
  );

  const series = useMemo(
    () => [
      { name: 'Day 1', views: 420 },
      { name: 'Day 2', views: 510 },
      { name: 'Day 3', views: 480 },
      { name: 'Day 4', views: 630 },
      { name: 'Day 5', views: 590 },
      { name: 'Day 6', views: 720 },
      { name: 'Day 7', views: 810 },
      { name: 'Day 8', views: 780 },
      { name: 'Day 9', views: 850 },
      { name: 'Day 10', views: 920 },
      { name: 'Day 11', views: 890 },
      { name: 'Day 12', views: 940 },
      { name: 'Day 13', views: 1020 },
      { name: 'Day 14', views: 1140 }
    ],
    []
  );

  const properties = useMemo(
    () => [
      { k: 'path', v: '/pricing', pct: 88 },
      { k: 'plan', v: 'pro', pct: 77 },
      { k: 'source', v: 'hero_cta', pct: 66 },
      { k: 'currency', v: 'USD', pct: 55 },
      { k: 'value', v: '49.00', pct: 44 }
    ],
    []
  );

  const handleExport = () => {
    const csv = toCsv(
      properties.map((p) => ({
        Event: eventName,
        Property: p.k,
        Value: p.v,
        Distribution: `${p.pct}%`
      }))
    );
    downloadFile(`event-${eventName}.csv`, csv, 'text/csv');
    showToast('Export complete', 'Event detail downloaded');
  };

  return (
    <div className="page animate-fade-in">
      <div className="mb-2">
        <Link to="/dashboard/events" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <Icon name="chevronLeft" size={13} />
          Back to all events
        </Link>
      </div>

      <PageHead
        title="Event detail"
        desc="Occurrences, properties, and conversion for this event."
        actions={
          <Button variant="outline" icon="download" onClick={handleExport}>
            Export occurrences
          </Button>
        }
      />

      <KpiGrid items={kpis} />

      <div className="space-y-4 mt-4">
        {/* Occurrences over time chart */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>Occurrences of {eventName}</CardTitle>
              <CardSub>Last 14 days activity</CardSub>
            </div>
          </CardHead>
          <CardBody>
            <TrafficChart data={series} dataKey="views" height={240} seriesLabel="Occurrences" />
          </CardBody>
        </Card>

        {/* Properties table */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>Event properties</CardTitle>
              <CardSub>Payload attributes and distributions</CardSub>
            </div>
          </CardHead>
          <CardBody className="p-0">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="sortable"><span className="th-inner">Property</span></th>
                    <th className="num"><span className="th-inner">Value</span></th>
                    <th className="num"><span className="th-inner">Last 14 days</span></th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((p) => (
                    <tr key={p.k}>
                      <td className="font-mono font-semibold text-foreground text-xs">{p.k}</td>
                      <td className="font-mono text-xs">{p.v}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="progress flex-1">
                            <div className="progress-bar progress-bar--info" style={{ width: `${p.pct}%` }} />
                          </div>
                          <span className="font-mono text-xs text-muted-foreground">{p.pct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
