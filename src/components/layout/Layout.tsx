import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { GlobalSearch } from './GlobalSearch';
import { QuickAdd } from './QuickAdd';
import { useSettingsStore } from '../../stores/settingsStore';
import { useApplicationStore } from '../../stores/applicationStore';
import { useCompanyStore } from '../../stores/companyStore';
import { useInterviewStore } from '../../stores/interviewStore';
import { useResumeStore } from '../../stores/resumeStore';
import { useFollowUpStore } from '../../stores/followUpStore';
import { useQuestionStore } from '../../stores/questionStore';
import { useAuthStore } from '../../stores/authStore';
import { Login } from '../../pages/Login';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Load all stores
  const loadSettings = useSettingsStore((s) => s.load);
  const loadApps = useApplicationStore((s) => s.load);
  const loadCompanies = useCompanyStore((s) => s.load);
  const loadInterviews = useInterviewStore((s) => s.load);
  const loadResumes = useResumeStore((s) => s.load);
  const loadFollowUps = useFollowUpStore((s) => s.load);
  const loadQuestions = useQuestionStore((s) => s.load);
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();
  const { settings, setTheme } = useSettingsStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.allSettled([
        loadSettings(),
        loadApps(),
        loadCompanies(),
        loadInterviews(),
        loadResumes(),
        loadFollowUps(),
        loadQuestions(),
      ]);
    }
  }, [isAuthenticated, loadSettings, loadApps, loadCompanies, loadInterviews, loadResumes, loadFollowUps, loadQuestions]);

  // Apply theme
  useEffect(() => {
    setTheme(settings.theme);
  }, [settings.theme]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, []);

  // 1. Initial Authentication Check Loader
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">Loading Job Hunt OS...</p>
      </div>
    );
  }

  // 2. Auth Gate: Show Sign In page if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // 3. Render Main Application Interior
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100">
      {/* Sidebar – desktop */}
      <div className="hidden lg:flex shrink-0 relative">
        <Sidebar collapsed={sidebarCollapsed} />
        {/* Toggle Button Anchored directly to Sidebar Edge */}
        <button
          onClick={() => setSidebarCollapsed((c) => !c)}
          className={cn(
            "absolute -right-4.5 top-1/2 -translate-y-1/2 z-30 flex w-5 h-9 items-center justify-center rounded-r-md border shadow-sm transition-all cursor-pointer",
            "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative z-50 flex h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          onMenuToggle={() => setMobileMenuOpen((o) => !o)}
          onQuickAdd={() => setQuickAddOpen(true)}
          onSearch={() => setSearchOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global overlays */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <QuickAdd open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  );
}
