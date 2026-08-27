import { X } from 'lucide-react';
import { useEffect, useCallback, useRef } from 'react';
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

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ open, onClose, title, header, children, width = 520 }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    /* Trap Tab / Shift+Tab inside the dialog. */
    if (e.key !== 'Tab') return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusables.length === 0) {
      e.preventDefault();
      dialog.focus();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    const inside = active instanceof HTMLElement && dialog.contains(active);
    if (e.shiftKey) {
      if (!inside || active === first) {
        e.preventDefault();
        last.focus();
      }
    } else if (!inside || active === last) {
      e.preventDefault();
      first.focus();
    }
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

  /* Move focus into the dialog on open, hand it back on close. Kept separate
     from the listener effect so an unstable `onClose` identity cannot bounce
     focus around mid-session. */
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const first = dialog?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? dialog)?.focus();
    return () => {
      previous?.focus();
    };
  }, [open]);

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
        ref={dialogRef}
        tabIndex={-1}
        className="relative bg-surface rounded-xl overflow-hidden rise outline-none"
        style={{ width, maxHeight: '85vh', boxShadow: 'var(--shadow-float)' }}
      >
        <div className="flex items-center justify-between px-6 py-[16px] border-b border-hairline">
          {header || <h3 className="text-[16px] font-bold text-text tracking-[-0.02em]">{title}</h3>}
          <button
            onClick={onClose}
            aria-label="关闭"
            className="btn-icon w-9 h-9 cursor-pointer shrink-0"
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
