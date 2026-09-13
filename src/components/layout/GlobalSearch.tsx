import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Briefcase, Building2, FileText, Calendar } from 'lucide-react';
import { useApplicationStore } from '../../stores/applicationStore';
import { useCompanyStore } from '../../stores/companyStore';
import { useResumeStore } from '../../stores/resumeStore';
import { useInterviewStore } from '../../stores/interviewStore';

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const applications = useApplicationStore((s) => s.applications);
  const companies = useCompanyStore((s) => s.companies);
  const resumes = useResumeStore((s) => s.resumes);
  const interviews = useInterviewStore((s) => s.interviews);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) onClose();
      }
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const q = query.toLowerCase();

  const results = query.trim()
    ? [
        ...applications
          .filter((a) => a.jobTitle.toLowerCase().includes(q))
          .slice(0, 4)
          .map((a) => ({ type: 'application' as const, id: a.id, title: a.jobTitle, sub: '', path: `/applications/${a.id}` })),
        ...companies
          .filter((c) => c.name.toLowerCase().includes(q))
          .slice(0, 3)
          .map((c) => ({ type: 'company' as const, id: c.id, title: c.name, sub: c.industry ?? '', path: `/companies/${c.id}` })),
        ...resumes
          .filter((r) => r.name.toLowerCase().includes(q) || r.role.toLowerCase().includes(q))
          .slice(0, 2)
          .map((r) => ({ type: 'resume' as const, id: r.id, title: r.name, sub: r.role, path: `/resumes` })),
        ...interviews
          .filter((i) => i.type.toLowerCase().includes(q))
          .slice(0, 2)
          .map((i) => ({ type: 'interview' as const, id: i.id, title: `${i.type} Interview`, sub: '', path: `/interviews` })),
      ]
    : [];

  const icon = { application: Briefcase, company: Building2, resume: FileText, interview: Calendar };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search applications, companies, resumes..."
            className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 text-sm outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-500 hover:text-slate-300">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="py-2 max-h-96 overflow-y-auto">
            {results.map((r) => {
              const Icon = icon[r.type];
              return (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => { navigate(r.path); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/60 text-left transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                    <Icon size={13} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{r.title}</p>
                    {r.sub && <p className="text-xs text-slate-500 truncate">{r.sub}</p>}
                  </div>
                  <span className="text-[10px] text-slate-600 capitalize">{r.type}</span>
                </button>
              );
            })}
          </div>
        )}
        {query && results.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-500">No results for "{query}"</div>
        )}
        {!query && (
          <div className="py-6 text-center text-xs text-slate-600">Type to search across your job hunt data</div>
        )}

        <div className="px-4 py-2 border-t border-slate-800 flex gap-4 text-[10px] text-slate-600">
          <span>↵ to navigate</span>
          <span>ESC to close</span>
          <span>⌘K to toggle</span>
        </div>
      </div>
    </div>
  );
}
