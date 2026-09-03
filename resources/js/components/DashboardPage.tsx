import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getCandidates, getRecentActivity } from '@/api/candidates';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Users, UserCheck, UserX, Briefcase, FlaskConical, Gift,
  ClipboardList, ArrowRightLeft, FileText, UserPlus, Pencil,
  Trash2, CircleDot, Clock, ChevronRight, Plus, TrendingUp,
} from 'lucide-react';
import { StageBadge } from '@/components/ui/badge';
import { StarRating } from '@/components/ui/star-rating';
import { Spinner } from '@/components/ui/spinner';
import { formatDate } from '@/lib/utils';
import type { Stage } from '@/types';
import { cn } from '@/lib/utils';

// ─── Brand palette ────────────────────────────────────────────────────────────
const GREEN  = '#575E44';
const BROWN  = '#B27E55';
const CREAM  = '#EEE8E2';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

// warm palette — no blue, no teal
const AVATAR_COLORS = [
  { bg: '#575E44', text: '#fff' },
  { bg: '#B27E55', text: '#fff' },
  { bg: '#7a6648', text: '#fff' },
  { bg: '#8a9270', text: '#fff' },
  { bg: '#c9a27a', text: '#fff' },
];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ─── Stage config — warm neutral palette only ────────────────────────────────
const STAGE_CONFIG: { key: Stage; label: string; icon: React.ElementType; hex: string; light: string }[] = [
  { key: 'applied',   label: 'Applied',   icon: ClipboardList, hex: '#94a3b8', light: '#f1f5f9' },
  { key: 'interview', label: 'Interview', icon: Briefcase,     hex: '#B27E55', light: '#f5ede4' },
  { key: 'test',      label: 'Test',      icon: FlaskConical,  hex: '#7a6648', light: '#f0ebe4' },
  { key: 'offer',     label: 'Offer',     icon: Gift,          hex: '#c9a27a', light: '#fdf5ec' },
  { key: 'accepted',  label: 'Accepted',  icon: UserCheck,     hex: '#575E44', light: '#eef0eb' },
  { key: 'rejected',  label: 'Rejected',  icon: UserX,         hex: '#c0695a', light: '#fdf0ee' },
];

// ─── Activity icon map — warm only ───────────────────────────────────────────
const ACTIVITY_ICON_MAP: Record<string, React.ElementType> = {
  stage_changed: ArrowRightLeft,
  note_added:    FileText,
  note_deleted:  Trash2,
  created:       UserPlus,
  updated:       Pencil,
};

