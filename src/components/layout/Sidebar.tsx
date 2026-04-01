import { NavLink } from 'react-router-dom';
import { Box, FileText, BarChart3, Users, Settings, PanelLeftClose, PanelLeftOpen, UserCircle, LayoutGrid } from 'lucide-react';
import type { UserRole } from './Layout';
import logoUrl from '../../../logo.png';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  role: UserRole;
}

const navItems = [
  { path: '/', icon: UserCircle, label: '个人信息', adminOnly: false },
  { path: '/modules', icon: LayoutGrid, label: '模块中心', adminOnly: false },
  { path: '/my-modules', icon: Box, label: '我的模块', adminOnly: false },
  { path: '/orders', icon: FileText, label: '订单记录', adminOnly: false },
  { path: '/statistics', icon: BarChart3, label: '使用统计', adminOnly: false },
  { path: '/users', icon: Users, label: '用户管理', adminOnly: true },
  { path: '/settings', icon: Settings, label: '系统设置', adminOnly: true },
];

export default function Sidebar({ collapsed, onToggle, role }: SidebarProps) {
  const visibleItems = navItems.filter((item) => !item.adminOnly || role === 'admin');

  return (
    <aside
      className={`fixed left-0 top-0 h-screen flex flex-col z-50 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[220px]'
      }`}
      style={{ background: 'linear-gradient(180deg, #0F2744 0%, #162D50 50%, #1A3358 100%)' }}
    >
      <div className={`mx-3 mt-5 mb-4 shrink-0 rounded-lg overflow-hidden ${collapsed ? 'px-0' : ''}`}
        style={{ background: 'linear-gradient(135deg, rgba(28,113,216,0.15) 0%, rgba(28,113,216,0.05) 100%)' }}
      >
        <div className={`${collapsed ? 'py-5 flex flex-col items-center' : 'px-5 py-5'}`}>
          <img src={logoUrl} alt="3D3S" className={`object-contain ${collapsed ? 'h-[22px]' : 'h-[32px]'}`} style={{ filter: 'brightness(1.1)' }} />
          {!collapsed && (
            <div className="flex items-center justify-between mt-3">
              <span className="text-[14px] font-medium text-white/50 tracking-[1px] uppercase select-none">云授权系统</span>
              <button onClick={onToggle} className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors">
                <PanelLeftClose size={14} className="text-white/40" />
              </button>
            </div>
          )}
          {collapsed && (
            <button onClick={onToggle} className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors mt-3">
              <PanelLeftOpen size={14} className="text-white/40" />
            </button>
          )}
        </div>
      </div>

      <div className="mx-5 h-px bg-white/8 mb-4" />

      <nav className="flex-1 px-3 pb-4 flex flex-col gap-1.5 overflow-y-auto">
        {visibleItems.map((item, i) => (
          <div key={item.path}>
            {/* Separator before admin section */}
            {item.adminOnly && !visibleItems[i - 1]?.adminOnly && (
              <div className="mx-2 my-2">
                <div className="h-px bg-white/8" />
                {!collapsed && <p className="text-[12px] text-white/30 mt-2 mb-1 px-1">管理功能</p>}
              </div>
            )}
            <NavLink
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 h-[42px] rounded-lg text-[16px] transition-all duration-200 ${
                  collapsed ? 'justify-center px-0' : 'px-3'
                } ${
                  isActive
                    ? 'bg-[#1C71D8] text-white font-semibold'
                    : 'text-white/50 hover:bg-white/[0.06] hover:text-white/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && !collapsed && (
                    <span className="absolute left-0 top-[10px] bottom-[10px] w-[3px] rounded-r-full bg-white/80" />
                  )}
                  <item.icon size={18} strokeWidth={1.7} className="shrink-0" />
                  {!collapsed && <span className="tracking-[0.2px]">{item.label}</span>}
                </>
              )}
            </NavLink>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="px-5 pb-4">
          <p className="text-[14px] text-white/20 select-none">v3.2.1</p>
        </div>
      )}
    </aside>
  );
}
