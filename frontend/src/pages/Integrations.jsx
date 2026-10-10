import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import { PageHead } from '../components/ui/Page';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Display';
import { useToast } from '../context/ToastContext';

const INITIAL_INTEGRATIONS = [
  {
    id: 'vercel',
    name: 'Vercel',
    initials: 'VC',
    desc: 'Automatically inject tracking snippets and sync deployment environments.',
    connected: true,
    route: '/dashboard/settings'
  },
  {
    id: 'gtm',
    name: 'Google Tag Manager',
    initials: 'GM',
    desc: 'Deploy WebPulse tags and custom event triggers through your GTM container.',
    connected: false
  },
  {
    id: 'slack',
    name: 'Slack Alerts',
    initials: 'SL',
    desc: 'Receive real-time spike notifications and daily digests in your team channels.',
    connected: true
  },
  {
    id: 'webhooks',
    name: 'Custom Webhooks',
    initials: 'WH',
    desc: 'Stream raw event payloads directly into your data warehouse or serverless functions.',
    connected: false
  },
  {
    id: 'segment',
    name: 'Segment',
    initials: 'SG',
    desc: 'Forward Customer Data Platform (CDP) identities and events into WebPulse.',
    connected: false
  },
  {
    id: 'zapier',
    name: 'Zapier',
    initials: 'ZP',
    desc: 'Trigger automations across 5,000+ apps when traffic anomalies occur.',
    connected: false
  }
];

export default function Integrations() {
  const [items, setItems] = useState(INITIAL_INTEGRATIONS);
  const { showToast } = useToast();

  const handleToggleConnect = (item) => {
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, connected: !it.connected } : it))
    );
    showToast(
      item.connected ? `Disconnected ${item.name}` : `Connected ${item.name}`,
      item.connected ? 'Integration disabled.' : 'Integration is now active.'
    );
  };

  return (
    <div className="page animate-fade-in">
      <PageHead
        title="Integrations"
        desc="Connect WebPulse to the tools and platforms you already use."
      />

      <div className="integration-grid mt-6">
        {items.map((it) => (
          <section key={it.id} className="card integration-card flex flex-col justify-between">
            <div>
              <div className="integration-head">
                <span className="integration-mark" aria-hidden="true">
                  {it.initials}
                </span>
                <div className="card-head-text flex-1">
                  <h2 className="card-title text-base font-semibold">{it.name}</h2>
                  {it.connected ? (
                    <Badge variant="success" className="mt-1">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="checkCircle" size={11} />
                        Connected
                      </span>
                    </Badge>
                  ) : null}
                </div>
              </div>

              <p className="integration-desc text-xs text-muted-foreground mt-3">{it.desc}</p>
            </div>

            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border">
              {it.route ? (
                <Link to={it.route} className="btn btn--outline btn--sm">
                  Configure
                  <Icon name="chevronRight" size={14} />
                </Link>
              ) : it.connected ? (
                <>
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={() => showToast(`Configuring ${it.name}`)}
                  >
                    Configure
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm text-destructive hover:bg-destructive/10"
                    onClick={() => handleToggleConnect(it)}
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn--sm"
                  onClick={() => handleToggleConnect(it)}
                >
                  Connect
                </button>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}