// ─── Summary stat strip ───────────────────────────────────────────────────────
function SummaryStrip({ stats }: { stats: Record<string, number> }) {
  const items = [
    { label: 'Total',     value: stats.total,     icon: Users,         accent: GREEN },
    { label: 'Applied',   value: stats.applied,   icon: ClipboardList, accent: '#94a3b8' },
    { label: 'Interview', value: stats.interview, icon: Briefcase,     accent: BROWN },
    { label: 'Test',      value: stats.test,      icon: FlaskConical,  accent: '#7a6648' },
    { label: 'Offer',     value: stats.offer,     icon: Gift,          accent: '#c9a27a' },
    { label: 'Accepted',  value: stats.accepted,  icon: UserCheck,     accent: GREEN },
    { label: 'Rejected',  value: stats.rejected,  icon: UserX,         accent: '#c0695a' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {items.map(({ label, value, icon: Icon, accent }) => (
        <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: accent + '18' }}>
            <Icon className="h-4 w-4" style={{ color: accent }} />
          </div>
          <div>
            <p className="text-3xl font-bold tabular-nums leading-none text-gray-900">{value ?? 0}</p>
            <p className="text-xs font-medium mt-1.5 text-gray-400">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Pipeline donut ───────────────────────────────────────────────────────────
function PipelineBreakdown({ stats, onNavigate }: { stats: Record<string, number>; onNavigate: () => void }) {
  const total = stats.total || 1;
  const chartData = STAGE_CONFIG
    .map((s) => ({ name: s.label, value: stats[s.key] ?? 0, hex: s.hex, light: s.light }))
    .filter((d) => d.value > 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Pipeline Breakdown</h3>
          <p className="text-xs text-gray-400 mt-0.5">{stats.total ?? 0} candidates total</p>
        </div>
        <button
          onClick={onNavigate}
          className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: BROWN }}
        >
          Pipeline <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Donut — only render when there's data */}
      {chartData.length > 0 ? (
        <div className="h-44 px-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={52} outerRadius={70} paddingAngle={2} dataKey="value" strokeWidth={0}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.hex} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-44 flex items-center justify-center text-xs text-gray-400">No data yet</div>
      )}

      {/* Progress bars */}
      <div className="px-5 pb-5 space-y-2.5 mt-1">
        {STAGE_CONFIG.map(({ key, label, hex }) => {
          const count = stats[key] ?? 0;
          const pct = Math.round((count / total) * 100);
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: hex }} />
                  <span className="text-xs text-gray-600 font-medium">{label}</span>
                </div>
                <span className="text-xs text-gray-500 tabular-nums font-semibold">{count}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: hex }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Recent Activity ──────────────────────────────────────────────────────────
const PAGE_SIZE = 5;

function RecentActivityPanel() {
  const [page, setPage] = useState(0);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: getRecentActivity,
    staleTime: 30_000,
  });

  const totalPages = Math.ceil(activities.length / PAGE_SIZE);
  const paged = activities.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="h-6 w-6 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous"
            >
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            </button>
            <span className="text-[10px] text-gray-400 tabular-nums">{page + 1}/{totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="h-6 w-6 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="px-5 pb-5">
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner size="sm" /></div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2">
            <CircleDot className="h-8 w-8 text-gray-200" />
            <p className="text-xs text-gray-400">No activity yet.</p>
          </div>
        ) : (
          <ol className="space-y-4">
            {paged.map((act, i) => {
              const Icon = ACTIVITY_ICON_MAP[act.type] ?? CircleDot;
              const isLast = i === paged.length - 1;
              const iconStyle = act.type === 'created'       ? { bg: '#eef0eb', color: GREEN }
                               : act.type === 'stage_changed' ? { bg: '#f5ede4', color: BROWN }
                               : act.type === 'note_added'    ? { bg: '#f0ebe4', color: '#7a6648' }
                               : act.type === 'note_deleted'  ? { bg: '#fdf0ee', color: '#c0695a' }
                               :                               { bg: CREAM,      color: '#7a6648' };
              return (
                <li key={act.id} className="relative flex gap-3">
                  {!isLast && <span className="absolute left-3.5 top-7 h-full w-px bg-gray-100" />}
                  <span className="relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: iconStyle.bg }}>
                    <Icon className="h-3.5 w-3.5" style={{ color: iconStyle.color }} />
                  </span>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-xs text-gray-700 leading-snug">
                      <span className="font-semibold text-gray-900">{act.candidate_name}</span>
                      {' — '}{act.description}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {formatDate(act.created_at)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}

// ─── Recent Candidates ────────────────────────────────────────────────────────
function RecentCandidatesPanel({ onViewCandidate, onViewAll }: { onViewCandidate: (id: number) => void; onViewAll: () => void }) {
  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['candidates', { sort_by: 'created_at', sort_dir: 'desc', dashboard: true }],
    queryFn: () => getCandidates({ sort_by: 'created_at', sort_dir: 'desc', search: '', stage: '', rating: '' }),
    staleTime: 30_000,
    select: (data) => data.slice(0, 6),
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Recent Candidates</h3>
          <p className="text-xs text-gray-400 mt-0.5">Latest additions to your pipeline</p>
        </div>
        <button onClick={onViewAll} className="flex items-center gap-1 text-xs font-semibold" style={{ color: BROWN }}>
          View all <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="px-5 pb-5">
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner size="sm" /></div>
        ) : candidates.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2">
            <Users className="h-8 w-8 text-gray-200" />
            <p className="text-xs text-gray-400">No candidates yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {candidates.map((c) => {
              const av = avatarColor(c.name);
              return (
                <button key={c.id} onClick={() => onViewCandidate(c.id)} className="w-full flex items-center gap-3 py-3 text-left group">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: av.bg, color: av.text }}>
                    {getInitials(c.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#575E44] transition-colors">{c.name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.position}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StageBadge stage={c.stage} />
                    {c.rating && <StarRating value={c.rating} readonly size="sm" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
function QuickActions({ onAddCandidate, onNavigatePipeline }: { onAddCandidate: () => void; onNavigatePipeline: () => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={onAddCandidate}
        className="flex flex-col gap-3 text-white rounded-2xl p-5 text-left transition-all active:scale-[0.98] shadow-sm"
        style={{ backgroundColor: GREEN }}
      >
        <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
          <Plus className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold">Add Candidate</p>
          <p className="text-xs text-white/65 mt-0.5">Add to pipeline</p>
        </div>
      </button>

      <button
        onClick={onNavigatePipeline}
        className="flex flex-col gap-3 bg-white border border-gray-100 rounded-2xl p-5 text-left transition-all hover:bg-gray-50 active:scale-[0.98] shadow-sm"
      >
        <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: CREAM }}>
          <TrendingUp className="h-5 w-5" style={{ color: BROWN }} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">View Pipeline</p>
          <p className="text-xs text-gray-400 mt-0.5">Kanban board</p>
        </div>
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
interface DashboardPageProps {
  onViewCandidate: (id: number) => void;
  onAddCandidate: () => void;
  onNavigate: (page: string) => void;
}

export function DashboardPage({ onViewCandidate, onAddCandidate, onNavigate }: DashboardPageProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: getDashboardStats,
    staleTime: 30_000,
  });

  const s = (stats ?? { total: 0, applied: 0, interview: 0, test: 0, offer: 0, accepted: 0, rejected: 0 }) as unknown as Record<string, number>;

  return (
    <div className="space-y-6">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your hiring pipeline at a glance.</p>
        </div>
        <button
          onClick={onAddCandidate}
          className="hidden sm:flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          style={{ backgroundColor: GREEN }}
        >
          <Plus className="h-4 w-4" />
          Add Candidate
        </button>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 h-24 animate-pulse" />
          ))}
        </div>
      ) : <SummaryStrip stats={s} />}

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          <QuickActions onAddCandidate={onAddCandidate} onNavigatePipeline={() => onNavigate('pipeline')} />
          <RecentCandidatesPanel onViewCandidate={onViewCandidate} onViewAll={() => onNavigate('candidates')} />
        </div>
        {/* Right 1/3 */}
        <div className="space-y-5">
          <PipelineBreakdown stats={s} onNavigate={() => onNavigate('pipeline')} />
          <RecentActivityPanel />
        </div>
      </div>
    </div>
  );
}
