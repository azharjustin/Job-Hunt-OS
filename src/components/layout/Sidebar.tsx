import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Columns3, Calendar, Building2,
  FileText, BookOpen, BarChart3, Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/applications', label: 'Applications', icon: Briefcase },
  { path: '/kanban', label: 'Kanban', icon: Columns3 },
  { path: '/interviews', label: 'Interviews', icon: Calendar },
  { path: '/companies', label: 'Companies', icon: Building2 },
  { path: '/resumes', label: 'Resumes', icon: FileText },
  { path: '/prep', label: 'Interview Prep', icon: BookOpen },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className={cn(
      'flex flex-col h-full bg-slate-950/80 border-r border-slate-800/60 backdrop-blur-xl',
      'transition-all duration-300',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo Header */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-4 border-b border-slate-800/60 overflow-hidden min-h-[72px]',
        collapsed ? 'justify-center px-2' : 'justify-start'
      )}>
        <NavLink to="/" className="flex items-center gap-3 group shrink-0">
          <img
            src="/logo-icon.png"
            alt="Job Hunt OS Icon"
            className={cn(
              'object-contain transition-transform group-hover:scale-105 shrink-0',
              collapsed ? 'w-9 h-9' : 'w-10 h-10'
            )}
          />
          {!collapsed && (
            <div className="flex flex-col">
              <div className="text-xl font-extrabold tracking-tight leading-none flex items-center">
                <span className="sidebar-brand-title font-black">JobHunt</span>
                <span className="sidebar-brand-os font-black ml-0.5">
                  OS
                </span>
              </div>
              <span className="sidebar-brand-tagline text-[8.5px] font-bold tracking-widest uppercase mt-1">
                PLAN • TRACK • LAND
              </span>
            </div>
          )}
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
        {NAV.map(({ path, label, icon: Icon }) => {
          const active = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <NavLink
              key={path}
              to={path}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                'transition-all duration-150 group relative',
                active
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent',
                collapsed && 'justify-center px-2'
              )}
            >
              <Icon size={18} className={cn('shrink-0', active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300')} />
              {!collapsed && label}
              {active && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-slate-800/60">
        <NavLink
          to="/settings"
          title={collapsed ? 'Settings' : undefined}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
            'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent',
            'transition-all duration-150',
            collapsed && 'justify-center px-2'
          )}
        >
          <Settings size={18} className="shrink-0 text-slate-500" />
          {!collapsed && 'Settings'}
        </NavLink>
      </div>
    </aside>
  );
}
