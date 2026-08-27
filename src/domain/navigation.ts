import {
  BarChart3,
  Box,
  Building2,
  CheckSquare,
  FileText,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  PackageSearch,
  Receipt,
  ScrollText,
  UserCircle,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { canAny, type Permission } from './permissions';
import type { Role } from './types';

export type NavGroup = '工作台' | '企业管理' | '厂商后台' | '账号';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  group: NavGroup;
  /** Visible when the role holds any of these. Empty means always visible. */
  permissions: Permission[];
}

export const navItems: NavItem[] = [
  { path: '/', label: '工作台', icon: LayoutDashboard, group: '工作台', permissions: [] },
  { path: '/modules', label: '模块中心', icon: LayoutGrid, group: '工作台', permissions: ['module:browse'] },
  { path: '/my-modules', label: '我的授权', icon: Box, group: '工作台', permissions: ['assignment:view-own'] },
  { path: '/applications', label: '我的申请', icon: FileText, group: '工作台', permissions: ['application:create'] },

  { path: '/approvals', label: '审批中心', icon: CheckSquare, group: '企业管理', permissions: ['approval:dept', 'approval:org', 'approval:vendor'] },
  { path: '/seats', label: '席位池', icon: KeyRound, group: '企业管理', permissions: ['seat:view-dept', 'seat:manage'] },
  { path: '/members', label: '成员管理', icon: Users, group: '企业管理', permissions: ['member:view-dept', 'member:manage'] },
  { path: '/orders', label: '订单与账单', icon: Receipt, group: '企业管理', permissions: ['order:view'] },
  { path: '/statistics', label: '用量统计', icon: BarChart3, group: '企业管理', permissions: ['stats:dept', 'stats:org', 'stats:platform'] },
  { path: '/audit', label: '审计日志', icon: ScrollText, group: '企业管理', permissions: ['audit:dept', 'audit:org', 'audit:platform'] },

  { path: '/vendor/orgs', label: '企业账号', icon: Building2, group: '厂商后台', permissions: ['vendor:org-manage'] },
  { path: '/vendor/catalog', label: '模块目录', icon: PackageSearch, group: '厂商后台', permissions: ['vendor:catalog'] },

  /* Rendered in the rail's pinned footer rather than inside a nav group, but
     kept here so route checks and the page verifier still see it. */
  { path: '/profile', label: '个人信息', icon: UserCircle, group: '账号', permissions: [] },
];

/** Groups shown in the rail body. '账号' is excluded: it lives in the footer. */
export function navFor(role: Role): { group: NavGroup; items: NavItem[] }[] {
  const groups: NavGroup[] = ['工作台', '企业管理', '厂商后台'];
  return groups
    .map((group) => ({
      group,
      items: navItems.filter(
        (i) => i.group === group && (i.permissions.length === 0 || canAny(role, i.permissions)),
      ),
    }))
    .filter((g) => g.items.length > 0);
}
