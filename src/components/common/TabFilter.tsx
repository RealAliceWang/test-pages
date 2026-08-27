interface Tab { label: string; }

interface TabFilterProps {
  tabs: Tab[];
  activeIndex: number;
  onChange: (i: number) => void;
}

/** Segmented control. Selected segment is a flat white pill on a tinted track. */
export default function TabFilter({ tabs, activeIndex, onChange }: TabFilterProps) {
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
            role="tab"
            aria-selected={active}
            onClick={() => onChange(i)}
            className={`h-[32px] px-4 rounded-full text-[13.5px] font-semibold cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none ${
              active
                ? 'bg-surface text-text'
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
