import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Users } from 'lucide-react';
import { getCandidates } from '@/api/candidates';
import { Button } from '@/components/ui/button';
import { FilterBar } from '@/components/FilterBar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { Spinner } from '@/components/ui/spinner';
import type { FilterState, Stage } from '@/types';

const DEFAULT_FILTERS: FilterState = {
  search: '', stage: '', rating: '', sort_by: 'created_at', sort_dir: 'desc',
};

interface CandidatesPageProps {
  onCardClick: (id: number) => void;
  onAddClick: (stage?: Stage) => void;
  defaultDetailId?: number | null;
}

export function CandidatesPage({ onCardClick, onAddClick }: CandidatesPageProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(filters.search), 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  const qf = { ...filters, search: debounced };

  const { data: candidates = [], isLoading, isError } = useQuery({
    queryKey: ['candidates', qf],
    queryFn: () => getCandidates(qf),
    staleTime: 15_000,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Candidates</h1>
        <Button onClick={() => onAddClick()} className="bg-[#575E44] hover:bg-[#4a5139] rounded-xl shadow-sm shadow-[#575E44]/20 gap-1.5">
          <Plus className="h-4 w-4" />
          Add Candidate
        </Button>
      </div>

      <FilterBar filters={filters} onChange={setFilters} totalCount={candidates.length} />

      <div>
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-center py-24 gap-3 text-gray-400">
            <Spinner size="md" />
            <span className="text-sm">Loading candidates…</span>
          </div>
        ) : isError ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center">
              <Users className="h-6 w-6 text-red-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-800">Could not load candidates</p>
              <p className="text-xs text-gray-400 mt-1">Make sure <code className="bg-gray-100 px-1 rounded text-gray-600">php artisan serve</code> is running.</p>
            </div>
          </div>
        ) : (
          <KanbanBoard candidates={candidates} onCardClick={onCardClick} onAddClick={onAddClick} />
        )}
      </div>
    </div>
  );
}
