interface Tab { label: string; }

interface TabFilterProps {
  tabs: Tab[];
  activeIndex: number;
  onChange: (i: number) => void;
}

export default function TabFilter({ tabs, activeIndex, onChange }: TabFilterProps) {
  return (
    <div className="flex items-center gap-1" role="tablist">
      {tabs.map((t, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === activeIndex}
          onClick={() => onChange(i)}
          className={`h-[32px] px-[14px] rounded-[--radius-sm] text-[14px] font-medium cursor-pointer transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none ${
            i === activeIndex
              ? 'bg-primary text-white'
              : 'text-text-secondary hover:bg-surface-hover'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
