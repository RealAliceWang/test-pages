import { NavLink } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react';
import logoUrl from '../../../logo.png';
import { navFor } from '../../domain/navigation';
import { inboxOf, useApp } from '../../store';
import { roleLabels } from '../../domain/types';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

/**
 * Navigation rail living inside the app shell.
 *
 * Collapsed is the default posture: a narrow column of icon-only pills on the
 * shell tint, with the active item as a solid ink circle. Labels appear on
 * hover as tooltips, so the rail stays narrow without becoming unguessable.
 */
export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { state, me, myOrg } = useApp();
  const groups = navFor(me.role);
  const pendingApprovals = inboxOf(state, me).length;

  return (
    <aside
      className={`shrink-0 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[84px] items-center' : 'w-[236px]'
      }`}
      aria-label="主导航"
    >
      <div className={`shrink-0 pt-6 pb-5 ${collapsed ? 'px-0' : 'px-5'}`}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-4">
            <img src={logoUrl} alt="3D3S" className="brand-mark h-[24px] object-contain" />
            <button onClick={onToggle} aria-label="展开侧边栏" className="btn-icon w-8 h-8 cursor-pointer">
              <PanelLeftOpen size={15} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <img src={logoUrl} alt="3D3S" className="brand-mark h-[30px] object-contain" />
              <button onClick={onToggle} aria-label="收起侧边栏" className="btn-icon w-8 h-8 cursor-pointer">
                <PanelLeftClose size={15} />
              </button>
            </div>
            {/* Which organization and role this session acts as */}
            <div className="mt-4">
              <p className="text-[13.5px] text-text font-bold truncate tracking-[-0.01em]">
                {myOrg.shortName}
              </p>
              <p className="text-[12px] text-text-muted mt-[3px] font-medium">{roleLabels[me.role]}</p>
            </div>
          </>
        )}
      </div>

      {/* overflow-x-clip: with overflow-y:auto the x-axis can never be truly
          `visible` (it computes to auto), which used to surface a stray
          horizontal scrollbar at the rail's foot. `clip` kills the scrollbar
          without creating a scroll container. */}
      <nav className={`flex-1 overflow-y-auto overflow-x-clip pb-5 ${collapsed ? 'px-0' : 'px-3'}`}>
        {groups.map((g, gi) => (
          <div key={g.group} className={gi ? 'mt-6' : ''}>
            {!collapsed && g.items.length > 0 && (
              <p className="px-3.5 mb-2 eyebrow select-none">{g.group}</p>
            )}
            {collapsed && gi > 0 && <div className="mx-auto my-4 w-6 h-px bg-hairline" />}

            <div className={`flex flex-col ${collapsed ? 'items-center gap-2' : 'gap-[2px]'}`}>
              {g.items.map((item) => {
                const badge = item.path === '/approvals' ? pendingApprovals : 0;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    aria-label={item.label}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `group relative flex items-center cursor-pointer transition-colors duration-200 ${
                        collapsed
                          ? 'w-[46px] h-[46px] justify-center rounded-full'
                          : 'gap-3 h-[42px] px-3.5 rounded-full text-[14px]'
                      } ${
                        isActive
                          ? 'bg-ink text-white font-semibold'
                          : 'text-text-secondary hover:bg-surface-hover hover:text-text'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon size={19} strokeWidth={isActive ? 2.1 : 1.7} className="shrink-0" />
                        {!collapsed && <span className="tracking-[-0.005em] flex-1">{item.label}</span>}

                        {badge > 0 && (
                          <span
                            className={`shrink-0 min-w-[19px] h-[19px] px-1.5 rounded-full bg-danger text-white text-[12px] font-bold flex items-center justify-center ${
                              collapsed ? 'absolute top-0 right-0 ring-2 ring-shell' : ''
                            }`}
                          >
                            {badge}
                          </span>
                        )}

                        {/* Collapsed items rely on the native `title` for their
                            label: a custom flyout positioned past the rail edge
                            would be clipped by the scrolling nav (overflow-y:auto
                            forces overflow-x to compute to auto) and its overflow
                            put a phantom horizontal scrollbar under the rail. */}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Account actions are pinned to the foot of the rail, away from the
          navigation items, so signing out is never a mis-click on a menu. */}
      <div className={`shrink-0 pb-5 pt-3 ${collapsed ? 'flex flex-col items-center gap-2' : 'px-3'}`}>
        <NavLink
          to="/profile"
          aria-label="个人信息"
          title={collapsed ? '个人信息' : undefined}
          className={({ isActive }) =>
            `group relative flex items-center cursor-pointer transition-colors duration-200 ${
              collapsed
                ? 'w-[46px] h-[46px] justify-center rounded-full'
                : 'gap-3 h-[42px] px-3.5 rounded-full text-[14px]'
            } ${
              isActive
                ? 'bg-ink text-white font-semibold'
                : 'text-text-secondary hover:bg-surface-hover hover:text-text'
            }`
          }
        >
          <Settings size={19} strokeWidth={1.7} className="shrink-0" />
          {!collapsed && <span className="flex-1">个人信息</span>}
          {collapsed && (
            <span
              role="tooltip"
              className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-[13px] font-semibold text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            >
              个人信息
            </span>
          )}
        </NavLink>

        {!collapsed && (
          <p className="px-3.5 mt-3 text-[12px] text-text-placeholder font-medium tracking-[0.06em] select-none">
            VERSION 4.0.0
          </p>
        )}
      </div>
    </aside>
  );
}
