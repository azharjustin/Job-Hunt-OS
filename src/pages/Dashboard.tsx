import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, TrendingUp, Calendar, Bell, AlertTriangle, CheckCircle2,
  ArrowRight, Target
} from 'lucide-react';
import { useApplicationStore } from '../stores/applicationStore';
import { useInterviewStore } from '../stores/interviewStore';
import { useFollowUpStore } from '../stores/followUpStore';
import { useCompanyStore } from '../stores/companyStore';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { Card, CardHeader } from '../components/ui/Card';
import { StatusBadge } from '../components/applications/StatusBadge';
import { Button } from '../components/ui/Button';
import { cn, formatDate, formatDateTime, daysUntil, deadlineLabel } from '../lib/utils';
import { STATUS_COLORS } from '../lib/constants';
import type { ApplicationStatus } from '../types';

const STATUS_ORDER: ApplicationStatus[] = ['saved', 'applied', 'screening', 'interview', 'offer', 'rejected'];

export function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const applications = useApplicationStore((s) => s.applications);
  const getApp = useApplicationStore((s) => s.getById);
  const interviews = useInterviewStore((s) => s.interviews);
  const followUps = useFollowUpStore((s) => s.followUps);
  const getCompany = useCompanyStore((s) => s.getById);
  const { settings } = useSettingsStore();

  const displayName = (isAuthenticated && user?.name) ? user.name : settings.userName;

  const stats = useMemo(() => {
    const total = applications.length;
    const responded = applications.filter((a) => ['screening', 'interview', 'offer', 'rejected'].includes(a.status)).length;
    const interviewing = applications.filter((a) => a.status === 'interview').length;
    const offers = applications.filter((a) => a.status === 'offer').length;
    const responseRate = total ? Math.round((responded / total) * 100) : 0;
    const interviewRate = total ? Math.round((interviewing / total) * 100) : 0;
    const offerRate = total ? Math.round((offers / total) * 100) : 0;
    return { total, responded, interviewing, offers, responseRate, interviewRate, offerRate };
  }, [applications]);

  const statusCounts = useMemo(() => {
    const counts: Record<ApplicationStatus, number> = {
      saved: 0, applied: 0, screening: 0, interview: 0, offer: 0, rejected: 0, withdrawn: 0,
    };
    applications.forEach((a) => { counts[a.status]++; });
    return counts;
  }, [applications]);

  const upcomingInterviews = useMemo(() =>
    interviews
      .filter((i) => i.status === 'scheduled' && new Date(i.dateTime) > new Date())
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
      .slice(0, 5),
    [interviews]
  );

  const pendingFollowUps = useMemo(() =>
    followUps
      .filter((f) => !f.completed)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5),
    [followUps]
  );

  const upcomingDeadlines = useMemo(() =>
    applications
      .filter((a) => a.applicationDeadline && !['rejected', 'withdrawn', 'offer'].includes(a.status))
      .sort((a, b) => new Date(a.applicationDeadline!).getTime() - new Date(b.applicationDeadline!).getTime())
      .filter((a) => daysUntil(a.applicationDeadline) !== null && daysUntil(a.applicationDeadline)! <= 14)
      .slice(0, 5),
    [applications]
  );

  const recentActivity = useMemo(() =>
    [...applications]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6),
    [applications]
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {greeting}, <span className="gradient-text">{displayName}</span> 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button variant="primary" icon={<Briefcase size={14} />} onClick={() => navigate('/applications')}>
          View Pipeline
        </Button>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Applied', value: stats.total, icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-600/10 border-indigo-500/20' },
          { label: 'Response Rate', value: `${stats.responseRate}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-600/10 border-emerald-500/20' },
          { label: 'Interviewing', value: stats.interviewing, icon: Target, color: 'text-amber-400', bg: 'bg-amber-600/10 border-amber-500/20' },
          { label: 'Offers', value: stats.offers, icon: CheckCircle2, color: 'text-purple-400', bg: 'bg-purple-600/10 border-purple-500/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className={cn('border', bg)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
              </div>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
                <Icon size={18} className={color} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader title="Application Pipeline" action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/kanban')}>
            Kanban View <ArrowRight size={12} />
          </Button>
        } />
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {STATUS_ORDER.map((status) => (
            <div
              key={status}
              onClick={() => navigate('/applications')}
              className={cn(
                'text-center p-3 rounded-xl border cursor-pointer transition-all hover:scale-105',
                STATUS_COLORS[status]
              )}
            >
              <div className="text-xl font-bold">{statusCounts[status]}</div>
              <div className="text-[10px] uppercase tracking-wider opacity-80 mt-0.5 capitalize">
                {status}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming Interviews */}
        <Card className="lg:col-span-1">
          <CardHeader title="Upcoming Interviews" subtitle={`${upcomingInterviews.length} scheduled`} action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/interviews')}>View all</Button>
          } />
          {upcomingInterviews.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No upcoming interviews</p>
          ) : (
            <div className="space-y-2">
              {upcomingInterviews.map((interview) => {
                const app = getApp(interview.applicationId);
                const company = app ? getCompany(app.companyId) : null;
                return (
                  <div key={interview.id} className="flex gap-3 p-2 rounded-lg hover:bg-slate-800/40 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <Calendar size={14} className="text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{app?.jobTitle ?? '—'}</p>
                      <p className="text-xs text-slate-400">{company?.name ?? '—'}</p>
                      <p className="text-xs text-slate-500">{formatDateTime(interview.dateTime)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Follow-ups */}
        <Card className="lg:col-span-1">
          <CardHeader title="Follow-ups" subtitle={`${pendingFollowUps.length} pending`} action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/applications')}>View all</Button>
          } />
          {pendingFollowUps.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No pending follow-ups</p>
          ) : (
            <div className="space-y-2">
              {pendingFollowUps.map((fu) => {
                const days = daysUntil(fu.dueDate);
                const dl = deadlineLabel(days);
                const app = getApp(fu.applicationId);
                const company = app ? getCompany(app.companyId) : null;
                return (
                  <div key={fu.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/40">
                    <Bell size={14} className={cn('shrink-0', days !== null && days <= 0 ? 'text-red-400' : 'text-slate-500')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate">{fu.title}</p>
                      <p className="text-xs text-slate-500">{company?.name ?? '—'}</p>
                    </div>
                    <span className={cn('text-xs font-medium shrink-0', dl.color)}>{dl.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Deadlines */}
        <Card className="lg:col-span-1">
          <CardHeader title="Deadlines" subtitle="Applications closing soon" />
          {upcomingDeadlines.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No upcoming deadlines</p>
          ) : (
            <div className="space-y-2">
              {upcomingDeadlines.map((app) => {
                const days = daysUntil(app.applicationDeadline);
                const dl = deadlineLabel(days);
                const company = getCompany(app.companyId);
                return (
                  <div
                    key={app.id}
                    onClick={() => navigate(`/applications/${app.id}`)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <AlertTriangle size={14} className={cn('shrink-0', dl.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate">{app.jobTitle}</p>
                      <p className="text-xs text-slate-500">{company?.name ?? '—'}</p>
                    </div>
                    <span className={cn('text-xs font-medium shrink-0', dl.color)}>{dl.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card>
          <CardHeader title="Recent Activity" />
          <div className="space-y-1">
            {recentActivity.map((app) => {
              const company = getCompany(app.companyId);
              return (
                <div
                  key={app.id}
                  onClick={() => navigate(`/applications/${app.id}`)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    app.status === 'offer' ? 'bg-emerald-400' :
                    app.status === 'rejected' ? 'bg-red-400' :
                    app.status === 'interview' ? 'bg-amber-400' : 'bg-indigo-400'
                  )} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-slate-300">{app.jobTitle}</span>
                    <span className="text-slate-500 mx-1">·</span>
                    <span className="text-sm text-slate-400">{company?.name ?? '—'}</span>
                  </div>
                  <StatusBadge status={app.status} />
                  <span className="text-xs text-slate-600 shrink-0">{formatDate(app.updatedAt, { month: 'short', day: 'numeric' })}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
