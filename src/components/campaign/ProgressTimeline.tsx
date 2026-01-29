import { Check } from 'lucide-react';
import { JobState } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProgressTimelineProps {
  currentState: JobState;
  compact?: boolean;
}

const states: { state: JobState; label: string }[] = [
  { state: JobState.CREATED, label: 'Created' },
  { state: JobState.CLASSIFYING, label: 'Classifying' },
  { state: JobState.GENERATING_CONTENT, label: 'Content' },
  { state: JobState.VERIFYING_CLAIMS, label: 'Verifying' },
  { state: JobState.TRANSLATING, label: 'Translating' },
  { state: JobState.GENERATING_AUDIO, label: 'Audio' },
  { state: JobState.PENDING_REVIEW, label: 'Review' },
  { state: JobState.APPROVED, label: 'Approved' },
  { state: JobState.DELIVERING, label: 'Delivering' },
  { state: JobState.COMPLETED, label: 'Completed' },
];

export function ProgressTimeline({ currentState, compact = false }: ProgressTimelineProps) {
  const currentIndex = states.findIndex((s) => s.state === currentState);
  const isFailed = currentState === JobState.FAILED;
  const isCancelled = currentState === JobState.CANCELLED;

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {states.map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              index <= currentIndex
                ? isFailed
                  ? 'bg-red-500'
                  : isCancelled
                  ? 'bg-gray-400'
                  : 'bg-green-500'
                : 'bg-gray-200'
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop view */}
      <div className="hidden lg:flex items-center justify-between">
        {states.map(({ state, label }, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={state} className="flex flex-col items-center relative flex-1">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={cn(
                    'absolute left-0 top-3 w-1/2 h-0.5 -translate-x-1/2',
                    isCompleted || isCurrent
                      ? isFailed && isCurrent
                        ? 'bg-red-500'
                        : isCancelled && isCurrent
                        ? 'bg-gray-400'
                        : 'bg-green-500'
                      : 'bg-gray-200'
                  )}
                />
              )}
              {index < states.length - 1 && (
                <div
                  className={cn(
                    'absolute right-0 top-3 w-1/2 h-0.5 translate-x-1/2',
                    isCompleted
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  )}
                />
              )}

              {/* Circle */}
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center relative z-10 border-2',
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isCurrent
                    ? isFailed
                      ? 'bg-red-500 border-red-500 text-white'
                      : isCancelled
                      ? 'bg-gray-400 border-gray-400 text-white'
                      : 'bg-primary-600 border-primary-600 text-white animate-pulse'
                    : 'bg-white border-gray-300'
                )}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'mt-2 text-xs font-medium text-center',
                  isCurrent ? 'text-primary-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile view */}
      <div className="lg:hidden">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-900">
            Step {currentIndex + 1} of {states.length}
          </span>
          <span className="text-sm text-gray-500">
            - {states[currentIndex]?.label || currentState}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {states.map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-2 flex-1 rounded-full',
                index <= currentIndex
                  ? isFailed
                    ? 'bg-red-500'
                    : isCancelled
                    ? 'bg-gray-400'
                    : 'bg-green-500'
                  : 'bg-gray-200'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
