import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, Plus, CheckCircle2, Circle, ExternalLink,
  MapPin, Calendar, RotateCcw
} from 'lucide-react';
import { useApplicationStore } from '../stores/applicationStore';
import { useCompanyStore } from '../stores/companyStore';
import { useInterviewStore } from '../stores/interviewStore';
import { useFollowUpStore } from '../stores/followUpStore';
import { useResumeStore } from '../stores/resumeStore';
import { useQuestionStore } from '../stores/questionStore';
import { useSettingsStore } from '../stores/settingsStore';
import { Modal } from '../components/ui/Modal';
import { ApplicationForm } from '../components/applications/ApplicationForm';
import { StatusBadge } from '../components/applications/StatusBadge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Textarea, Select } from '../components/ui/Input';
import { ConfirmDialog } from '../components/ui/EmptyState';
import { JobAnalyzer } from '../components/job-analyzer/JobAnalyzer';
import { cn, formatDate, formatDateTime, formatSalary } from '../lib/utils';
import { WORK_MODE_LABELS, EMPLOYMENT_TYPE_LABELS } from '../lib/constants';

type ActiveTab = 'overview' | 'interviews' | 'followups' | 'prep' | 'analyzer';

export function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const getApp = useApplicationStore((s) => s.getById);
  const removeApp = useApplicationStore((s) => s.remove);
  const getCompany = useCompanyStore((s) => s.getById);
  const interviewStore = useInterviewStore();
  const followUpStore = useFollowUpStore();
  const { resumes } = useResumeStore();
  const questionStore = useQuestionStore();
  const { settings } = useSettingsStore();

  const app = getApp(id ?? '');
  const company = app ? getCompany(app.companyId) : null;
  const resume = app?.resumeId ? resumes.find((r) => r.id === app.resumeId) : null;
  const interviews = interviewStore.getByApplication(id ?? '');
  const followUps = followUpStore.getByApplication(id ?? '');
  const questions = questionStore.getByApplication(id ?? '');

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Interview form
  const [showAddInterview, setShowAddInterview] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    type: 'technical', dateTime: '', interviewer: '', meetingUrl: '', notes: '',
  });

  // Follow-up form
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const [followUpForm, setFollowUpForm] = useState({
    title: '', dueDate: '', type: 'email', notes: '',
  });

  // Question form
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    question: '', answer: '', category: 'technical',
  });

  if (!app) {
    return (
      <div className="p-6 text-center text-slate-400">
        Application not found.{' '}
        <button onClick={() => navigate('/applications')} className="text-indigo-400 hover:underline">Go back</button>
      </div>
    );
  }

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'interviews', label: `Interviews (${interviews.length})` },
    { id: 'followups', label: `Follow-ups (${followUps.length})` },
    { id: 'prep', label: `Prep (${questions.length})` },
    { id: 'analyzer', label: 'Skill Analyzer' },
  ];

  const handleDeleteApp = () => {
    removeApp(app.id);
    navigate('/applications');
  };

  const handleAddInterview = () => {
    if (!interviewForm.dateTime) return;
    interviewStore.add({
      applicationId: app.id,
      type: interviewForm.type as any,
      dateTime: interviewForm.dateTime,
      interviewer: interviewForm.interviewer,
      meetingUrl: interviewForm.meetingUrl,
      notes: interviewForm.notes,
      status: 'scheduled',
    });
    setInterviewForm({ type: 'technical', dateTime: '', interviewer: '', meetingUrl: '', notes: '' });
    setShowAddInterview(false);
  };

  const handleAddFollowUp = () => {
    if (!followUpForm.title || !followUpForm.dueDate) return;
    followUpStore.add({
      applicationId: app.id,
      title: followUpForm.title,
      dueDate: followUpForm.dueDate,
      type: followUpForm.type as any,
      notes: followUpForm.notes,
      completed: false,
    });
    setFollowUpForm({ title: '', dueDate: '', type: 'email', notes: '' });
    setShowAddFollowUp(false);
  };

  const handleAddQuestion = () => {
    if (!questionForm.question) return;
    questionStore.add({
      applicationId: app.id,
      question: questionForm.question,
      answer: questionForm.answer,
      category: questionForm.category as any,
      prepared: false,
    });
    setQuestionForm({ question: '', answer: '', category: 'technical' });
    setShowAddQuestion(false);
  };

  const INTERVIEW_TYPE_LABELS: Record<string, string> = {
    hr: 'HR', screening: 'Screening', technical: 'Technical',
    behavioral: 'Behavioral', 'system-design': 'System Design',
    managerial: 'Managerial', final: 'Final', other: 'Other',
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-950/40 shrink-0">
        <button
          onClick={() => navigate('/applications')}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-3 transition-colors"
        >
          <ArrowLeft size={14} /> Applications
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-100">{app.jobTitle}</h1>
              <StatusBadge status={app.status} />
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap text-sm text-slate-400">
              <span className="font-medium text-slate-300">{company?.name ?? '—'}</span>
              {app.location && <span className="flex items-center gap-1"><MapPin size={12} />{app.location}</span>}
              <span className="capitalize">{WORK_MODE_LABELS[app.workMode]}</span>
              {(app.salaryMin || app.salaryMax) ? (
                <span className="text-emerald-400">{formatSalary(app.salaryMin, app.salaryMax, app.salaryCurrency)}</span>
              ) : null}
            </div>
          </div>
          <div className="flex gap-2">
            {app.jobUrl && (
              <Button variant="outline" size="sm" icon={<ExternalLink size={13} />} onClick={() => window.open(app.jobUrl, '_blank')}>
                Job Post
              </Button>
            )}
            <Button variant="secondary" size="sm" icon={<Edit2 size={13} />} onClick={() => setShowEdit(true)}>Edit</Button>
            <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => setShowDelete(true)}>Delete</Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                activeTab === t.id
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Timeline */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <h3 className="text-sm font-semibold text-slate-100 mb-4">Application Timeline</h3>
                <div className="space-y-3">
                  {app.createdAt && (
                    <TimelineItem date={app.createdAt} title="Application added" />
                  )}
                  {app.appliedAt && (
                    <TimelineItem date={app.appliedAt} title="Applied" color="bg-blue-400" />
                  )}
                  {interviews.map((i) => (
                    <TimelineItem key={i.id} date={i.dateTime} title={`${INTERVIEW_TYPE_LABELS[i.type]} Interview`} status={i.status} color="bg-amber-400" />
                  ))}
                </div>
              </Card>

              {app.notes && (
                <Card>
                  <h3 className="text-sm font-semibold text-slate-100 mb-2">Notes</h3>
                  <p className="text-sm text-slate-400 whitespace-pre-wrap">{app.notes}</p>
                </Card>
              )}
            </div>

            {/* Info panel */}
            <div className="space-y-4">
              <Card>
                <h3 className="text-sm font-semibold text-slate-100 mb-3">Job Information</h3>
                <div className="space-y-2">
                  <InfoRow label="Status" value={<StatusBadge status={app.status} />} />
                  <InfoRow label="Priority" value={<span className="capitalize text-slate-300">{app.priority}</span>} />
                  <InfoRow label="Work Mode" value={WORK_MODE_LABELS[app.workMode]} />
                  <InfoRow label="Type" value={EMPLOYMENT_TYPE_LABELS[app.employmentType]} />
                  {(app.salaryMin || app.salaryMax) ? (
                    <InfoRow label="Salary" value={
                      <span className="text-emerald-400">{formatSalary(app.salaryMin, app.salaryMax, app.salaryCurrency)}</span>
                    } />
                  ) : null}
                  {app.appliedAt && <InfoRow label="Applied" value={formatDate(app.appliedAt)} />}
                  {app.applicationDeadline && (
                    <InfoRow label="Deadline" value={
                      <span className="text-amber-400">{formatDate(app.applicationDeadline)}</span>
                    } />
                  )}
                  {resume && <InfoRow label="Resume" value={`${resume.name} v${resume.version}`} />}
                </div>
              </Card>

              {company && (
                <Card>
                  <h3 className="text-sm font-semibold text-slate-100 mb-3">Company</h3>
                  <div className="space-y-2">
                    <InfoRow label="Name" value={company.name} />
                    {company.industry && <InfoRow label="Industry" value={company.industry} />}
                    {company.location && <InfoRow label="Location" value={company.location} />}
                    {company.size && <InfoRow label="Size" value={<span className="capitalize">{company.size}</span>} />}
                    {company.website && (
                      <InfoRow label="Website" value={
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline text-sm">{company.website}</a>
                      } />
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Interviews */}
        {activeTab === 'interviews' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setShowAddInterview(true)}>
                Schedule Interview
              </Button>
            </div>
            {interviews.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">No interviews yet</div>
            ) : (
              <div className="space-y-3">
                {interviews.map((i) => (
                  <Card key={i.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center">
                          <Calendar size={16} className="text-amber-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-100">{INTERVIEW_TYPE_LABELS[i.type]} Interview</p>
                          <p className="text-sm text-slate-400">{formatDateTime(i.dateTime)}</p>
                          {i.interviewer && <p className="text-xs text-slate-500">With: {i.interviewer}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-semibold border capitalize',
                          i.status === 'scheduled' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30' :
                          i.status === 'completed' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' :
                          'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30'
                        )}>
                          {i.status}
                        </span>
                        <button
                          onClick={() => interviewStore.update(i.id, { status: i.status === 'scheduled' ? 'completed' : 'scheduled' })}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {i.status === 'scheduled' ? (
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
                          onClick={() => interviewStore.remove(i.id)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                    {i.notes && <p className="mt-3 text-sm text-slate-400 border-t border-slate-800 pt-3">{i.notes}</p>}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Follow-ups */}
        {activeTab === 'followups' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setShowAddFollowUp(true)}>
                Add Follow-up
              </Button>
            </div>
            {followUps.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">No follow-ups yet</div>
            ) : (
              <div className="space-y-3">
                {followUps.map((fu) => (
                  <Card key={fu.id}>
                    <div className="flex items-center gap-3">
                      <button onClick={() => followUpStore.complete(fu.id)} className="shrink-0">
                        {fu.completed
                          ? <CheckCircle2 size={18} className="text-emerald-400" />
                          : <Circle size={18} className="text-slate-600 hover:text-indigo-400 transition-colors" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium', fu.completed ? 'line-through text-slate-500' : 'text-slate-100')}>{fu.title}</p>
                        <p className="text-xs text-slate-500">{fu.type} · Due {formatDate(fu.dueDate)}</p>
                      </div>
                      <button onClick={() => followUpStore.remove(fu.id)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Interview Prep */}
        {activeTab === 'prep' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setShowAddQuestion(true)}>
                Add Question
              </Button>
            </div>
            {questions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">No prep questions yet</div>
            ) : (
              <div className="space-y-3">
                {(['technical', 'behavioral', 'other'] as const).map((cat) => {
                  const catQ = questions.filter((q) => q.category === cat);
                  if (!catQ.length) return null;
                  const catPrepared = catQ.filter((q) => q.prepared).length;
                  return (
                    <div key={cat}>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 capitalize">{cat} Questions ({catPrepared}/{catQ.length})</h3>
                      <div className="space-y-2">
                        {catQ.map((q) => (
                          <Card key={q.id} className="space-y-2">
                            <div className="flex items-start gap-3">
                              <button onClick={() => questionStore.togglePrepared(q.id)} className="shrink-0 mt-0.5">
                                {q.prepared
                                  ? <CheckCircle2 size={16} className="text-emerald-400" />
                                  : <Circle size={16} className="text-slate-600 hover:text-emerald-400 transition-colors" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-100">{q.question}</p>
                                {q.answer && <p className="text-xs text-slate-400 mt-1">{q.answer}</p>}
                              </div>
                              <button onClick={() => questionStore.remove(q.id)} className="text-xs text-red-400 hover:text-red-300 shrink-0">×</button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Skill Analyzer */}
        {activeTab === 'analyzer' && (
          <JobAnalyzer applicationId={app.id} initialJD={app.jobDescription} userSkills={settings.userSkills} />
        )}
      </div>

      {/* Modals */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Application" size="lg">
        <ApplicationForm initial={app} onSuccess={() => setShowEdit(false)} onCancel={() => setShowEdit(false)} />
      </Modal>

      <ConfirmDialog
        open={showDelete}
        title="Delete Application?"
        description="This will permanently remove this application and all associated data."
        confirmLabel="Delete"
        danger
        onConfirm={handleDeleteApp}
        onCancel={() => setShowDelete(false)}
      />

      {/* Add Interview Modal */}
      <Modal open={showAddInterview} onClose={() => setShowAddInterview(false)} title="Schedule Interview" footer={
        <>
          <Button variant="ghost" onClick={() => setShowAddInterview(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddInterview}>Schedule</Button>
        </>
      }>
        <div className="space-y-4">
          <Select label="Type" value={interviewForm.type} onChange={(e) => setInterviewForm((f) => ({ ...f, type: e.target.value }))} options={[
            { value: 'screening', label: 'Screening' },
            { value: 'hr', label: 'HR' },
            { value: 'technical', label: 'Technical' },
            { value: 'behavioral', label: 'Behavioral' },
            { value: 'system-design', label: 'System Design' },
            { value: 'managerial', label: 'Managerial' },
            { value: 'final', label: 'Final' },
            { value: 'other', label: 'Other' },
          ]} />
          <Input label="Date & Time *" type="datetime-local" value={interviewForm.dateTime} onChange={(e) => setInterviewForm((f) => ({ ...f, dateTime: e.target.value }))} />
          <Input label="Interviewer" value={interviewForm.interviewer} onChange={(e) => setInterviewForm((f) => ({ ...f, interviewer: e.target.value }))} placeholder="Name or email..." />
          <Input label="Meeting URL" value={interviewForm.meetingUrl} onChange={(e) => setInterviewForm((f) => ({ ...f, meetingUrl: e.target.value }))} placeholder="Zoom, Meet, Teams..." />
          <Textarea label="Notes" value={interviewForm.notes} onChange={(e) => setInterviewForm((f) => ({ ...f, notes: e.target.value }))} rows={3} />
        </div>
      </Modal>

      {/* Add Follow-up Modal */}
      <Modal open={showAddFollowUp} onClose={() => setShowAddFollowUp(false)} title="Add Follow-up" footer={
        <>
          <Button variant="ghost" onClick={() => setShowAddFollowUp(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddFollowUp}>Add</Button>
        </>
      }>
        <div className="space-y-4">
          <Input label="Title *" value={followUpForm.title} onChange={(e) => setFollowUpForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Send thank-you email" />
          <Input label="Due Date *" type="date" value={followUpForm.dueDate} onChange={(e) => setFollowUpForm((f) => ({ ...f, dueDate: e.target.value }))} />
          <Select label="Type" value={followUpForm.type} onChange={(e) => setFollowUpForm((f) => ({ ...f, type: e.target.value }))} options={[
            { value: 'email', label: 'Email' },
            { value: 'message', label: 'Message' },
            { value: 'call', label: 'Call' },
            { value: 'other', label: 'Other' },
          ]} />
          <Textarea label="Notes" value={followUpForm.notes} onChange={(e) => setFollowUpForm((f) => ({ ...f, notes: e.target.value }))} rows={2} />
        </div>
      </Modal>

      {/* Add Question Modal */}
      <Modal open={showAddQuestion} onClose={() => setShowAddQuestion(false)} title="Add Question" footer={
        <>
          <Button variant="ghost" onClick={() => setShowAddQuestion(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddQuestion}>Add</Button>
        </>
      }>
        <div className="space-y-4">
          <Select label="Category" value={questionForm.category} onChange={(e) => setQuestionForm((f) => ({ ...f, category: e.target.value }))} options={[
            { value: 'technical', label: 'Technical' },
            { value: 'behavioral', label: 'Behavioral' },
            { value: 'other', label: 'Other' },
          ]} />
          <Textarea label="Question *" value={questionForm.question} onChange={(e) => setQuestionForm((f) => ({ ...f, question: e.target.value }))} rows={2} placeholder="e.g. Explain React reconciliation..." />
          <Textarea label="Answer / Notes" value={questionForm.answer} onChange={(e) => setQuestionForm((f) => ({ ...f, answer: e.target.value }))} rows={3} placeholder="Your answer or key points..." />
        </div>
      </Modal>
    </div>
  );
}

function TimelineItem({ date, title, status, color = 'bg-indigo-400' }: { date: string; title: string; status?: string; color?: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={cn('w-2.5 h-2.5 rounded-full mt-1 shrink-0', color)} />
        <div className="w-px flex-1 bg-slate-800 mt-1" />
      </div>
      <div className="pb-3">
        <p className="text-sm text-slate-200">{title}</p>
        <p className="text-xs text-slate-500">{formatDate(date)}</p>
        {status && <span className="text-xs text-slate-600 capitalize">({status})</span>}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm text-slate-300 text-right">{value}</span>
    </div>
  );
}
