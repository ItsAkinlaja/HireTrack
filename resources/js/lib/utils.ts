import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Stage } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STAGES: Stage[] = [
  'applied',
  'interview',
  'test',
  'offer',
  'accepted',
  'rejected',
];

export const STAGE_LABELS: Record<Stage, string> = {
  applied:   'Applied',
  interview: 'Interview',
  test:      'Test',
  offer:     'Offer',
  accepted:  'Accepted',
  rejected:  'Rejected',
};

export const STAGE_COLORS: Record<Stage, string> = {
  applied:   'bg-slate-100 text-slate-700 border-slate-200',
  interview: 'bg-blue-50 text-blue-700 border-blue-200',
  test:      'bg-violet-50 text-violet-700 border-violet-200',
  offer:     'bg-amber-50 text-amber-700 border-amber-200',
  accepted:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:  'bg-red-50 text-red-600 border-red-200',
};

export const STAGE_COLUMN_COLORS: Record<Stage, string> = {
  applied:   'border-t-slate-400',
  interview: 'border-t-blue-400',
  test:      'border-t-violet-400',
  offer:     'border-t-amber-400',
  accepted:  'border-t-emerald-400',
  rejected:  'border-t-red-400',
};

export function formatDate(iso: string): string {
  const date = new Date(iso);
  const now  = new Date();
  const diffMs   = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)   return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
