import { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts';
import { useApplicationStore } from '../stores/applicationStore';
import { useResumeStore } from '../stores/resumeStore';
import { useSettingsStore } from '../stores/settingsStore';
import { Card, CardHeader } from '../components/ui/Card';
import { cn } from '../lib/utils';
import { TrendingUp, Target, Award, BarChart3 } from 'lucide-react';

const STATUS_FILL: Record<string, string> = {
  saved: '#64748b',
  applied: '#6366f1',
  screening: '#8b5cf6',
  interview: '#f59e0b',
  offer: '#10b981',
  rejected: '#ef4444',
};

export function Analytics() {
  const applications = useApplicationStore((s) => s.applications);
  const resumes = useResumeStore((s) => s.resumes);
  const { settings } = useSettingsStore();

  const isLight = settings.theme === 'light';

  const chartTheme = useMemo(() => ({
    gridStroke: isLight ? '#e2e8f0' : '#1e293b',
    tickColor: isLight ? '#475569' : '#94a3b8',
    tooltipBg: isLight ? '#ffffff' : '#0f172a',
    tooltipBorder: isLight ? '#cbd5e1' : '#334155',
    tooltipText: isLight ? '#0f172a' : '#f8fafc',
    tooltipLabelText: isLight ? '#475569' : '#cbd5e1',
    cursorFill: isLight ? '#f1f5f9' : '#1e293b',
  }), [isLight]);

  const stats = useMemo(() => {
    const total = applications.length;
    if (!total) return null;
    const responded = applications.filter((a) => ['screening', 'interview', 'offer', 'rejected'].includes(a.status)).length;
    const screening = applications.filter((a) => ['screening', 'interview', 'offer'].includes(a.status)).length;
    const interviewing = applications.filter((a) => ['interview', 'offer'].includes(a.status)).length;
    const offers = applications.filter((a) => a.status === 'offer').length;
    return {
      total,
      responseRate: Math.round((responded / total) * 100),
      screeningRate: Math.round((screening / total) * 100),
      interviewRate: Math.round((interviewing / total) * 100),
      offerRate: Math.round((offers / total) * 100),
    };
  }, [applications]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((a) => { counts[a.status] = (counts[a.status] ?? 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({ status, count, fill: STATUS_FILL[status] ?? '#6366f1' }));
  }, [applications]);

  const funnelData = useMemo(() => {
    if (!applications.length) return [];
    const total = applications.length;
    const responded = applications.filter((a) => ['screening', 'interview', 'offer', 'rejected'].includes(a.status)).length;
    const screening = applications.filter((a) => ['screening', 'interview', 'offer'].includes(a.status)).length;
    const interviewing = applications.filter((a) => ['interview', 'offer'].includes(a.status)).length;
    const offers = applications.filter((a) => a.status === 'offer').length;
    return [
      { name: 'Applied', value: total, fill: '#6366f1' },
      { name: 'Responded', value: responded, fill: '#8b5cf6' },
      { name: 'Screening', value: screening, fill: '#a78bfa' },
      { name: 'Interview', value: interviewing, fill: '#f59e0b' },
      { name: 'Offer', value: offers, fill: '#10b981' },
    ];
  }, [applications]);

  const weeklyData = useMemo(() => {
    const weeks: Record<string, number> = {};
    applications.forEach((a) => {
      const d = new Date(a.createdAt);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      weeks[key] = (weeks[key] ?? 0) + 1;
    });
    return Object.entries(weeks).slice(-8).map(([week, count]) => ({ week, count }));
  }, [applications]);

  const resumePerf = useMemo(() => {
    return resumes.map((r) => {
      const used = applications.filter((a) => a.resumeId === r.id);
      const responded = used.filter((a) => ['screening', 'interview', 'offer'].includes(a.status)).length;
      return {
        name: `${r.name} v${r.version}`,
        applications: used.length,
        responseRate: used.length ? Math.round((responded / used.length) * 100) : 0,
      };
    }).filter((r) => r.applications > 0);
  }, [applications, resumes]);

  if (!applications.length) {
    return (
      <div className="p-6 text-center">
        <div className="py-16">
          <BarChart3 size={40} className="text-slate-400 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-300">No data yet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add applications to see analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Analytics</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Applications', value: stats.total, icon: Target, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50/60 dark:bg-indigo-600/10 border-indigo-200 dark:border-indigo-500/20' },
            { label: 'Response Rate', value: `${stats.responseRate}%`, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/60 dark:bg-emerald-600/10 border-emerald-200 dark:border-emerald-500/20' },
            { label: 'Interview Rate', value: `${stats.interviewRate}%`, icon: Award, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50/60 dark:bg-amber-600/10 border-amber-200 dark:border-amber-500/20' },
            { label: 'Offer Rate', value: `${stats.offerRate}%`, icon: Award, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50/60 dark:bg-purple-600/10 border-purple-200 dark:border-purple-500/20' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className={cn('border', bg)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</p>
                </div>
                <Icon size={20} className={color} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader title="Application Status" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} vertical={false} />
              <XAxis dataKey="status" tick={{ fill: chartTheme.tickColor, fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: chartTheme.tickColor, fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartTheme.tooltipBg,
                  border: `1px solid ${chartTheme.tooltipBorder}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: isLight ? '0 4px 6px -1px rgba(0,0,0,0.08)' : '0 4px 6px -1px rgba(0,0,0,0.4)',
                }}
                itemStyle={{ color: chartTheme.tooltipText, fontWeight: 600 }}
                labelStyle={{ color: chartTheme.tooltipLabelText, fontWeight: 500 }}
                cursor={{ fill: chartTheme.cursorFill }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Weekly Applications" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} vertical={false} />
              <XAxis dataKey="week" tick={{ fill: chartTheme.tickColor, fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: chartTheme.tickColor, fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartTheme.tooltipBg,
                  border: `1px solid ${chartTheme.tooltipBorder}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: isLight ? '0 4px 6px -1px rgba(0,0,0,0.08)' : '0 4px 6px -1px rgba(0,0,0,0.4)',
                }}
                itemStyle={{ color: chartTheme.tooltipText, fontWeight: 600 }}
                labelStyle={{ color: chartTheme.tooltipLabelText, fontWeight: 500 }}
                cursor={{ fill: chartTheme.cursorFill }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Application Funnel" />
          <div className="space-y-3 mt-2">
            {funnelData.map((item) => {
              const max = funnelData[0]?.value ?? 1;
              const pct = Math.round((item.value / max) * 100);
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{item.name}</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-300">{item.value}</span>
                  </div>
                  <div className="h-6 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: item.fill }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {resumePerf.length > 0 && (
          <Card>
            <CardHeader title="Resume Performance" />
            <div className="space-y-3 mt-2">
              {resumePerf.map((r) => (
                <div key={r.name} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">{r.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{r.applications} applications</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{r.responseRate}%</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">response</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
