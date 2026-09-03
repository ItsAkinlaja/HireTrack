import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, GripVertical } from 'lucide-react';
import { StarRating } from '@/components/ui/star-rating';
import type { Candidate } from '@/types';
import { cn } from '@/lib/utils';

// ─── Brand palette ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: '#eef0eb', text: '#575E44' },
  { bg: '#f5ede4', text: '#B27E55' },
  { bg: '#e8e2d9', text: '#7a6648' },
  { bg: '#f0ebe4', text: '#8a7256' },
  { bg: '#f7f3ef', text: '#B27E55' },
];

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function getAvatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

interface CandidateCardProps {
  candidate: Candidate;
  onClick: () => void;
  isDragging?: boolean;
}

export function CandidateCard({ candidate, onClick, isDragging }: CandidateCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } =
    useSortable({ id: candidate.id });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const av = getAvatarColor(candidate.name);
  const noteCount = candidate.notes?.length ?? 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer',
        'hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5',
        'transition-all duration-150 select-none',
        (isDragging || isSortableDragging) && 'opacity-40 shadow-xl scale-105'
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`View ${candidate.name}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-3 right-3 p-0.5 text-gray-300 hover:text-gray-500 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        aria-label="Drag"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: av.bg, color: av.text }}
        >
          {getInitials(candidate.name)}
        </div>
        <div className="min-w-0 flex-1 pr-5">
          <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
            {candidate.name}
          </p>
          <p className="text-xs text-gray-400 truncate leading-tight mt-0.5">
            {candidate.position}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {candidate.rating ? (
          <StarRating value={candidate.rating} readonly size="sm" />
        ) : (
          <span className="text-[11px] text-gray-300">No rating</span>
        )}
        {noteCount > 0 && (
          <div className="flex items-center gap-1 rounded-lg px-1.5 py-0.5" style={{ background: '#f5ede4' }}>
            <MessageSquare className="h-3 w-3" style={{ color: '#B27E55' }} />
            <span className="text-[11px] font-semibold" style={{ color: '#B27E55' }}>{noteCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}
