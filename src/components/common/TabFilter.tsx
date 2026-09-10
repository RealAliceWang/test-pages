import { useRef } from 'react';
import type { KeyboardEvent } from 'react';

interface Tab { label: string; }

interface TabFilterProps {
  tabs: Tab[];
  activeIndex: number;
  onChange: (i: number) => void;
}

/** Segmented control. Selected segment is a flat white pill on a tinted track. */
export default function TabFilter({ tabs, activeIndex, onChange }: TabFilterProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const moveFocus = (i: number) => {
    const next = (i + tabs.length) % tabs.length;
    onChange(next);
    tabRefs.current[next]?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      moveFocus(i + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      moveFocus(i - 1);
    }
  };

  return (
    <div
      className="inline-flex items-center gap-1 p-[4px] rounded-full bg-surface-secondary"
      role="tablist"
    >
      {tabs.map((t, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={i}
            ref={(el) => { tabRefs.current[i] = el; }}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={`h-[32px] px-4 rounded-full text-[13.5px] font-semibold cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none ${
              active
                ? 'bg-surface text-text shadow-[var(--shadow-elevated)]'
                : 'text-text-muted hover:text-text'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
