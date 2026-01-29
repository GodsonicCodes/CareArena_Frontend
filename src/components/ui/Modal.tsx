import { type ReactNode, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div
          className={cn(
            'relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 w-full',
            sizes[size]
          )}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between p-4 border-b border-gray-200">
              <div>
                {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
                {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export { Modal };
