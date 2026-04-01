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
    <header className="bg-white border-b border-[#E5E6EB] shrink-0 sticky top-0 z-30 px-6 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-[20px] font-bold text-[#1D2129] leading-tight">{title}</h1>
        <p className="text-[14px] text-[#86909C] leading-tight mt-1">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        {/* Role switch (demo only) */}
        {onRoleChange && (
          <button
            onClick={() => onRoleChange(role === 'admin' ? 'user' : 'admin')}
            className={`h-[32px] px-3 rounded-lg text-[13px] font-medium inline-flex items-center gap-1.5 transition-all ${
              role === 'admin'
                ? 'bg-[#FFF3E8] text-[#F77234] border border-[#FFDCA1]'
                : 'bg-[#E8F3FF] text-[#1C71D8] border border-[#B7D4F8]'
            }`}
          >
            {role === 'admin' ? <Shield size={14} /> : <User size={14} />}
            {role === 'admin' ? '管理员视角' : '用户视角'}
            <span className="text-[12px] opacity-60">点击切换</span>
          </button>
        )}

        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F2F3F5] transition-colors">
          <Bell size={18} className="text-[#4E5969]" />
          <span className="absolute top-[5px] right-[6px] w-[6px] h-[6px] bg-[#F53F3F] rounded-full ring-[1.5px] ring-white" />
        </button>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[15px] font-medium text-[#1D2129] leading-tight">{userName}</p>
            <p className="text-[13px] text-[#86909C] leading-tight mt-0.5">{displayRole}</p>
          </div>
          <div className="w-[40px] h-[40px] rounded-full overflow-hidden">
            <img src="./avatar.jpg" alt="avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
}
