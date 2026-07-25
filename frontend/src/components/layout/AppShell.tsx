import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Focus,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useFocusMode } from '../../context/FocusModeContext';
import { GlobalSearch } from '../GlobalSearch';
import { NotificationBell } from '../NotificationBell';
import { greetingForHour } from '../../utils/taskQueries';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/statistics', label: 'Statistics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
] as const;

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/tasks': 'Tasks',
  '/projects': 'Projects',
  '/calendar': 'Calendar',
  '/statistics': 'Statistics',
  '/settings': 'Settings',
  '/categories': 'Categories',
};

function userInitial(username?: string) {
  if (!username?.trim()) return '?';
  return username.trim().charAt(0).toUpperCase();
}

type SidebarProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
};

const Sidebar = ({ collapsed, onNavigate, onClose }: SidebarProps) => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <div className="flex h-full flex-col">
      <div
        className={`flex items-center justify-between gap-2 py-6 ${
          collapsed ? 'px-3' : 'px-5'
        }`}
      >
        <div
          className={`flex min-w-0 items-center ${
            collapsed ? 'justify-center' : 'gap-3'
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-950">
            <CheckSquare className="h-5 w-5" strokeWidth={2.25} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-tight text-white">
                TaskManager
              </p>
              <p className="truncate text-xs text-zinc-400">Keep it simple.</p>
            </div>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className={`flex-1 space-y-1 ${collapsed ? 'px-2' : 'px-3'}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              title={item.label}
              className={`flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors ${
                collapsed ? 'justify-center px-2' : 'gap-3 px-3'
              } ${
                active
                  ? 'bg-white/15 text-white'
                  : 'text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className={`space-y-1 border-t border-white/10 ${collapsed ? 'p-2' : 'p-3'}`}>
        <button
          type="button"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          onClick={toggleTheme}
          className={`flex w-full items-center rounded-lg py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-white ${
            collapsed ? 'justify-center px-2' : 'justify-between gap-3 px-3'
          }`}
        >
          <span className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            ) : (
              <Moon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            )}
            {!collapsed && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
          </span>
          {!collapsed && (
            <span
              className={`relative h-5 w-9 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-white' : 'bg-zinc-600'
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${
                  theme === 'dark'
                    ? 'left-4 bg-zinc-900'
                    : 'left-0.5 bg-white'
                }`}
              />
            </span>
          )}
        </button>
        <button
          type="button"
          title="Logout"
          onClick={() => {
            onNavigate?.();
            logout();
          }}
          className={`flex w-full items-center rounded-lg py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-white ${
            collapsed ? 'justify-center px-2' : 'gap-3 px-3'
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </div>
  );
};

export const AppShell = () => {
  const { user } = useAuth();
  const { focusMode, toggleFocusMode } = useFocusMode();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);
  const sidebarW = focusMode ? 'lg:w-20' : 'lg:w-64';
  const contentPl = focusMode ? 'lg:pl-20' : 'lg:pl-64';
  const showDashboardGreeting = location.pathname === '/dashboard' && !focusMode;
  const pageTitle = pageTitles[location.pathname] ?? 'TaskManager';

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden bg-zinc-950 transition-[width] duration-200 ${sidebarW} lg:block`}
      >
        <Sidebar collapsed={focusMode} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50"
            onClick={closeMobile}
          />
          <aside className="absolute inset-y-0 left-0 w-64 max-w-[85vw] bg-zinc-950 shadow-xl">
            <Sidebar onNavigate={closeMobile} onClose={closeMobile} />
          </aside>
        </div>
      )}

      <div className={`transition-[padding] duration-200 ${contentPl}`}>
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90">
          <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {showDashboardGreeting ? (
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-xl">
                  {greetingForHour()}, {user?.username}
                </h1>
              </div>
            ) : (
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {pageTitle}
                </h1>
              </div>
            )}

            {!focusMode && (
              <div className="hidden flex-1 justify-center md:flex">
                <GlobalSearch />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <div className="md:hidden">
                <GlobalSearch />
              </div>
              <button
                type="button"
                onClick={toggleFocusMode}
                className={`rounded-lg p-2 transition-colors ${
                  focusMode
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
                aria-pressed={focusMode}
                title="Focus mode"
              >
                <Focus className="h-5 w-5" />
              </button>
              <NotificationBell />
              <Link
                to="/settings"
                className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {userInitial(user?.username)}
                </div>
                {!focusMode && (
                  <div className="hidden min-w-0 sm:block">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {user?.username}
                    </p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {user?.email}
                    </p>
                  </div>
                )}
              </Link>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
