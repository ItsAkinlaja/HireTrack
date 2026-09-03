import * as React from 'react';
import { cn } from '@/lib/utils';
import { STAGE_COLORS, STAGE_LABELS } from '@/lib/utils';
import type { Stage } from '@/types';

interface StageBadgeProps {
  stage: Stage;
  className?: string;
}

export function StageBadge({ stage, className }: StageBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        STAGE_COLORS[stage],
        className
      )}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        {
          'bg-blue-50 text-blue-700 border-blue-200': variant === 'default',
          'bg-gray-100 text-gray-700 border-gray-200': variant === 'secondary',
          'bg-red-50 text-red-600 border-red-200': variant === 'destructive',
          'border-gray-300 text-gray-600': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}
