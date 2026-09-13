import { Bell, Plus, Search, Menu, Sun, Moon, Command, UserCheck, LogIn, LogOut, CheckCircle2, Calendar, Clock, ExternalLink, X, Check } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useFollowUpStore } from '../../stores/followUpStore';
import { useInterviewStore } from '../../stores/interviewStore';
import { useApplicationStore } from '../../stores/applicationStore';
import { useCompanyStore } from '../../stores/companyStore';
import { useAuthStore } from '../../stores/authStore';
import { useCallback, useState, useMemo } from 'react';
import { Button } from '../ui/Button';
import { AuthModal } from '../auth/AuthModal';
import { formatDate, formatDateTime, cn } from '../../lib/utils';

interface TopBarProps {
  onMenuToggle: () => void;
  onQuickAdd: () => void;
  onSearch: () => void;
}

export function TopBar({ onMenuToggle, onQuickAdd, onSearch }: TopBarProps) {
  const { settings, setTheme } = useSettingsStore();
  const followUps = useFollowUpStore((s) => s.followUps);
  const completeFollowUp = useFollowUpStore((s) => s.complete);
  const interviews = useInterviewStore((s) => s.interviews);
  const updateInterview = useInterviewStore((s) => s.update);
  const getApp = useApplicationStore((s) => s.getById);
  const getCompany = useCompanyStore((s) => s.getById);
  const { user, isAuthenticated, logout } = useAuthStore();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Uncompleted follow-ups & scheduled interviews
  const pendingFollowUps = useMemo(() => {
    return followUps.filter((f) => !f.completed);
  }, [followUps]);

  const pendingInterviews = useMemo(() => {
    return interviews.filter((i) => i.status === 'scheduled');
  }, [interviews]);

  const notifCount = pendingFollowUps.length + pendingInterviews.length;

  const toggleTheme = useCallback(() => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    const auth = useAuthStore.getState();
    if (auth.isAuthenticated) {
      auth.updateProfile({ theme: nextTheme });
    }
  }, [settings.theme, setTheme]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      {notifOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
      )}
      <header className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/60 backdrop-blur-xl shrink-0 relative z-30 transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors lg:hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu size={18} />
          </button>
          <div className="hidden sm:block">
            <span className="text-sm text-slate-500 dark:text-slate-400">{greeting}, </span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {isAuthenticated && user ? user.name : settings.userName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            onClick={onSearch}
            id="global-search-btn"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-sm cursor-pointer"
            aria-label="Global search"
          >
            <Search size={14} />
            <span className="hidden md:inline">Search...</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 font-mono font-semibold">
              <Command size={10} />K
            </kbd>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {settings.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Notifications Trigger & Popover Container */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              aria-label={`${notifCount} notifications`}
            >
              <Bell size={16} />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
            </button>

            {/* Notification Popover Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-fade-in">
                {/* Popover Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300">
                      {notifCount}
                    </span>
                  </div>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Popover Content List */}
                <div className="max-h-88 overflow-y-auto p-3 space-y-2">
                  {notifCount === 0 ? (
                    <div className="py-8 text-center">
                      <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2 opacity-80" />
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">All caught up!</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">No pending follow-ups or upcoming interviews.</p>
                    </div>
                  ) : (
                    <>
                      {/* Follow-ups Section */}
                      {pendingFollowUps.length > 0 && (
                        <div>
                          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Follow-ups ({pendingFollowUps.length})
                          </div>
                          <div className="space-y-1.5 mt-1">
                            {pendingFollowUps.map((fu) => {
                              const app = getApp(fu.applicationId);
                              const isOverdue = new Date(fu.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
                              return (
                                <div
                                  key={fu.id}
                                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-start gap-2.5 group"
                                >
                                  <button
                                    onClick={() => completeFollowUp(fu.id)}
                                    className="mt-0.5 p-1 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors shrink-0 cursor-pointer"
                                    title="Mark complete"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{fu.title}</p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{app?.jobTitle ?? 'General Task'}</p>
                                    <span className={cn(
                                      'inline-flex items-center gap-1 text-[10px] font-semibold mt-1',
                                      isOverdue ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
                                    )}>
                                      <Clock size={10} /> {isOverdue ? 'Overdue · ' : 'Due '}{formatDate(fu.dueDate)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Scheduled Interviews Section */}
                      {pendingInterviews.length > 0 && (
                        <div className={pendingFollowUps.length > 0 ? 'pt-2' : ''}>
                          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Upcoming Interviews ({pendingInterviews.length})
                          </div>
                          <div className="space-y-1.5 mt-1">
                            {pendingInterviews.map((i) => {
                              const app = getApp(i.applicationId);
                              const company = app ? getCompany(app.companyId) : null;
                              return (
                                <div
                                  key={i.id}
                                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all space-y-1.5"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 uppercase tracking-wide">
                                      {i.type}
                                    </span>
                                    <button
                                      onClick={() => updateInterview(i.id, { status: 'completed' })}
                                      className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                                    >
                                      Mark Completed
                                    </button>
                                  </div>
                                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{app?.jobTitle ?? 'Interview'} @ {company?.name ?? 'Company'}</p>
                                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1 font-medium"><Calendar size={11} /> {formatDateTime(i.dateTime)}</span>
                                    {i.meetingUrl && (
                                      <a
                                        href={i.meetingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
                                      >
                                        Join <ExternalLink size={10} />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Auth Button */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-medium">
                <UserCheck size={14} />
                <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
              </div>
              <button
                onClick={() => logout()}
                title="Sign Out"
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <LogIn size={14} />
              <span>Sign In / JWT</span>
            </button>
          )}

          {/* Quick Add */}
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={onQuickAdd} id="quick-add-btn">
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}

