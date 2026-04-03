import { X } from 'lucide-react';
import { useEffect, useCallback } from 'react';
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
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-lg shadow-xl overflow-hidden" style={{ width, maxHeight: '85vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          {header || <h3 className="text-[16px] font-bold text-text">{title}</h3>}
          <button
            onClick={onClose}
            aria-label="关闭"
            className="w-7 h-7 flex items-center justify-center rounded-sm cursor-pointer hover:bg-surface-hover transition-colors"
          >
            <X size={16} className="text-text-muted" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 60px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
