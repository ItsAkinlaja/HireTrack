// ─── Core domain types ───────────────────────────────────────────────────────

export type Stage =
  | 'applied'
  | 'interview'
  | 'test'
  | 'offer'
  | 'accepted'
  | 'rejected';

export type ActivityType =
  | 'created'
  | 'updated'
  | 'stage_changed'
  | 'note_added'
  | 'note_deleted';

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  position: string;
  resume_url: string | null;
  stage: Stage;
  rating: number | null;
  notes?: Note[];
  activities?: Activity[];
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: number;
  candidate_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  candidate_id: number;
  type: ActivityType;
  description: string;
  meta: Record<string, string> | null;
  created_at: string;
}

export interface DashboardStats {
  total: number;
  applied: number;
  interview: number;
  test: number;
  offer: number;
  accepted: number;
  rejected: number;
}

// ─── API response wrappers ────────────────────────────────────────────────────

export interface ApiCollection<T> {
  data: T[];
}

export interface ApiSingle<T> {
  data: T;
}

export interface ApiStats {
  data: DashboardStats;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// ─── Filter / sort state ─────────────────────────────────────────────────────

export type SortBy = 'created_at' | 'rating' | 'name';
export type SortDir = 'asc' | 'desc';

export interface FilterState {
  search: string;
  stage: Stage | '';
  rating: number | '';
  sort_by: SortBy;
  sort_dir: SortDir;
}

// ─── Form schemas ─────────────────────────────────────────────────────────────

export interface CandidateFormData {
  name: string;
  email: string;
  phone: string;
  position: string;
  resume_url: string;
  stage: Stage;
  rating: string; // kept as string in form, cast on submit
}
