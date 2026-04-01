import { X } from 'lucide-react';
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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl overflow-hidden" style={{ width, maxHeight: '85vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E6EB]">
          {header || <h3 className="text-[16px] font-bold text-[#1D2129]">{title}</h3>}
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#F2F3F5] transition-colors">
            <X size={16} className="text-[#86909C]" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 60px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
