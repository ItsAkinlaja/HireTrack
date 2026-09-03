import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  X, Mail, Phone, ExternalLink, Calendar, Edit2, Trash2,
  Plus, Clock, MessageSquare, Activity as ActivityIcon,
  ArrowRightLeft, FileText, UserPlus, Pencil, CircleDot,
} from 'lucide-react';
import {
  getCandidate, getNotes, getActivities, createNote, deleteNote,
  deleteCandidate, updateCandidateStage,
} from '@/api/candidates';
import { STAGES, STAGE_LABELS, formatDate, formatDateTime } from '@/lib/utils';
import { StageBadge } from '@/components/ui/badge';
import { StarRating } from '@/components/ui/star-rating';
import { Spinner } from '@/components/ui/spinner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CandidateForm } from '@/components/CandidateForm';
import type { Stage } from '@/types';
import { cn } from '@/lib/utils';

const GREEN = '#575E44';
const BROWN = '#B27E55';
const CREAM = '#EEE8E2';

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function activityIconFor(type: string) {
  switch (type) {
    case 'stage_changed': return ArrowRightLeft;
    case 'note_added':    return FileText;
    case 'note_deleted':  return Trash2;
    case 'created':       return UserPlus;
    case 'updated':       return Pencil;
    default:              return CircleDot;
  }
}

function activityStyle(type: string) {
  switch (type) {
    case 'created':       return { bg: '#eef0eb', color: GREEN };
    case 'stage_changed': return { bg: '#f5ede4', color: BROWN };
    case 'note_added':    return { bg: '#f0ebe4', color: '#7a6648' };
    case 'note_deleted':  return { bg: '#fdf0ee', color: '#c0695a' };
    default:              return { bg: CREAM,     color: '#7a6648' };
  }
}

interface CandidateDetailProps {
  candidateId: number;
  onClose: () => void;
}

type Tab = 'notes' | 'activity';

