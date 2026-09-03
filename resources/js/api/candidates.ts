import client from './client';
import type {
  ApiCollection,
  ApiSingle,
  ApiStats,
  Candidate,
  Activity,
  Note,
  FilterState,
} from '@/types';

// ─── Candidates ──────────────────────────────────────────────────────────────

export async function getCandidates(filters?: Partial<FilterState>): Promise<Candidate[]> {
  const params: Record<string, string> = {};
  if (filters?.search)    params.search   = filters.search;
  if (filters?.stage)     params.stage    = filters.stage;
  if (filters?.rating)    params.rating   = String(filters.rating);
  if (filters?.sort_by)   params.sort_by  = filters.sort_by;
  if (filters?.sort_dir)  params.sort_dir = filters.sort_dir;

  const { data } = await client.get<ApiCollection<Candidate>>('/candidates', { params });
  return data.data;
}

export async function getCandidate(id: number): Promise<Candidate> {
  const { data } = await client.get<ApiSingle<Candidate>>(`/candidates/${id}`);
  return data.data;
}

export async function createCandidate(payload: Partial<Candidate>): Promise<Candidate> {
  const { data } = await client.post<ApiSingle<Candidate>>('/candidates', payload);
  return data.data;
}

export async function updateCandidate(id: number, payload: Partial<Candidate>): Promise<Candidate> {
  const { data } = await client.put<ApiSingle<Candidate>>(`/candidates/${id}`, payload);
  return data.data;
}

export async function deleteCandidate(id: number): Promise<void> {
  await client.delete(`/candidates/${id}`);
}

export async function updateCandidateStage(id: number, stage: string): Promise<Candidate> {
  const { data } = await client.patch<ApiSingle<Candidate>>(`/candidates/${id}/stage`, { stage });
  return data.data;
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export async function getNotes(candidateId: number): Promise<Note[]> {
  const { data } = await client.get<ApiCollection<Note>>(`/candidates/${candidateId}/notes`);
  return data.data;
}

export async function createNote(candidateId: number, content: string): Promise<Note> {
  const { data } = await client.post<ApiSingle<Note>>(`/candidates/${candidateId}/notes`, { content });
  return data.data;
}

export async function deleteNote(noteId: number): Promise<void> {
  await client.delete(`/notes/${noteId}`);
}

// ─── Activities ───────────────────────────────────────────────────────────────

export async function getActivities(candidateId: number): Promise<Activity[]> {
  const { data } = await client.get<ApiCollection<Activity>>(`/candidates/${candidateId}/activities`);
  return data.data;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const { data } = await client.get<ApiStats>('/dashboard/stats');
  return data.data;
}

// ─── Dashboard recent activity ────────────────────────────────────────────────

export interface RecentActivityItem {
  id: number;
  candidate_id: number;
  candidate_name: string;
  type: string;
  description: string;
  meta: Record<string, string> | null;
  created_at: string;
}

export async function getRecentActivity(): Promise<RecentActivityItem[]> {
  const { data } = await client.get<{ data: RecentActivityItem[] }>('/dashboard/recent-activity');
  return data.data;
}
