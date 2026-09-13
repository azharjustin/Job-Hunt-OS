import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Briefcase, Flame, Minus, ArrowRight, Edit2, Trash2 } from 'lucide-react';
import { useApplicationStore } from '../stores/applicationStore';
import { useCompanyStore } from '../stores/companyStore';
import { Modal } from '../components/ui/Modal';
import { ApplicationForm } from '../components/applications/ApplicationForm';
import { StatusBadge } from '../components/applications/StatusBadge';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { EmptyState, ConfirmDialog } from '../components/ui/EmptyState';
import { cn, formatDate, formatSalary, daysUntil, deadlineLabel } from '../lib/utils';
import type { Application } from '../types';

export function Applications() {
  const navigate = useNavigate();
  const { applications, filters, setFilters, remove } = useApplicationStore();
  const getCompany = useCompanyStore((s) => s.getById);

  const [showAdd, setShowAdd] = useState(false);
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      if (filters.status !== 'all' && a.status !== filters.status) return false;
      if (filters.priority !== 'all' && a.priority !== filters.priority) return false;
      if (filters.workMode !== 'all' && a.workMode !== filters.workMode) return false;
      if (filters.employmentType !== 'all' && a.employmentType !== filters.employmentType) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const comp = getCompany(a.companyId);
        const matchTitle = a.jobTitle.toLowerCase().includes(q);
        const matchCompany = comp?.name.toLowerCase().includes(q) ?? false;
        const matchNotes = a.notes?.toLowerCase().includes(q) ?? false;
        return matchTitle || matchCompany || matchNotes;
      }
      return true;
    });
  }, [applications, filters, getCompany]);

  const PriorityIcon = (priority: Application['priority']) => {
    switch (priority) {
      case 'high':
        return <span className="flex items-center gap-1 text-red-500 font-medium text-xs"><Flame size={12} /> High</span>;
      case 'medium':
        return <span className="flex items-center gap-1 text-amber-500 font-medium text-xs"><ArrowRight size={12} /> Med</span>;
      case 'low':
        return <span className="flex items-center gap-1 text-slate-400 font-medium text-xs"><Minus size={12} /> Low</span>;
    }
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in max-w-7xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Applications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filtered.length} of {applications.length} applications
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
          Add Application
        </Button>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder="Search by job title or company..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              icon={<Search size={14} />}
            />
          </div>
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            size="md"
            icon={<Filter size={14} />}
            onClick={() => setShowFilters((f) => !f)}
          >
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/60 shadow-xs">
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value as any })}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'saved', label: 'Saved' },
                { value: 'applied', label: 'Applied' },
                { value: 'screening', label: 'Screening' },
                { value: 'interview', label: 'Interview' },
                { value: 'offer', label: 'Offer' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'withdrawn', label: 'Withdrawn' },
              ]}
            />
            <Select
              label="Priority"
              value={filters.priority}
              onChange={(e) => setFilters({ priority: e.target.value })}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
            />
            <Select
              label="Work Mode"
              value={filters.workMode}
              onChange={(e) => setFilters({ workMode: e.target.value })}
              options={[
                { value: 'all', label: 'All Modes' },
                { value: 'remote', label: 'Remote' },
                { value: 'hybrid', label: 'Hybrid' },
                { value: 'onsite', label: 'On-site' },
              ]}
            />
            <Select
              label="Type"
              value={filters.employmentType}
              onChange={(e) => setFilters({ employmentType: e.target.value })}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'full-time', label: 'Full-time' },
                { value: 'part-time', label: 'Part-time' },
                { value: 'contract', label: 'Contract' },
                { value: 'internship', label: 'Internship' },
              ]}
            />
          </div>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={24} />}
          title="No applications found"
          description="Start tracking your job search by adding your first application."
          action={{ label: '+ Add Application', onClick: () => setShowAdd(true) }}
        />
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 overflow-hidden bg-white dark:bg-slate-900/60 shadow-xs">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
              <tr>
                {['Job Title', 'Company', 'Status', 'Priority', 'Mode', 'Salary', 'Deadline', 'Applied'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40">
              {filtered.map((app) => {
                const company = getCompany(app.companyId);
                const days = daysUntil(app.applicationDeadline);
                const dl = deadlineLabel(days);
                return (
                  <tr
                    key={app.id}
                    onClick={() => navigate(`/applications/${app.id}`)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 max-w-48 truncate">{app.jobTitle}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-32 truncate">{company?.name ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                    <td className="px-4 py-3">{PriorityIcon(app.priority)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 uppercase font-medium">{app.workMode}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap font-medium">
                      {formatSalary(app.salaryMin, app.salaryMax, app.salaryCurrency)}
                    </td>
                    <td className="px-4 py-3">
                      {app.applicationDeadline ? (
                        <span className={cn('text-xs font-medium', dl.color)}>{dl.label}</span>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap font-medium">
                      {app.appliedAt ? formatDate(app.appliedAt, { month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditApp(app); }}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteId(app.id); }}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 transition-all flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={showAdd || !!editApp} onClose={() => { setShowAdd(false); setEditApp(null); }} title={editApp ? 'Edit Application' : 'Add Application'} size="lg">
        <ApplicationForm
          initial={editApp ?? undefined}
          onSuccess={() => { setShowAdd(false); setEditApp(null); }}
          onCancel={() => { setShowAdd(false); setEditApp(null); }}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Application?"
        description="This will permanently remove the application and all associated data."
        confirmLabel="Delete"
        danger
        onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
