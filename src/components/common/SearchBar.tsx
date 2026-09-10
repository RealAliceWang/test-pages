import { Search, X } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}

export default function SearchBar({ placeholder, value, onChange }: SearchBarProps) {
  return (
    <div className="relative group">
      <Search
        size={15}
        className="absolute left-[13px] top-1/2 -translate-y-1/2 text-text-placeholder group-focus-within:text-primary transition-colors pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="搜索"
        className={`field w-full h-[38px] pl-[35px] ${value ? 'pr-9' : 'pr-4'} text-[13.5px] placeholder:text-text-placeholder focus:outline-none`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="清空"
          className="btn-icon absolute right-[3px] top-1/2 -translate-y-1/2 w-7 h-7 cursor-pointer"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
