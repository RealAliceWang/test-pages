import { Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  role?: string;
  userName?: string;
}

export default function Header({ title, subtitle, role = '产品经理', userName = '用户名' }: HeaderProps) {
  return (
    <header className="h-[56px] bg-white border-b border-[#E5E6EB] flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
      <div>
        <h1 className="text-[20px] font-bold text-[#1D2129] leading-tight">{title}</h1>
        <p className="text-[14px] text-[#86909C] leading-tight mt-px">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F2F3F5] transition-colors">
          <Bell size={18} className="text-[#4E5969]" />
          <span className="absolute top-[5px] right-[6px] w-[6px] h-[6px] bg-[#F53F3F] rounded-full ring-[1.5px] ring-white" />
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[14px] font-medium text-[#1D2129] leading-tight">{userName}</p>
            <p className="text-[14px] text-[#86909C] leading-tight">{role}</p>
          </div>
          <div className="w-[34px] h-[34px] rounded-full bg-[#E5E6EB] flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 34 34" className="text-[#C9CDD4]">
              <circle cx="17" cy="12" r="5.5" fill="currentColor" />
              <ellipse cx="17" cy="31" rx="11" ry="10" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
