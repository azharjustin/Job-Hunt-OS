import { useState, useMemo } from 'react';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { Calendar, Plus, Video, User, Clock, Trash2, CheckCircle2, RotateCcw } from 'lucide-react';
import { useInterviewStore } from '../stores/interviewStore';
import { useApplicationStore } from '../stores/applicationStore';
import { useCompanyStore } from '../stores/companyStore';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Select, Input, Textarea } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { cn, formatDateTime } from '../lib/utils';
import type { Interview } from '../types';

const TYPE_COLORS: Record<string, string> = {
  hr: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  screening: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  technical: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  behavioral: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'system-design': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  managerial: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  final: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  other: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

const INTERVIEW_TYPE_LABELS: Record<string, string> = {
  hr: 'HR', screening: 'Screening', technical: 'Technical',
  behavioral: 'Behavioral', 'system-design': 'System Design',
  managerial: 'Managerial', final: 'Final', other: 'Other',
};

export function Interviews() {
  const { interviews, add, update, remove } = useInterviewStore();
  const getApp = useApplicationStore((s) => s.getById);
  const getCompany = useCompanyStore((s) => s.getById);
  const applications = useApplicationStore((s) => s.applications);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    applicationId: '',
    type: 'technical',
    dateTime: '',
    interviewer: '',
    meetingUrl: '',
    notes: '',
    status: 'scheduled',
  });

  const grouped = useMemo(() => {
    const sorted = [...interviews].sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );
    const groups: { label: string; items: Interview[] }[] = [];
    const seen = new Set<string>();

    sorted.forEach((i) => {
      const d = new Date(i.dateTime);
      let label = '';
      if (isToday(d)) label = 'Today';
      else if (isTomorrow(d)) label = 'Tomorrow';
      else if (isThisWeek(d)) label = 'This Week';
      else label = format(d, 'MMMM yyyy');

      if (!seen.has(label)) {
        seen.add(label);
        groups.push({ label, items: [] });
      }
      groups.find((g) => g.label === label)!.items.push(i);
    });

    return groups;
  }, [interviews]);

  const appOptions = [
    { value: '', label: '— Select Application —' },
    ...applications.map((a) => {
      const c = getCompany(a.companyId);
      return { value: a.id, label: `${a.jobTitle} @ ${c?.name ?? 'Unknown'}` };
    }),
  ];

  const handleAdd = () => {
    if (!form.applicationId || !form.dateTime) return;
    add({
      applicationId: form.applicationId,
      type: form.type as any,
      dateTime: form.dateTime,
      interviewer: form.interviewer,
      meetingUrl: form.meetingUrl,
      notes: form.notes,
      status: 'scheduled',
    });
    setForm({ applicationId: '', type: 'technical', dateTime: '', interviewer: '', meetingUrl: '', notes: '', status: 'scheduled' });
    setShowAdd(false);
  };

  return (
    <div className="p-6 space-y-4 animate-fade-in max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Interviews</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{interviews.length} total</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setShowAdd(true)}>
          Schedule Interview
        </Button>
      </div>

      {interviews.length === 0 ? (
        <EmptyState
          icon={<Calendar size={24} />}
          title="No interviews yet"
          description="Schedule interviews and track your progress through each stage."
          action={{ label: 'Schedule Interview', onClick: () => setShowAdd(true) }}
        />
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.label}>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{group.label}</h2>
              <div className="space-y-3">
                {group.items.map((interview) => {
                  const app = getApp(interview.applicationId);
                  const company = app ? getCompany(app.companyId) : null;
                  return (
                    <Card key={interview.id} className="group">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center shrink-0">
                          <Calendar size={18} className="text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={TYPE_COLORS[interview.type] ?? TYPE_COLORS.other}>
                              {INTERVIEW_TYPE_LABELS[interview.type]}
                            </Badge>
                            <span className={cn(
                              'px-2 py-0.5 rounded-full text-xs font-semibold border capitalize',
                              interview.status === 'scheduled' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30' :
                              interview.status === 'completed' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' :
                              'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30'
                            )}>
                              {interview.status}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">{app?.jobTitle ?? '—'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{company?.name ?? '—'}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1"><Clock size={12} /> {formatDateTime(interview.dateTime)}</span>
                            {interview.interviewer && <span className="flex items-center gap-1"><User size={12} /> {interview.interviewer}</span>}
                            {interview.meetingUrl && (
                              <a href={interview.meetingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                                <Video size={12} /> Join
                              </a>
                            )}
                          </div>
                          {interview.notes && <p className="text-xs text-slate-500 mt-2">{interview.notes}</p>}
                        </div>

                        {/* Action buttons with high visibility in light and dark mode */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => update(interview.id, { status: interview.status === 'scheduled' ? 'completed' : 'scheduled' })}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            {interview.status === 'scheduled' ? (
                              <>
                                <CheckCircle2 size={12} className="text-emerald-500" /> Complete
                              </>
                            ) : (
                              <>
                                <RotateCcw size={12} className="text-amber-500" /> Reopen
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => remove(interview.id)}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Schedule Interview" footer={
        <>
          <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}>Schedule</Button>
        </>
      }>
        <div className="space-y-4">
          <Select
            label="Application"
            value={form.applicationId}
            onChange={(e) => setForm((f) => ({ ...f, applicationId: e.target.value }))}
            options={appOptions}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Interview Type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              options={Object.entries(INTERVIEW_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            />
            <Input
              label="Date & Time"
              type="datetime-local"
              value={form.dateTime}
              onChange={(e) => setForm((f) => ({ ...f, dateTime: e.target.value }))}
            />
          </div>
          <Input
            label="Interviewer Name / Role"
            placeholder="e.g. Sarah Jenkins (Tech Lead)"
            value={form.interviewer}
            onChange={(e) => setForm((f) => ({ ...f, interviewer: e.target.value }))}
          />
          <Input
            label="Meeting Link"
            placeholder="e.g. https://meet.google.com/..."
            value={form.meetingUrl}
            onChange={(e) => setForm((f) => ({ ...f, meetingUrl: e.target.value }))}
          />
          <Textarea
            label="Notes / Instructions"
            placeholder="Topics to prepare, code challenges to review..."
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
