import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface SectionCardProps {
  title: string;
  /** Optional right-aligned link, rendered as a quiet "查看全部" affordance. */
  actionLabel?: string;
  to?: string;
  onAction?: () => void;
  /** Extra classes for the outer card, e.g. grid spans. */
  className?: string;
  /** Padding is opt-out so lists can run edge to edge. */
  bare?: boolean;
  children: ReactNode;
}

/**
 * Standard dashboard card: a small quiet title, an optional text link on the
 * right, then content.
 *
 * The title deliberately stays small (13.5px/600) — in this layout the
 * *numbers* carry the hierarchy, so loud card titles would compete with the
 * data they label.
 */
export default function SectionCard({
  title,
  actionLabel,
  to,
  onAction,
  className = '',
  bare,
  children,
}: SectionCardProps) {
  const navigate = useNavigate();
  const act = onAction ?? (to ? () => navigate(to) : undefined);

  return (
    <section className={`panel flex flex-col ${bare ? '' : 'p-5'} ${className}`}>
      <header className={`flex items-center justify-between gap-3 ${bare ? 'px-5 pt-5 pb-3' : 'mb-4'}`}>
        <h2 className="text-[13.5px] font-bold text-text tracking-[-0.01em]">{title}</h2>
        {actionLabel && act && (
          <button
            type="button"
            onClick={act}
            className="text-[12px] font-semibold text-text-placeholder hover:text-text transition-colors cursor-pointer shrink-0"
          >
            {actionLabel}
          </button>
        )}
      </header>
      {children}
    </section>
  );
}
