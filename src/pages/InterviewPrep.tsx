import { useState, useMemo } from 'react';
import { BookOpen, Plus, CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { useApplicationStore } from '../stores/applicationStore';
import { useCompanyStore } from '../stores/companyStore';
import { useQuestionStore } from '../stores/questionStore';
import { useSettingsStore } from '../stores/settingsStore';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Select, Textarea } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { JobAnalyzer } from '../components/job-analyzer/JobAnalyzer';
import { cn } from '../lib/utils';

type Tab = 'questions' | 'analyzer';

export function InterviewPrep() {
  const applications = useApplicationStore((s) => s.applications);
  const getCompany = useCompanyStore((s) => s.getById);
  const { questions, add, togglePrepared, remove } = useQuestionStore();
  const { settings } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<Tab>('questions');
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [showAdd, setShowAdd] = useState(false);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [form, setForm] = useState({ question: '', answer: '', category: 'technical' });

  const appOptions = [
    { value: '', label: '— All Applications —' },
    ...applications.map((a) => {
      const c = getCompany(a.companyId);
      return { value: a.id, label: `${a.jobTitle} @ ${c?.name ?? 'Unknown'}` };
    }),
  ];

  const filteredQ = useMemo(() =>
    selectedAppId
      ? questions.filter((q) => q.applicationId === selectedAppId)
      : questions,
    [questions, selectedAppId]
  );

  const grouped = useMemo(() => ({
    technical: filteredQ.filter((q) => q.category === 'technical'),
    behavioral: filteredQ.filter((q) => q.category === 'behavioral'),
    other: filteredQ.filter((q) => q.category === 'other'),
  }), [filteredQ]);

  const preparedCount = filteredQ.filter((q) => q.prepared).length;

  const handleAdd = () => {
    if (!form.question.trim() || !selectedAppId) return;
    add({
      applicationId: selectedAppId,
      question: form.question,
      answer: form.answer,
      category: form.category as any,
      prepared: false,
    });
    setForm({ question: '', answer: '', category: 'technical' });
    setShowAdd(false);
  };

  const selectedApp = applications.find((a) => a.id === selectedAppId);

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Interview Prep</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {preparedCount}/{filteredQ.length} questions prepared
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'questions' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('questions')}
          >
            Questions
          </Button>
          <Button
            variant={activeTab === 'analyzer' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('analyzer')}
          >
            Skill Analyzer
          </Button>
        </div>
      </div>

      {activeTab === 'questions' && (
        <>
          {/* App filter + Add */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-48">
              <Select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                options={appOptions}
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={13} />}
              onClick={() => setShowAdd(true)}
              disabled={!selectedAppId}
            >
              Add Question
            </Button>
          </div>

          {/* Progress bar */}
          {filteredQ.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-500 dark:text-slate-400">Preparation Progress</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{preparedCount}/{filteredQ.length}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${filteredQ.length ? (preparedCount / filteredQ.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {filteredQ.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={24} />}
              title="No questions yet"
              description={selectedAppId ? 'Add questions to prepare for this interview.' : 'Select an application and start adding prep questions.'}
              action={selectedAppId ? { label: '+ Add Question', onClick: () => setShowAdd(true) } : undefined}
            />
          ) : (
            <div className="space-y-5">
              {(['technical', 'behavioral', 'other'] as const).map((cat) => {
                const catQ = grouped[cat];
                if (!catQ.length) return null;
                const catPrepared = catQ.filter((q) => q.prepared).length;
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider capitalize">{cat}</h3>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{catPrepared}/{catQ.length} ready</span>
                    </div>
                    <div className="space-y-2">
                      {catQ.map((q) => (
                        <Card key={q.id} className="p-0 overflow-hidden">
                          <div
                            className="flex items-start gap-3 p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                            onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                          >
                            <button
                              onClick={(e) => { e.stopPropagation(); togglePrepared(q.id); }}
                              className="shrink-0 mt-0.5"
                              aria-label={q.prepared ? 'Mark as not prepared' : 'Mark as prepared'}
                            >
                              {q.prepared
                                ? <CheckCircle2 size={17} className="text-emerald-500" />
                                : <Circle size={17} className="text-slate-400 dark:text-slate-600 hover:text-emerald-500 transition-colors" />}
                            </button>
                            <p className={cn('flex-1 text-sm', q.prepared ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-slate-100')}>{q.question}</p>
                            <div className="flex items-center gap-2 shrink-0">
                              {expandedQ === q.id
                                ? <ChevronUp size={14} className="text-slate-500" />
                                : <ChevronDown size={14} className="text-slate-500" />}
                              <button
                                onClick={(e) => { e.stopPropagation(); remove(q.id); }}
                                className="text-slate-400 hover:text-red-500 transition-colors px-1"
                                aria-label="Remove question"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                          {expandedQ === q.id && q.answer && (
                            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                              <p className="text-xs text-slate-500 mb-1">Answer / Notes</p>
                              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{q.answer}</p>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'analyzer' && (
        <JobAnalyzer
          applicationId={selectedAppId || undefined}
          initialJD={selectedApp?.jobDescription}
          userSkills={settings.userSkills}
        />
      )}

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Interview Question"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAdd}>Add Question</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            options={[
              { value: 'technical', label: 'Technical' },
              { value: 'behavioral', label: 'Behavioral' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Textarea
            label="Question *"
            value={form.question}
            onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
            rows={2}
            placeholder="e.g. Explain the React reconciliation algorithm..."
          />
          <Textarea
            label="Answer / Key Points"
            value={form.answer}
            onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
            rows={4}
            placeholder="Your answer, key points to mention, code snippets..."
          />
        </div>
      </Modal>
    </div>
  );
}
