import { X } from 'lucide-react';
import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  header?: ReactNode;
  children: ReactNode;
  width?: number;
}

export default function Modal({ open, onClose, title, header, children, width = 520 }: ModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  /* Rendered into the body: pages live inside the route-entry `.rise`
     animation, and a transformed ancestor turns `fixed` into "relative to that
     element", which centred the dialog in the page's scroll content instead of
     the viewport. */
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      {/* Blurred scrim signals the background is dismissible */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        style={{
          background: 'rgba(10,12,16,0.5)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />
      <div
        className="relative bg-surface rounded-xl overflow-hidden rise"
        style={{ width, maxHeight: '85vh', boxShadow: 'var(--shadow-float)' }}
      >
        <div className="flex items-center justify-between px-6 py-[16px] border-b border-hairline">
          {header || <h3 className="text-[17px] font-bold text-text tracking-[-0.02em]">{title}</h3>}
          <button
            onClick={onClose}
            aria-label="关闭"
            className="btn-icon w-8 h-8 cursor-pointer shrink-0"
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 64px)' }}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
