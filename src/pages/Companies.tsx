import { useState, useMemo } from 'react';
import { Plus, Building2, Globe, MapPin, Pencil, Trash2 } from 'lucide-react';
import { useCompanyStore } from '../stores/companyStore';
import { useApplicationStore } from '../stores/applicationStore';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { EmptyState, ConfirmDialog } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';
import type { Company } from '../types';

export function Companies() {
  const { companies, add, update, remove } = useCompanyStore();
  const applications = useApplicationStore((s) => s.applications);
  const [showAdd, setShowAdd] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    name: '', website: '', industry: '', location: '', size: '', notes: '',
  });

  const filtered = useMemo(() =>
    companies.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase())),
    [companies, search]
  );

  const getAppCount = (companyId: string) =>
    applications.filter((a) => a.companyId === companyId).length;

  const openEdit = (c: Company) => {
    setForm({ name: c.name, website: c.website ?? '', industry: c.industry ?? '', location: c.location ?? '', size: c.size ?? '', notes: c.notes ?? '' });
    setEditCompany(c);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editCompany) {
      update(editCompany.id, form as any);
      setEditCompany(null);
    } else {
      add(form as any);
      setShowAdd(false);
    }
    setForm({ name: '', website: '', industry: '', location: '', size: '', notes: '' });
  };

  const SIZE_COLORS: Record<string, string> = {
    startup: 'bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold',
    small: 'bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold',
    medium: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold',
    large: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold',
    enterprise: 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold',
  };

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Companies</h1>
          <p className="text-sm text-slate-400">{companies.length} companies tracked</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setShowAdd(true)}>
          Add Company
        </Button>
      </div>

      <Input placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 size={24} />}
          title="No companies yet"
          description="Add companies you're targeting to track research and contacts."
          action={{ label: '+ Add Company', onClick: () => setShowAdd(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((company) => {
            const appCount = getAppCount(company.id);
            return (
              <Card key={company.id} className="group hover:border-indigo-500/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-base">
                      {company.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{company.name}</h3>
                      {company.industry && <p className="text-xs text-slate-500 dark:text-slate-400">{company.industry}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 items-center shrink-0">
                    <button
                      onClick={() => openEdit(company)}
                      className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Company"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteId(company.id)}
                      className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Delete Company"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 mb-3">
                  {company.location && (
                    <p className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin size={11} className="text-slate-500" /> {company.location}
                    </p>
                  )}
                  {company.website && (
                    <p className="flex items-center gap-2 text-xs text-slate-400 truncate">
                      <Globe size={11} className="text-slate-500" />
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 truncate" onClick={(e) => e.stopPropagation()}>
                        {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  {company.size && <Badge className={cn('capitalize', SIZE_COLORS[company.size] ?? '')}>{company.size}</Badge>}
                  <span className="ml-auto text-xs text-slate-500">{appCount} application{appCount !== 1 ? 's' : ''}</span>
                </div>

                {company.notes && (
                  <p className="mt-2 text-xs text-slate-500 line-clamp-2">{company.notes}</p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showAdd || !!editCompany} onClose={() => { setShowAdd(false); setEditCompany(null); }} title={editCompany ? 'Edit Company' : 'Add Company'} footer={
        <>
          <Button variant="ghost" onClick={() => { setShowAdd(false); setEditCompany(null); }}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>{editCompany ? 'Save' : 'Add Company'}</Button>
        </>
      }>
        <div className="space-y-4">
          <Input label="Company Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Google, Microsoft..." />
          <Input label="Website" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} placeholder="https://..." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Industry" value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} placeholder="e.g. SaaS, FinTech..." />
            <Input label="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="City, Country" />
          </div>
          <Select label="Company Size" value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))} options={[
            { value: '', label: '— Select Size —' },
            { value: 'startup', label: 'Startup (1-10)' },
            { value: 'small', label: 'Small (11-50)' },
            { value: 'medium', label: 'Medium (51-200)' },
            { value: 'large', label: 'Large (201-1000)' },
            { value: 'enterprise', label: 'Enterprise (1000+)' },
          ]} />
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Culture, tech stack, contacts, things to remember..." />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Company?"
        description="This will remove the company from your list. Applications will not be deleted."
        confirmLabel="Delete"
        danger
        onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
