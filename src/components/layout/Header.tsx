import { Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  userName?: string;
  userRole?: string;
}

export default function Header({ title, subtitle, userName = '用户名', userRole = '产品经理' }: HeaderProps) {
  return (
    <header className="bg-surface border-b border-border shrink-0 sticky top-0 z-30 px-6 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-[20px] font-bold text-text leading-tight">{title}</h1>
        <p className="text-[14px] text-text-muted leading-tight mt-1">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <button
          aria-label="通知"
          className="relative w-8 h-8 flex items-center justify-center rounded-sm cursor-pointer hover:bg-surface-hover transition-colors"
        >
          <Bell size={18} className="text-text-secondary" />
          <span className="absolute top-[5px] right-[6px] w-[6px] h-[6px] bg-danger rounded-full ring-[1.5px] ring-white" />
        </button>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[15px] font-medium text-text leading-tight">{userName}</p>
            <p className="text-[14px] text-text-muted leading-tight mt-0.5">{userRole}</p>
          </div>
          <div className="w-[40px] h-[40px] rounded-full overflow-hidden">
            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face&facepad=2.5" alt="用户头像" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
}
