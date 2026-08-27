import { Search } from 'lucide-react';

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
        className="field w-full h-[38px] pl-[35px] pr-4 text-[13.5px] placeholder:text-text-placeholder focus:outline-none"
      />
    </div>
  );
}
