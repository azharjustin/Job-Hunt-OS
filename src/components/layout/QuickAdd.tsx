import { useState } from 'react';
import { Briefcase, Building2, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { ApplicationForm } from '../applications/ApplicationForm';
import { useCompanyStore } from '../../stores/companyStore';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

type QuickAddType = 'application' | 'company' | null;

interface QuickAddProps {
  open: boolean;
  onClose: () => void;
}

export function QuickAdd({ open, onClose }: QuickAddProps) {
  const [type, setType] = useState<QuickAddType>(null);
  const addCompany = useCompanyStore((s) => s.add);
  const [companyName, setCompanyName] = useState('');

  if (!open) return null;

  if (type === 'application') {
    return (
      <Modal open title="Add Application" onClose={() => { setType(null); onClose(); }} size="lg">
        <ApplicationForm
          onSuccess={() => { setType(null); onClose(); }}
          onCancel={() => setType(null)}
        />
      </Modal>
    );
  }

  if (type === 'company') {
    return (
      <Modal
        open
        title="Add Company"
        onClose={() => { setType(null); onClose(); }}
        footer={
          <>
            <Button variant="ghost" onClick={() => setType(null)}>Back</Button>
            <Button variant="primary" onClick={() => {
              if (companyName.trim()) {
                addCompany({ name: companyName.trim() });
                setCompanyName('');
                setType(null);
                onClose();
              }
            }}>Add Company</Button>
          </>
        }
      >
        <Input
          label="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g. Google, Microsoft..."
          autoFocus
        />
      </Modal>
    );
  }

  const actions = [
    { type: 'application' as const, icon: Briefcase, label: 'Application', desc: 'Track a new job application' },
    { type: 'company' as const, icon: Building2, label: 'Company', desc: 'Add a company to research' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-100">Quick Add</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-2">
          {actions.map(({ type: t, icon: Icon, label, desc }) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/60 transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">+ {label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-[10px] text-slate-600">Press Ctrl+K to open from anywhere</p>
      </div>
    </div>
  );
}
