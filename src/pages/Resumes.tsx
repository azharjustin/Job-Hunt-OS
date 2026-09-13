import { useState } from 'react';
import { Plus, FileText, Pencil, Trash2 } from 'lucide-react';
import { useResumeStore } from '../stores/resumeStore';
import { useApplicationStore } from '../stores/applicationStore';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { EmptyState, ConfirmDialog } from '../components/ui/EmptyState';
import { formatDate } from '../lib/utils';
import type { Resume } from '../types';

export function Resumes() {
  const { resumes, add, update, remove } = useResumeStore();
  const applications = useApplicationStore((s) => s.applications);
  const [showAdd, setShowAdd] = useState(false);
  const [editResume, setEditResume] = useState<Resume | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    role: '',
    version: '1',
    skills: '',
    notes: '',
  });

  const openEdit = (r: Resume) => {
    setForm({
      name: r.name,
      role: r.role,
      version: r.version,
      skills: r.skills.join(', '),
      notes: r.notes ?? '',
    });
    setEditResume(r);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.role.trim()) return;
    const skillsArray = form.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const data = {
      name: form.name,
      role: form.role,
      version: form.version,
      skills: skillsArray,
      notes: form.notes || undefined,
    };

    if (editResume) {
      update(editResume.id, data);
      setEditResume(null);
    } else {
      add(data);
      setShowAdd(false);
    }
    setForm({ name: '', role: '', version: '1', skills: '', notes: '' });
  };

  const getUsageCount = (resumeId: string) =>
    applications.filter((a) => a.resumeId === resumeId).length;

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Resumes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{resumes.length} resume versions</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setShowAdd(true)}>
          Add Resume
        </Button>
      </div>

      {resumes.length === 0 ? (
        <EmptyState
          icon={<FileText size={24} />}
          title="No resume versions"
          description="Track different versions of your resume and see which performs best."
          action={{ label: '+ Add Resume', onClick: () => setShowAdd(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => {
            const usage = getUsageCount(resume.id);
            return (
              <Card key={resume.id} className="group hover:border-indigo-500/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-violet-500 dark:text-violet-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{resume.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">v{resume.version} · {resume.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 items-center shrink-0">
                    <button
                      onClick={() => openEdit(resume)}
                      className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Resume"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteId(resume.id)}
                      className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Delete Resume"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {resume.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {resume.skills.slice(0, 5).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        {s}
                      </span>
                    ))}
                    {resume.skills.length > 5 && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                        +{resume.skills.length - 5}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <span>Used in {usage} application{usage !== 1 ? 's' : ''}</span>
                  <span>{formatDate(resume.createdAt, { month: 'short', year: 'numeric' })}</span>
                </div>

                {resume.notes && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{resume.notes}</p>}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showAdd || !!editResume} onClose={() => { setShowAdd(false); setEditResume(null); }} title={editResume ? 'Edit Resume' : 'Add Resume'} footer={
        <>
          <Button variant="ghost" onClick={() => { setShowAdd(false); setEditResume(null); }}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>{editResume ? 'Save' : 'Add Resume'}</Button>
        </>
      }>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Resume Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Frontend Resume" />
            <Input label="Version" value={form.version} onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))} placeholder="e.g. 3" />
          </div>
          <Input label="Target Role *" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="e.g. Senior Frontend Developer" />
          <Input label="Skills (comma separated)" value={form.skills} onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))} placeholder="React, TypeScript, Node.js, AWS..." />
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} placeholder="What makes this resume unique..." />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Resume?"
        description="This will remove the resume version. Applications using it will be updated."
        confirmLabel="Delete"
        danger
        onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
