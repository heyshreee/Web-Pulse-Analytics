import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, BarChart2 } from 'lucide-react';
import { removeToken } from '../utils/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3 group">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-600/20 group-hover:rotate-12 transition-transform duration-300">
              <BarChart2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">WebPulse Analytics</span>
          </div>

          <div className="flex items-center gap-4">
            {token ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Home
                </Link>
                <Link
                  to="/dashboard/projects"
                  className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Projects
                </Link>
                <Link
                  to="/dashboard/billing"
                  className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Billing
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors ml-4"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-400 hover:text-white transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
