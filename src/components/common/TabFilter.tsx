interface Tab { label: string; }

interface TabFilterProps {
  tabs: Tab[];
  activeIndex: number;
  onChange: (i: number) => void;
}

export default function TabFilter({ tabs, activeIndex, onChange }: TabFilterProps) {
  return (
    <div className="flex items-center gap-1">
      {tabs.map((t, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`h-[32px] px-[14px] rounded-[4px] text-[14px] font-medium transition-all duration-150 ${
            i === activeIndex
              ? 'bg-[#1C71D8] text-white'
              : 'text-[#4E5969] hover:bg-[#F2F3F5]'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
