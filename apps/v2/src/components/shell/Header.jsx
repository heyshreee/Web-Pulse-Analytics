import { useState, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import { Popover, MenuItem, MenuLabel, MenuSep } from '../ui/Overlay';
import { useTheme } from '../../context/ThemeContext';

const ROUTE_NAMES = {
  '/dashboard': 'Dashboard',
  '/dashboard/visitors': 'Visitors',
  '/dashboard/sessions': 'Sessions',
  '/dashboard/pages': 'Pages',
  '/dashboard/events': 'Events',
  '/dashboard/sources': 'Sources',
  '/dashboard/geography': 'Geography',
  '/dashboard/live': 'Live Activity',
  '/dashboard/alerts': 'Alerts',
  '/dashboard/projects': 'Projects',
  '/dashboard/api-key': 'API Keys',
  '/dashboard/api-keys': 'API Keys',
  '/dashboard/billing': 'Billing',
  '/dashboard/settings': 'Settings',
  '/dashboard/activity': 'Activity Log',
  '/dashboard/integrations': 'Integrations',
  '/integrations': 'Integrations',
  '/docs': 'Documentation'
};

const SETTINGS_SECTION_NAMES = {
  general: 'General',
  tracking: 'Tracking & Installation',
  team: 'Team & Permissions',
  privacy: 'Data & Privacy',
  alerts: 'Alerts & Notifications',
  integrations: 'Integrations & API',
  account: 'Account & Security',
  danger: 'Danger Zone'
};

export default function Header({
  isMobile,
  onToggleNav,
  onOpenCommand,
  onOpenNotifications,
  unreadNotificationsCount = 3,
  user,
  plan = 'free',
  onLogout
}) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const avatarRef = useRef(null);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent || '');

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'WP';

  // Build hierarchical breadcrumbs
  const path = location.pathname;
  const crumbs = [];

  if (path.startsWith('/dashboard/events/') && path.length > '/dashboard/events/'.length) {
    const eventName = decodeURIComponent(path.replace('/dashboard/events/', ''));
    crumbs.push({ label: 'Events', to: '/dashboard/events' });
    crumbs.push({ label: eventName });
  } else if (path.startsWith('/dashboard/projects/') && path.length > '/dashboard/projects/'.length) {
    const segs = path.replace('/dashboard/projects/', '').split('/');
    const projName = decodeURIComponent(segs[0]);
    crumbs.push({ label: 'Projects', to: '/dashboard/projects' });
    crumbs.push({ label: projName });
    if (segs[1]) {
      crumbs.push({ label: segs[1].charAt(0).toUpperCase() + segs[1].slice(1) });
    }
  } else if (path.startsWith('/dashboard/settings/') && path.length > '/dashboard/settings/'.length) {
    const tab = path.replace('/dashboard/settings/', '');
    crumbs.push({ label: 'Settings', to: '/dashboard/settings' });
    crumbs.push({ label: SETTINGS_SECTION_NAMES[tab] || tab.charAt(0).toUpperCase() + tab.slice(1) });
  } else {
    crumbs.push({ label: ROUTE_NAMES[path] || 'Dashboard' });
  }

  return (
    <header className="app-header" id="app-header">
      <button
        type="button"
        className="icon-btn"
        onClick={onToggleNav}
        aria-label={isMobile ? 'Open navigation' : 'Toggle sidebar'}
      >
        <Icon name={isMobile ? 'menu' : 'panelLeft'} size={17} />
      </button>

      <div className="header-title">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          {crumbs.map((crumb, idx) => {
            const isLast = idx === crumbs.length - 1;
            return (
              <span key={crumb.label + idx} className="inline-flex items-center">
                {idx > 0 ? (
                  <span className="breadcrumb-sep">
                    <Icon name="chevronRight" size={13} />
                  </span>
                ) : null}
                {isLast || !crumb.to ? (
                  <span className="breadcrumb-item font-semibold text-foreground">{crumb.label}</span>
                ) : (
                  <Link to={crumb.to} className="breadcrumb-item breadcrumb-link">
                    {crumb.label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      </div>

      <div className="header-actions">
        <button
          type="button"
          className="header-search"
          onClick={onOpenCommand}
          aria-label="Search (Command K)"
        >
          <Icon name="search" size={15} />
          <span className="header-search-text">Search…</span>
          <span className="kbd">{isMac ? '⌘' : 'Ctrl'} K</span>
        </button>

        <a
          href={`${(import.meta.env.VITE_MARKETING_URL || 'http://localhost:5174').replace(/\/+$/, '')}/docs`}
          target="_blank"
          rel="noopener noreferrer"
          className="icon-btn"
          aria-label="Help and documentation"
        >
          <Icon name="help" size={17} />
        </a>

        <button
          type="button"
          className="icon-btn relative"
          onClick={onOpenNotifications}
          aria-label="Notifications"
          aria-haspopup="dialog"
        >
          <Icon name="bell" size={17} />
          {unreadNotificationsCount > 0 ? (
            <span className="dot-badge" aria-label={`${unreadNotificationsCount} unread`}>
              {unreadNotificationsCount}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          className="icon-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
        </button>

        <Link
          to="/dashboard/billing"
          className={`badge ${
            ['pro', 'business', 'enterprise'].includes((plan || user?.plan || '').toLowerCase())
              ? 'badge--success'
              : 'badge--outline'
          } uppercase font-mono tracking-wider cursor-pointer hover:opacity-80 transition-opacity select-none hidden xs:inline-flex`}
          title="Subscription plan — click to manage in Billing"
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: ['pro', 'business', 'enterprise'].includes((plan || user?.plan || '').toLowerCase())
                ? 'var(--success)'
                : 'var(--muted-foreground)'
            }}
          />
          <span>{((plan || user?.plan || 'free')).toUpperCase()}</span>
        </Link>

        <button
          ref={avatarRef}
          type="button"
          className="avatar cursor-pointer"
          aria-haspopup="menu"
          aria-expanded={userMenuOpen}
          aria-label="Account menu"
          onClick={() => setUserMenuOpen((v) => !v)}
        >
          {initials}
        </button>

        <Popover
          open={userMenuOpen}
          onClose={() => setUserMenuOpen(false)}
          anchorRef={avatarRef}
          align="right"
          className="w-56"
        >
          <div className="px-3 py-2 border-b border-[var(--border)]">
            <p className="text-xs font-semibold text-foreground truncate">{user?.name || 'Account'}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email || ''}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span
                className={`badge ${
                  ['pro', 'business', 'enterprise'].includes((plan || user?.plan || '').toLowerCase())
                    ? 'badge--success'
                    : 'badge--outline'
                } text-[10px] px-1.5 uppercase font-mono font-semibold`}
              >
                {(plan || user?.plan || 'free').toUpperCase()} PLAN
              </span>
            </div>
          </div>
          <MenuItem
            icon="user"
            onClick={() => {
              setUserMenuOpen(false);
              navigate('/dashboard/settings');
            }}
          >
            Account settings
          </MenuItem>
          <MenuItem
            icon="card"
            onClick={() => {
              setUserMenuOpen(false);
              navigate('/dashboard/billing');
            }}
          >
            Billing
          </MenuItem>
          <MenuItem
            icon="book"
            onClick={() => {
              setUserMenuOpen(false);
              const isProdDomain = typeof window !== 'undefined' &&
                (window.location.hostname === 'webpulseanalytics.tech' || window.location.hostname.endsWith('.webpulseanalytics.tech'));
              const defaultMkt = isProdDomain ? 'https://webpulseanalytics.tech' : 'http://localhost:5174';
              const mktDocs = `${(import.meta.env.VITE_MARKETING_URL || defaultMkt).replace(/\/+$/, '')}/docs`;
              window.open(mktDocs, '_blank', 'noopener,noreferrer');
            }}
          >
            Help & docs
          </MenuItem>
          <MenuItem
            icon="external"
            onClick={() => {
              setUserMenuOpen(false);
              const isProdDomain = typeof window !== 'undefined' &&
                (window.location.hostname === 'webpulseanalytics.tech' || window.location.hostname.endsWith('.webpulseanalytics.tech'));
              const defaultV1 = isProdDomain ? 'https://app.webpulseanalytics.tech' : 'http://localhost:5173';
              const v1Url = import.meta.env.VITE_V1_APP_URL || defaultV1;
              window.location.assign(v1Url);
            }}
          >
            Switch to Stable V1
          </MenuItem>
          <MenuSep />
          <MenuItem
            icon={theme === 'dark' ? 'sun' : 'moon'}
            onClick={() => {
              toggleTheme();
              setUserMenuOpen(false);
            }}
          >
            {theme === 'dark' ? 'Light appearance' : 'Dark appearance'}
          </MenuItem>
          <MenuItem
            icon="logout"
            danger
            onClick={() => {
              setUserMenuOpen(false);
              onLogout?.();
            }}
          >
            Sign out
          </MenuItem>
        </Popover>
      </div>
    </header>
  );
}