export function CandidateDetail({ candidateId, onClose }: CandidateDetailProps) {
  const queryClient = useQueryClient();
  const [tab, setTab]             = useState<Tab>('notes');
  const [noteText, setNoteText]   = useState('');
  const [editOpen, setEditOpen]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [noteDeleteId, setNoteDeleteId] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: candidate, isLoading } = useQuery({
    queryKey: ['candidate', candidateId],
    queryFn: () => getCandidate(candidateId),
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['notes', candidateId],
    queryFn: () => getNotes(candidateId),
    enabled: !!candidate,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities', candidateId],
    queryFn: () => getActivities(candidateId),
    enabled: !!candidate,
  });

  const stageMutation = useMutation({
    mutationFn: (stage: string) => updateCandidateStage(candidateId, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidate', candidateId] });
      queryClient.invalidateQueries({ queryKey: ['activities', candidateId] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Stage updated');
    },
    onError: () => toast.error('Failed to update stage'),
  });

  const addNoteMutation = useMutation({
    mutationFn: (content: string) => createNote(candidateId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', candidateId] });
      queryClient.invalidateQueries({ queryKey: ['activities', candidateId] });
      setNoteText('');
      toast.success('Note added');
    },
    onError: () => toast.error('Failed to add note'),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', candidateId] });
      queryClient.invalidateQueries({ queryKey: ['activities', candidateId] });
      setNoteDeleteId(null);
      toast.success('Note deleted');
    },
    onError: () => toast.error('Failed to delete note'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCandidate(candidateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Candidate deleted');
      onClose();
    },
    onError: () => toast.error('Failed to delete candidate'),
  });

  if (isLoading || !candidate) {
    return (
      <div className="fixed inset-0 z-50 flex">
        <div className="flex-1 bg-black/25" onClick={onClose} />
        <div className="w-full max-w-lg bg-white shadow-2xl flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label={`${candidate.name} details`}>
        {/* Backdrop */}
        <div className="flex-1 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />

        {/* Drawer */}
        <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden">

          {/* ── Hero header ── */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #f7f5f2 0%, #fff 60%)' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: GREEN }}
                >
                  {getInitials(candidate.name)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">{candidate.name}</h2>
                  <p className="text-sm font-medium mt-0.5" style={{ color: BROWN }}>{candidate.position}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StageBadge stage={candidate.stage} />
                    {candidate.rating && <StarRating value={candidate.rating} readonly size="sm" />}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setEditOpen(true)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Edit candidate"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Delete candidate"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={onClose}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto">

            {/* Contact + meta */}
            <div className="px-6 py-4 space-y-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" style={{ color: BROWN }} />
                <a href={`mailto:${candidate.email}`} className="hover:underline truncate" style={{ color: GREEN }}>
                  {candidate.email}
                </a>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" style={{ color: BROWN }} />
                  <span>{candidate.phone}</span>
                </div>
              )}
              {candidate.resume_url && (
                <div className="flex items-center gap-2.5 text-sm">
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" style={{ color: BROWN }} />
                  <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline" style={{ color: GREEN }}>
                    View Resume
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-xs text-gray-400">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Added {formatDate(candidate.created_at)}</span>
                {candidate.updated_at !== candidate.created_at && (
                  <span>· Updated {formatDate(candidate.updated_at)}</span>
                )}
              </div>
            </div>

            {/* Stage change */}
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">Move to Stage</p>
              <Select value={candidate.stage} onValueChange={(v) => stageMutation.mutate(v)} disabled={stageMutation.isPending}>
                <SelectTrigger className="w-52 h-9 rounded-xl border-gray-200 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {([
                { id: 'notes',    label: 'Notes',    icon: MessageSquare, count: notes.length },
                { id: 'activity', label: 'Activity', icon: ActivityIcon,  count: activities.length },
              ] as const).map(({ id, label, icon: Icon, count }) => {
                const active = tab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className="flex items-center gap-1.5 px-6 py-3 text-sm font-medium border-b-2 transition-colors"
                    style={{
                      borderBottomColor: active ? GREEN : 'transparent',
                      color: active ? GREEN : '#9ca3af',
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                      style={{
                        backgroundColor: active ? '#eef0eb' : '#f3f4f6',
                        color: active ? GREEN : '#9ca3af',
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Notes tab */}
            {tab === 'notes' && (
              <div className="px-6 py-5 space-y-4">
                {/* Add note */}
                <div className="space-y-2">
                  <textarea
                    ref={textareaRef}
                    placeholder="Write a note about this candidate…"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={3}
                    onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { const t = noteText.trim(); if (t) addNoteMutation.mutate(t); }}}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all"
                    style={{ focusBorderColor: GREEN } as any}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">Ctrl+Enter to save</span>
                    <button
                      onClick={() => { const t = noteText.trim(); if (t) addNoteMutation.mutate(t); }}
                      disabled={!noteText.trim() || addNoteMutation.isPending}
                      className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-xl disabled:opacity-50 transition-colors"
                      style={{ backgroundColor: GREEN }}
                    >
                      {addNoteMutation.isPending ? <Spinner size="sm" className="text-white" /> : <Plus className="h-3.5 w-3.5" />}
                      Add Note
                    </button>
                  </div>
                </div>

                {/* Notes list */}
                {notes.length === 0 ? (
                  <div className="text-center py-10 text-sm text-gray-400">
                    No notes yet. Write one above.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div key={note.id} className="group relative rounded-xl p-4 border border-gray-100" style={{ backgroundColor: '#faf9f7' }}>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed pr-6">{note.content}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{formatDateTime(note.created_at)}</span>
                          </div>
                          <button
                            onClick={() => setNoteDeleteId(note.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                            aria-label="Delete note"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Activity tab */}
            {tab === 'activity' && (
              <div className="px-6 py-5">
                {activities.length === 0 ? (
                  <div className="text-center py-10 text-sm text-gray-400">No activity yet.</div>
                ) : (
                  <ol className="space-y-1">
                    {activities.map((act, i) => {
                      const Icon = activityIconFor(act.type);
                      const style = activityStyle(act.type);
                      const isLast = i === activities.length - 1;
                      return (
                        <li key={act.id} className="relative flex gap-3 pb-4">
                          {!isLast && <span className="absolute left-3.5 top-7 bottom-0 w-px bg-gray-100" />}
                          <span className="relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: style.bg }}>
                            <Icon className="h-3 w-3" style={{ color: style.color }} />
                          </span>
                          <div className="pt-0.5">
                            <p className="text-sm text-gray-700">{act.description}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {formatDateTime(act.created_at)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <CandidateForm open={editOpen} onOpenChange={setEditOpen} candidate={candidate} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Candidate"
        description={`Are you sure you want to permanently delete ${candidate.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />

      <ConfirmDialog
        open={noteDeleteId !== null}
        onOpenChange={(o) => { if (!o) setNoteDeleteId(null); }}
        title="Delete Note"
        description="This note will be permanently removed."
        confirmLabel="Delete Note"
        loading={deleteNoteMutation.isPending}
        onConfirm={() => noteDeleteId !== null && deleteNoteMutation.mutate(noteDeleteId)}
      />
    </>
  );
}
