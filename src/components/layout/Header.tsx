import { Bell, Shield, User } from 'lucide-react';
import type { UserRole } from './Layout';

interface HeaderProps {
  title: string;
  subtitle: string;
  role?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  userName?: string;
}

export default function Header({ title, subtitle, role, onRoleChange, userName = '用户名' }: HeaderProps) {
  const displayRole = role === 'admin' ? '管理员' : '产品经理';

  return (
    <header className="bg-surface border-b border-border shrink-0 sticky top-0 z-30 px-6 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-[20px] font-bold text-text leading-tight">{title}</h1>
        <p className="text-[14px] text-text-muted leading-tight mt-1">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        {onRoleChange && (
          <button
            onClick={() => onRoleChange(role === 'admin' ? 'user' : 'admin')}
            aria-label={`当前为${role === 'admin' ? '管理员' : '用户'}视角，点击切换`}
            className={`h-[32px] px-3 rounded-[--radius-md] text-[14px] font-medium inline-flex items-center gap-1.5 cursor-pointer transition-all ${
              role === 'admin'
                ? 'bg-orange-bg text-orange border border-orange/30'
                : 'bg-primary-bg text-primary border border-primary/30'
            }`}
          >
            {role === 'admin' ? <Shield size={14} /> : <User size={14} />}
            {role === 'admin' ? '管理员视角' : '用户视角'}
            <span className="text-[12px] opacity-60">点击切换</span>
          </button>
        )}

        <button
          aria-label="通知"
          className="relative w-8 h-8 flex items-center justify-center rounded-[--radius-md] cursor-pointer hover:bg-surface-hover transition-colors"
        >
          <Bell size={18} className="text-text-secondary" />
          <span className="absolute top-[5px] right-[6px] w-[6px] h-[6px] bg-danger rounded-full ring-[1.5px] ring-white" />
        </button>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[15px] font-medium text-text leading-tight">{userName}</p>
            <p className="text-[14px] text-text-muted leading-tight mt-0.5">{displayRole}</p>
          </div>
          <div className="w-[40px] h-[40px] rounded-full overflow-hidden">
            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face&facepad=2.5" alt="用户头像" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
}
