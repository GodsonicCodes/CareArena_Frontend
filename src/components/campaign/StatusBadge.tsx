import { JobState } from '@/lib/types';
import { statusColors, statusLabels } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  state: JobState;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export function StatusBadge({ state, size = 'md', showDot = false }: StatusBadgeProps) {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const activeStates: JobState[] = [
    JobState.DELIVERING,
    JobState.GENERATING_CONTENT,
    JobState.VERIFYING_CLAIMS,
    JobState.TRANSLATING,
    JobState.GENERATING_AUDIO,
    JobState.CLASSIFYING,
  ];
  const isActive = activeStates.includes(state);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        statusColors[state],
        sizes[size]
      )}
    >
      {showDot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            isActive ? 'animate-pulse bg-current' : 'bg-current opacity-60'
          )}
        />
      )}
      {statusLabels[state]}
    </span>
  );
}
