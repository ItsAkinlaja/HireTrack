import { Search, X, ArrowUpDown, SlidersHorizontal, Star } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STAGES, STAGE_LABELS } from '@/lib/utils';
import type { FilterState } from '@/types';
import { cn } from '@/lib/utils';

const GREEN = '#575E44';
const BROWN = '#B27E55';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalCount: number;
}

export function FilterBar({ filters, onChange, totalCount }: FilterBarProps) {
  function update(partial: Partial<FilterState>) {
    onChange({ ...filters, ...partial });
  }

  const hasActiveFilters = !!(filters.search || filters.stage || filters.rating);

  function clearFilters() {
    onChange({ search: '', stage: '', rating: '', sort_by: 'created_at', sort_dir: 'desc' });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
          <input
            type="text"
            placeholder="Search candidates…"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="w-full pl-10 pr-9 h-9 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all"
            style={{ '--tw-ring-color': GREEN + '33' } as any}
          />
          {filters.search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => update({ search: '' })}
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Separator */}
        <div className="h-5 w-px bg-gray-200 hidden sm:block" />

        {/* Stage */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <Select value={filters.stage || 'all'} onValueChange={(v) => update({ stage: v === 'all' ? '' : v as any })}>
            <SelectTrigger
              className="h-9 text-sm rounded-xl border-gray-200 bg-gray-50 transition-colors"
              style={filters.stage ? { borderColor: BROWN, backgroundColor: '#fdf8f4', color: '#7a5c38', fontWeight: 600, width: '9rem' } : { width: '8rem' }}
            >
              <SelectValue placeholder="All stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {STAGES.map((s) => <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Rating */}
        <Select value={filters.rating ? String(filters.rating) : 'all'} onValueChange={(v) => update({ rating: v === 'all' ? '' : Number(v) })}>
          <SelectTrigger
            className="h-9 text-sm rounded-xl border-gray-200 bg-gray-50 transition-colors"
            style={filters.rating ? { borderColor: '#c9a27a', backgroundColor: '#fdf5ec', color: '#8a6840', fontWeight: 600, width: '8.5rem' } : { width: '7.5rem' }}
          >
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any rating</SelectItem>
            {[5, 4, 3, 2, 1].map((n) => (
              <SelectItem key={n} value={String(n)}>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('h-3 w-3', i < n ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200')} />
                  ))}
                  <span className="ml-1.5 text-gray-600 text-xs">{n} {n === 1 ? 'star' : 'stars'}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Separator */}
        <div className="h-5 w-px bg-gray-200 hidden sm:block" />

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <Select
            value={`${filters.sort_by}:${filters.sort_dir}`}
            onValueChange={(v) => {
              const [sort_by, sort_dir] = v.split(':') as [FilterState['sort_by'], FilterState['sort_dir']];
              update({ sort_by, sort_dir });
            }}
          >
            <SelectTrigger className="h-9 w-36 text-sm border-gray-200 bg-gray-50 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at:desc">Newest first</SelectItem>
              <SelectItem value="created_at:asc">Oldest first</SelectItem>
              <SelectItem value="rating:desc">Highest rated</SelectItem>
              <SelectItem value="rating:asc">Lowest rated</SelectItem>
              <SelectItem value="name:asc">Name A–Z</SelectItem>
              <SelectItem value="name:desc">Name Z–A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Count + clear */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400 tabular-nums whitespace-nowrap">
            {totalCount} {totalCount === 1 ? 'candidate' : 'candidates'}
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
