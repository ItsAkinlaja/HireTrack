import { useState, useEffect } from 'react';
import { useState, useEffect } from 'react';
import { Search, Bell, Menu, Plus } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { DashboardPage } from '@/components/DashboardPage';
import { CandidatesPage } from '@/components/CandidatesPage';
import { CandidateForm } from '@/components/CandidateForm';
import { CandidateDetail } from '@/components/CandidateDetail';
import { FilterBar } from '@/components/FilterBar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { getCandidates } from '@/api/candidates';
import { logout as apiLogout } from '@/api/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import type { FilterState, Stage } from '@/types';

interface AuthUser { id: number; name: string; email: string; }

type Page = 'dashboard' | 'candidates' | 'pipeline';

export default function HireTrackApp({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const queryClient = useQueryClient();
  const [page, setPage]                 = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [formOpen, setFormOpen]         = useState(false);
  const [defaultStage, setDefaultStage] = useState<Stage | undefined>();
  const [detailId, setDetailId]         = useState<number | null>(null);

  function openAdd(stage?: Stage) {
    setDefaultStage(stage);
    setFormOpen(true);
  }

  function handleViewCandidate(id: number) {
    if (id < 0) setPage('candidates');
    else setDetailId(id);
  }

  async function handleLogout() {
    try { await apiLogout(); } catch { /* ignore */ }
    queryClient.clear();
    onLogout();
    toast.success('Logged out successfully');
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#EEE8E2' }}>

      {/* Desktop sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar activePage={page} onNavigate={(p) => setPage(p as Page)} user={user} onLogout={handleLogout} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10">
            <Sidebar activePage={page} onNavigate={(p) => { setPage(p as Page); setSidebarOpen(false); }} user={user} onLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-56">

        {/* Topbar */}
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-gray-100 flex items-center px-5 sm:px-8 gap-4 shadow-sm">
          <button className="lg:hidden text-gray-500 hover:text-gray-700 mr-1" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1 flex items-center gap-4">
            {/* Page label on mobile */}
            <h2 className="sm:hidden text-base font-bold text-gray-900 capitalize">{page}</h2>
            {/* Search — desktop */}
            <div className="relative hidden sm:block max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                placeholder="Search candidates..."
                className="w-full pl-9 pr-4 h-9 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all cursor-pointer"
                style={{ '--tw-ring-color': '#575E4433' } as any}
                readOnly
                onClick={() => setPage('candidates')}
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            <button className="relative h-9 w-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>
            <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold select-none cursor-pointer" style={{ background: 'linear-gradient(135deg, #575E44 0%, #B27E55 100%)' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 px-5 sm:px-8 py-7 overflow-auto">
          {page === 'dashboard' && (
            <DashboardPage
              onViewCandidate={handleViewCandidate}
              onAddCandidate={() => openAdd()}
              onNavigate={setPage}
            />
          )}
          {page === 'candidates' && (
            <CandidatesPage
              onCardClick={(id) => setDetailId(id)}
              onAddClick={openAdd}
            />
          )}
          {page === 'pipeline' && (
            <PipelinePage
              onCardClick={(id) => setDetailId(id)}
              onAddClick={openAdd}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <CandidateForm
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) setDefaultStage(undefined); }}
        defaultStage={defaultStage}
      />
      {detailId !== null && (
        <CandidateDetail candidateId={detailId} onClose={() => setDetailId(null)} />
      )}
    </div>
  );
}

// ─── Pipeline page ────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: FilterState = {
  search: '', stage: '', rating: '', sort_by: 'created_at', sort_dir: 'desc',
};

function PipelinePage({
  onCardClick,
  onAddClick,
}: {
  onCardClick: (id: number) => void;
  onAddClick: (s?: Stage) => void;
}) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(filters.search), 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  const qf = { ...filters, search: debounced };

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['candidates', qf],
    queryFn: () => getCandidates(qf),
    staleTime: 15_000,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pipeline</h1>
          <p className="text-sm text-gray-400 mt-0.5">Drag candidates across stages to move them forward.</p>
        </div>
        <Button
          onClick={() => onAddClick()}
          className="bg-[#575E44] hover:bg-[#4a5139] rounded-xl shadow-sm shadow-[#575E44]/20 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Candidate
        </Button>
      </div>
      <FilterBar filters={filters} onChange={setFilters} totalCount={candidates.length} />
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <KanbanBoard candidates={candidates} onCardClick={onCardClick} onAddClick={onAddClick} />
      )}
    </div>
  );
}
