import { NavLink, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';

const MOBILE_NAV = [
  { route: '/dashboard', label: 'Dashboard', icon: 'dashboard', end: true },
  { route: '/dashboard/live', label: 'Live', icon: 'radio' },
  { route: '/dashboard/pages', label: 'Pages', icon: 'file' },
  { route: '/dashboard/projects', label: 'Projects', icon: 'folder' },
  { route: '/docs', label: 'Docs', icon: 'book' }
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="mobile-nav" id="mobile-nav" aria-label="Primary Mobile Navigation">
      {MOBILE_NAV.map((item) => {
        const isActive = item.end
          ? location.pathname === item.route
          : location.pathname.startsWith(item.route);

        return (
          <NavLink
            key={item.route}
            to={item.route}
            className={`mobile-nav-item ${isActive ? 'is-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
