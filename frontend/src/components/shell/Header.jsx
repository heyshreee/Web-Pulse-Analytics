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

export default function Header({
  isMobile,
  onToggleNav,
  onOpenCommand,
  onOpenNotifications,
  unreadNotificationsCount = 3,
  user,
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
    crumbs.push({ label: tab.charAt(0).toUpperCase() + tab.slice(1) });
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

        <Link to="/docs" className="icon-btn" aria-label="Help and documentation">
          <Icon name="help" size={17} />
        </Link>

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
          <MenuLabel>{user?.email || 'Account'}</MenuLabel>
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
              navigate('/docs');
            }}
          >
            Help & docs
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
