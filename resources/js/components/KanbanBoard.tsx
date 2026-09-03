import { useState } from 'react';
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { updateCandidateStage } from '@/api/candidates';
import { STAGES, STAGE_LABELS, cn } from '@/lib/utils';
import { CandidateCard } from '@/components/CandidateCard';
import { EmptyState } from '@/components/ui/empty-state';
import type { Candidate, Stage } from '@/types';
import { Users } from 'lucide-react';

// ─── Brand-aligned column styles ─────────────────────────────────────────────

const COLUMN_STYLE: Record<Stage, { dot: string; label: string; countBg: string; countText: string; dropActive: string }> = {
  applied:   { dot: '#94a3b8', label: '#64748b', countBg: '#f1f5f9', countText: '#64748b', dropActive: 'bg-slate-50 border-slate-300' },
  interview: { dot: '#B27E55', label: '#7a5c38', countBg: '#f5ede4', countText: '#7a5c38', dropActive: 'bg-[#fdf8f4] border-[#B27E55]' },
  test:      { dot: '#7a6648', label: '#5a4d38', countBg: '#f0ebe4', countText: '#5a4d38', dropActive: 'bg-[#f7f3ef] border-[#7a6648]' },
  offer:     { dot: '#c9a27a', label: '#8a6840', countBg: '#fdf5ec', countText: '#8a6840', dropActive: 'bg-[#fef9f3] border-[#c9a27a]' },
  accepted:  { dot: '#575E44', label: '#3d4430', countBg: '#eef0eb', countText: '#3d4430', dropActive: 'bg-[#f5f6f2] border-[#575E44]' },
  rejected:  { dot: '#c0695a', label: '#8b3d31', countBg: '#fdf0ee', countText: '#8b3d31', dropActive: 'bg-[#fef5f4] border-[#c0695a]' },
};

// ─── Column ───────────────────────────────────────────────────────────────────

function KanbanColumn({ stage, candidates, onCardClick, onAddClick }: {
  stage: Stage;
  candidates: Candidate[];
  onCardClick: (id: number) => void;
  onAddClick: (stage: Stage) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: stage });
  const s = COLUMN_STYLE[stage];

  return (
    <div className="flex flex-col min-w-[270px] w-[270px] flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
          <span className="text-sm font-bold" style={{ color: s.label }}>
            {STAGE_LABELS[stage]}
          </span>
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded-full tabular-nums"
            style={{ backgroundColor: s.countBg, color: s.countText }}
          >
            {candidates.length}
          </span>
        </div>
        <button
          onClick={() => onAddClick(stage)}
          className="h-6 w-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white transition-colors"
          aria-label={`Add to ${STAGE_LABELS[stage]}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-2xl border-2 border-dashed p-2 space-y-2 min-h-[100px] transition-all duration-150',
          'max-h-[calc(100vh-320px)] overflow-y-auto',
          isOver ? s.dropActive : 'border-gray-200 bg-white/50'
        )}
      >
        <SortableContext items={candidates.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {candidates.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-xs font-medium" style={{ color: '#c9b89e' }}>
              Drop here
            </div>
          ) : (
            candidates.map((c) => (
              <CandidateCard key={c.id} candidate={c} onClick={() => onCardClick(c.id)} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}

// ─── Board ────────────────────────────────────────────────────────────────────

export function KanbanBoard({ candidates, onCardClick, onAddClick }: {
  candidates: Candidate[];
  onCardClick: (id: number) => void;
  onAddClick: (stage?: Stage) => void;
}) {
  const queryClient = useQueryClient();
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const stageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: number; stage: string }) => updateCandidateStage(id, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: () => toast.error('Failed to move candidate'),
  });

  const grouped = STAGES.reduce<Record<Stage, Candidate[]>>((acc, stage) => {
    acc[stage] = candidates.filter((c) => c.stage === stage);
    return acc;
  }, {} as Record<Stage, Candidate[]>);

  function handleDragStart({ active }: DragStartEvent) {
    setActiveCandidate(candidates.find((c) => c.id === active.id) ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveCandidate(null);
    if (!over) return;
    const candidateId = active.id as number;
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    let targetStage: Stage | null = null;
    if (STAGES.includes(over.id as Stage)) {
      targetStage = over.id as Stage;
    } else {
      const overCandidate = candidates.find((c) => c.id === over.id);
      if (overCandidate) targetStage = overCandidate.stage;
    }

    if (targetStage && targetStage !== candidate.stage) {
      queryClient.setQueryData<Candidate[]>(['candidates'], (old) =>
        old?.map((c) => (c.id === candidateId ? { ...c, stage: targetStage! } : c)) ?? []
      );
      stageMutation.mutate({ id: candidateId, stage: targetStage });
    }
  }

  if (candidates.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 py-20">
        <EmptyState icon={Users} title="No candidates found" description="Add your first candidate or adjust filters." />
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 pb-4 overflow-x-auto">
        {STAGES.map((stage) => (
          <KanbanColumn key={stage} stage={stage} candidates={grouped[stage]} onCardClick={onCardClick} onAddClick={onAddClick} />
        ))}
      </div>
      <DragOverlay>
        {activeCandidate && (
          <div className="rotate-1 scale-105 shadow-2xl opacity-90">
            <CandidateCard candidate={activeCandidate} onClick={() => {}} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
