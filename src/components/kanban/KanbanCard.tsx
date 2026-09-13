import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MapPin, Calendar, ArrowRight, AlertTriangle, Flame, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCompanyStore } from '../../stores/companyStore';
import { cn, formatDate, daysUntil, deadlineLabel } from '../../lib/utils';
import { PRIORITY_COLORS } from '../../lib/constants';
import type { Application } from '../../types';

interface KanbanCardProps {
  application: Application;
}

export function KanbanCard({ application }: KanbanCardProps) {
  const navigate = useNavigate();
  const getCompany = useCompanyStore((s) => s.getById);
  const company = getCompany(application.companyId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const days = daysUntil(application.applicationDeadline);
  const dl = deadlineLabel(days);

  const PriorityIcon = application.priority === 'high' ? Flame :
    application.priority === 'medium' ? ArrowRight : Minus;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group rounded-xl border p-3 cursor-grab active:cursor-grabbing shadow-sm',
        'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800/60',
        'hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:shadow-md transition-all duration-150',
        isSortableDragging && 'opacity-40 border-indigo-500/60 shadow-lg'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{application.jobTitle}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{company?.name ?? '—'}</p>
        </div>
        <PriorityIcon
          size={14}
          className={cn('shrink-0 mt-0.5', PRIORITY_COLORS[application.priority])}
        />
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-500">
        {application.location && (
          <span className="flex items-center gap-1">
            <MapPin size={10} /> {application.location}
          </span>
        )}
        {application.appliedAt && (
          <span className="flex items-center gap-1">
            <Calendar size={10} /> {formatDate(application.appliedAt, { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {/* Deadline warning */}
      {days !== null && days <= 3 && (
        <div className={cn('mt-2 flex items-center gap-1 text-xs font-medium', dl.color)}>
          <AlertTriangle size={10} />
          {dl.label}
        </div>
      )}

      {/* Work mode chip */}
      <div className="mt-2 flex items-center gap-1.5">
        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase tracking-wide font-medium">
          {application.workMode}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/applications/${application.id}`); }}
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          View →
        </button>
      </div>
    </div>
  );
}
