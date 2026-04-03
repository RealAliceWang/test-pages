import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}

export default function SearchBar({ placeholder, value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search size={14} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-text-placeholder" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[32px] pl-[30px] pr-3 text-[14px] bg-surface border border-border rounded-sm placeholder:text-text-placeholder focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all"
      />
    </div>
  );
}
