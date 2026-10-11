import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import { PageHead } from '../components/ui/Page';
import { Badge } from '../components/ui/Display';
import { useToast } from '../context/ToastContext';

const INITIAL_INTEGRATIONS = [
  {
    id: 'next',
    name: 'Next.js',
    initials: 'N',
    desc: 'Send route changes and server events from a Next.js application.',
    connected: true
  },
  {
    id: 'vercel',
    name: 'Vercel',
    initials: '▲',
    desc: 'Zero-config deployment events and live traffic from a Vercel project.',
    connected: true
  },
  {
    id: 'gtm',
    name: 'Google Tag Manager',
    initials: 'G',
    desc: 'Mirror WebPulse events into an existing GTM container.',
    connected: false
  },
  {
    id: 'slack',
    name: 'Slack',
    initials: 'S',
    desc: 'Post traffic spikes and alert thresholds to a channel.',
    connected: false
  },
  {
    id: 'webflow',
    name: 'Webflow',
    initials: 'W',
    desc: 'Track published site traffic with a custom snippet.',
    connected: false
  },
  {
    id: 'docs',
    name: 'Documentation',
    initials: '?',
    desc: 'Read the tracking guide, API reference, and SDK options.',
    connected: false,
    route: '/docs'
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
        desc="Connect WebPulse to the tools you already use."
      />

      <div className="integration-grid">
        {items.map((it) => (
          <section key={it.id} className="card integration-card">
            <div className="integration-head">
              <span className="integration-mark" aria-hidden="true">
                {it.initials}
              </span>
              <div className="card-head-text">
                <h2 className="card-title" style={{ fontSize: 'var(--text-md)' }}>
                  {it.name}
                </h2>
                {it.connected ? (
                  <Badge variant="success">
                    <span className="inline-flex items-center gap-1">
                      <Icon name="checkCircle" size={11} />
                      Connected
                    </span>
                  </Badge>
                ) : null}
              </div>
            </div>

            <p className="integration-desc">{it.desc}</p>

            <div className="row-2">
              {it.route ? (
                <Link to={it.route} className="btn btn--outline btn--sm">
                  Open
                  <Icon name="chevronRight" size={14} />
                </Link>
              ) : it.connected ? (
                <>
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={() => showToast(`Configuring ${it.name}`, 'Project settings updated.')}
                  >
                    Configure
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
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