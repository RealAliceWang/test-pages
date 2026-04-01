import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}

export default function SearchBar({ placeholder, value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search size={14} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[#C9CDD4]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[32px] pl-[30px] pr-3 text-[14px] bg-white border border-[#E5E6EB] rounded-[4px] outline-none placeholder:text-[#C9CDD4] focus:border-[#1C71D8] focus:shadow-[0_0_0_2px_rgba(28,113,216,0.1)] transition-all"
      />
    </div>
  );
}
