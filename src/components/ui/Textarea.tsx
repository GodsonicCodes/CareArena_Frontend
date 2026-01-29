import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  maxLength?: number;
  showCount?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, maxLength, showCount, value, ...props }, ref) => {
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        )}
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none',
            error
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-primary-500',
            className
          )}
          {...props}
        />
        <div className="flex justify-between mt-1">
          <div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
          </div>
          {showCount && maxLength && (
            <p className={cn('text-sm', currentLength >= maxLength ? 'text-red-600' : 'text-gray-500')}>
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
