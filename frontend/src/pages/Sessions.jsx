import { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { PageHead, PageToolbar } from '../components/ui/Page';
import { Card, CardHead, CardTitle, CardSub, CardBody } from '../components/ui/Card';
import { Timeline } from '../components/ui/Blocks';
import DataTable from '../components/ui/DataTable';
import { Sheet } from '../components/ui/Overlay';
import { BlockSkeleton } from '../components/ui/State';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { fetchAnalyticsData } from '../lib/dataService';
import { toCsv, downloadFile } from '../lib/format';

const COUNTRIES = [
  'all',
  'United States',
  'India',
  'United Kingdom',
  'Germany',
  'Canada',
  'France',
  'Australia',
  'Brazil',
  'Japan',
  'Netherlands'
];
const DEVICES = ['all', 'Desktop', 'Mobile', 'Tablet'];
const BROWSERS = ['all', 'Chrome', 'Safari', 'Edge', 'Firefox'];
const DURATIONS = ['all', '<1m', '1-3m', '3m+'];

export default function Sessions() {
  const { selectedProjectId } = useProject();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  // Filters
  const [countryFilter, setCountryFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [browserFilter, setBrowserFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');

  const loadData = useCallback(async (showSpin = true) => {
    if (showSpin) setLoading(true);
    try {
      const res = await fetchAnalyticsData({ projectId: selectedProjectId, range: '24h' });
      setData(res);
    } catch {
      showToast('Failed to load sessions', 'error');
    } finally {
      if (showSpin) setLoading(false);
    }
  }, [selectedProjectId, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const clearFilters = () => {
    setCountryFilter('all');
    setDeviceFilter('all');
    setBrowserFilter('all');
    setDurationFilter('all');
  };

  const filteredSessions = useMemo(() => {
    let list = data?.sessionsList || [];
    if (countryFilter !== 'all') {
      list = list.filter((s) => s.country === countryFilter);
    }
    if (deviceFilter !== 'all') {
      list = list.filter((s) => s.device === deviceFilter);
    }
    if (browserFilter !== 'all') {
      list = list.filter((s) => s.browser === browserFilter);
    }
    if (durationFilter !== 'all') {
      if (durationFilter === '<1m') list = list.filter((s) => s.duration < 60);
      else if (durationFilter === '1-3m') list = list.filter((s) => s.duration >= 60 && s.duration <= 180);
      else if (durationFilter === '3m+') list = list.filter((s) => s.duration > 180);
    }
    return list;
  }, [data, countryFilter, deviceFilter, browserFilter, durationFilter]);

  const handleExport = () => {
    if (!filteredSessions.length) {
      showToast('No sessions to export');
      return;
    }
    const csv = toCsv(
      filteredSessions.map((s) => ({
        SessionID: s.id,
        Country: s.country,
        CurrentPage: s.currentPage,
        Device: s.device,
        Browser: s.browser,
        Pages: s.pages,
        Duration: s.durationLabel,
        Events: s.events,
        Started: s.startedLabel
      }))
    );
    downloadFile('sessions.csv', csv, 'text/csv');
    showToast('Export complete', 'Sessions report downloaded');
  };

  const columns = useMemo(
    () => [
      {
        key: 'id',
        label: 'Session',
        render: (r) => (
          <div className="flex flex-col">
            <span className="font-mono font-semibold text-foreground text-xs">{r.id}</span>
            <span className="text-xs text-muted-foreground">Started {r.startedLabel}</span>
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
        key: 'currentPage',
        label: 'Current page',
        render: (r) => <span className="font-mono text-xs">{r.currentPage}</span>
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
        key: 'pages',
        label: 'Pages',
        align: 'right',
        render: (r) => <span className="font-mono">{r.pages}</span>
      },
      {
        key: 'duration',
        label: 'Duration',
        align: 'right',
        render: (r) => <span className="font-mono">{r.durationLabel}</span>
      },
      {
        key: 'events',
        label: 'Events',
        align: 'right',
        render: (r) => <span className="font-mono">{r.events}</span>
      },
      {
        key: 'started',
        label: 'Started',
        align: 'right',
        render: (r) => <span className="text-muted-foreground text-xs">{r.startedLabel}</span>
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
            onClick={() => setActiveSession(r)}
          >
            Replay
          </button>
        )
      }
    ],
    []
  );

  return (
    <div className="page animate-fade-in">
      <PageHead
        title="Sessions"
        desc="Inspect individual sessions and what happened in them."
        actions={
          <Button variant="outline" icon="download" onClick={handleExport}>
            Export
          </Button>
        }
      />

      <PageToolbar>
        <select
          className="select w-auto"
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          aria-label="Country filter"
        >
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? 'All countries' : c}
            </option>
          ))}
        </select>

        <select
          className="select w-auto"
          value={deviceFilter}
          onChange={(e) => setDeviceFilter(e.target.value)}
          aria-label="Device filter"
        >
          {DEVICES.map((d) => (
            <option key={d} value={d}>
              {d === 'all' ? 'All devices' : d}
            </option>
          ))}
        </select>

        <select
          className="select w-auto"
          value={browserFilter}
          onChange={(e) => setBrowserFilter(e.target.value)}
          aria-label="Browser filter"
        >
          {BROWSERS.map((b) => (
            <option key={b} value={b}>
              {b === 'all' ? 'All browsers' : b}
            </option>
          ))}
        </select>

        <select
          className="select w-auto"
          value={durationFilter}
          onChange={(e) => setDurationFilter(e.target.value)}
          aria-label="Duration filter"
        >
          {DURATIONS.map((dur) => (
            <option key={dur} value={dur}>
              {dur === 'all' ? 'All durations' : dur}
            </option>
          ))}
        </select>

        <span className="spacer" />

        <button type="button" className="btn btn--ghost btn--sm" onClick={clearFilters}>
          <Icon name="close" size={13} />
          Clear
        </button>
      </PageToolbar>

      <div className="mt-4">
        <Card>
          <CardHead>
            <div>
              <CardTitle>Session recordings</CardTitle>
              <CardSub>
                Showing {filteredSessions.length} active and completed sessions
              </CardSub>
            </div>
          </CardHead>
          <CardBody className="p-0">
            <DataTable
              id="sessions-table"
              columns={columns}
              rows={filteredSessions}
              loading={loading}
              searchPlaceholder="Search session ID, country, path…"
              searchKeys={['id', 'country', 'currentPage', 'device', 'browser']}
              pageSize={8}
              defaultSort="started"
            />
          </CardBody>
        </Card>
      </div>

      {/* Session Replay / Detail Sheet */}
      <Sheet
        open={Boolean(activeSession)}
        onClose={() => setActiveSession(null)}
        title={activeSession ? `Session ${activeSession.id}` : 'Session detail'}
        description={
          activeSession
            ? `${activeSession.startedLabel} · ${activeSession.durationLabel} · ${activeSession.pages} pages`
            : ''
        }
        footer={
          <div className="flex w-full items-center justify-between">
            <button type="button" className="btn btn--ghost" onClick={() => setActiveSession(null)}>
              Close
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => showToast('Session export started')}
            >
              <Icon name="download" size={15} />
              Export session
            </button>
          </div>
        }
      >
        {activeSession && (
          <div className="space-y-6">
            <div className="dl">
              <div className="dl-item">
                <span className="dl-label">Country</span>
                <span className="dl-value">
                  {activeSession.flag} {activeSession.country}
                </span>
              </div>
              <div className="dl-item">
                <span className="dl-label">Current page</span>
                <span className="dl-value font-mono">{activeSession.currentPage}</span>
              </div>
              <div className="dl-item">
                <span className="dl-label">Device</span>
                <span className="dl-value">
                  {activeSession.device} · {activeSession.os}
                </span>
              </div>
              <div className="dl-item">
                <span className="dl-label">Browser</span>
                <span className="dl-value">{activeSession.browser}</span>
              </div>
              <div className="dl-item">
                <span className="dl-label">Events</span>
                <span className="dl-value font-mono">{activeSession.events}</span>
              </div>
              <div className="dl-item">
                <span className="dl-label">Started</span>
                <span className="dl-value">{activeSession.startedLabel}</span>
              </div>
            </div>

            <div>
              <p className="eyebrow mb-3">Session timeline</p>
              <Timeline items={activeSession.timeline || []} />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
