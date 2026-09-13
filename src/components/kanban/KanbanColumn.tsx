import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { KanbanCard } from './KanbanCard';
import { STATUS_LABELS, STATUS_COLORS } from '../../lib/constants';
import { cn } from '../../lib/utils';
import type { Application, ApplicationStatus } from '../../types';

interface KanbanColumnProps {
  status: ApplicationStatus;
  applications: Application[];
  onAddCard?: () => void;
}

export function KanbanColumn({ status, applications, onAddCard }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column Header */}
      <div className={cn(
        'flex items-center justify-between px-3 py-2.5 rounded-t-xl border border-b-0',
        'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800/60 shadow-sm'
      )}>
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', STATUS_COLORS[status].split(' ')[0].replace('bg-', 'bg-').replace('/20', ''))} />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {STATUS_LABELS[status]}
          </span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            {applications.length}
          </span>
        </div>
        {onAddCard && (
          <button
            onClick={onAddCard}
            className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={`Add ${STATUS_LABELS[status]} application`}
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* Column Body (Drop Zone) */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-2 rounded-b-xl border border-slate-200 dark:border-slate-800/60 bg-slate-100/60 dark:bg-slate-900/40 min-h-40',
          'transition-colors duration-150',
          isOver && 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-500/40'
        )}
      >
        <SortableContext
          items={applications.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {applications.map((app) => (
              <KanbanCard key={app.id} application={app} />
            ))}
          </div>
        </SortableContext>
        {applications.length === 0 && (
          <div className="flex items-center justify-center h-32 text-xs text-slate-400 dark:text-slate-600 text-center font-medium">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
