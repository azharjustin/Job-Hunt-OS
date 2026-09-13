import { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { useApplicationStore } from '../stores/applicationStore';
import { KanbanColumn } from '../components/kanban/KanbanColumn';
import { KanbanCard } from '../components/kanban/KanbanCard';
import { Modal } from '../components/ui/Modal';
import { ApplicationForm } from '../components/applications/ApplicationForm';
import { Button } from '../components/ui/Button';
import { KANBAN_COLUMNS } from '../lib/constants';
import type { Application, ApplicationStatus } from '../types';

export function KanbanBoard() {
  const { applications, updateStatus } = useApplicationStore();
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addStatus, setAddStatus] = useState<ApplicationStatus>('saved');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Group applications by status, maintain order
  const columnApps = useMemo(() => {
    const groups: Record<ApplicationStatus, Application[]> = {
      saved: [], applied: [], screening: [], interview: [], offer: [], rejected: [], withdrawn: [],
    };
    applications.forEach((a) => {
      if (groups[a.status]) groups[a.status].push(a);
    });
    return groups;
  }, [applications]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const app = applications.find((a) => a.id === event.active.id);
    setActiveApp(app ?? null);
  }, [applications]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeApp = applications.find((a) => a.id === activeId);
    if (!activeApp) return;

    // If dropping on a column
    const isColumn = KANBAN_COLUMNS.includes(overId as ApplicationStatus);
    if (isColumn && activeApp.status !== overId) {
      updateStatus(activeId, overId as ApplicationStatus);
    }
  }, [applications, updateStatus]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveApp(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeApp = applications.find((a) => a.id === activeId);
    const overApp = applications.find((a) => a.id === overId);

    if (overApp && activeApp && activeApp.status !== overApp.status) {
      updateStatus(activeId, overApp.status);
    }
  }, [applications, updateStatus]);

  const handleAddToColumn = (status: ApplicationStatus) => {
    setAddStatus(status);
    setShowAdd(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Kanban Board</h1>
          <p className="text-sm text-slate-400">{applications.length} applications</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setShowAdd(true)}>
          Add Application
        </Button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full pb-4" style={{ minWidth: 'max-content' }}>
            {KANBAN_COLUMNS.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                applications={columnApps[status]}
                onAddCard={() => handleAddToColumn(status)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeApp ? (
              <div className="rotate-2 opacity-95">
                <KanbanCard application={activeApp} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Application" size="lg">
        <ApplicationForm
          initial={{ status: addStatus }}
          onSuccess={() => setShowAdd(false)}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  );
}
