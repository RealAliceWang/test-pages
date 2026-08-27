import type { Role } from './types';

export type Permission =
  // shared consumer surface
  | 'module:browse'
  | 'application:create'
  | 'assignment:view-own'
  // approval chain
  | 'approval:dept'
  | 'approval:org'
  | 'approval:vendor'
  // seat pools
  | 'seat:view-dept'
  | 'seat:manage'
  // people
  | 'member:view-dept'
  | 'member:manage'
  // commerce
  | 'order:view'
  | 'order:manage'
  | 'order:confirm'
  // analytics, widening scope
  | 'stats:own'
  | 'stats:dept'
  | 'stats:org'
  | 'stats:platform'
  // audit trail, widening scope
  | 'audit:dept'
  | 'audit:org'
  | 'audit:platform'
  // vendor back office
  | 'vendor:org-manage'
  | 'vendor:catalog';

const rolePermissions: Record<Role, Permission[]> = {
  MEMBER: ['module:browse', 'application:create', 'assignment:view-own', 'stats:own'],

  DEPT_ADMIN: [
    'module:browse',
    'application:create',
    'assignment:view-own',
    'approval:dept',
    'seat:view-dept',
    'member:view-dept',
    'stats:own',
    'stats:dept',
    'audit:dept',
  ],

  ORG_ADMIN: [
    'module:browse',
    'application:create',
    'assignment:view-own',
    'approval:dept',
    'approval:org',
    'seat:view-dept',
    'seat:manage',
    'member:view-dept',
    'member:manage',
    'order:view',
    'order:manage',
    'stats:own',
    'stats:dept',
    'stats:org',
    'audit:dept',
    'audit:org',
  ],

  VENDOR_OPS: [
    'approval:vendor',
    'order:view',
    'order:confirm',
    'stats:platform',
    'audit:platform',
    'vendor:org-manage',
    'vendor:catalog',
  ],
};

export function can(role: Role, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}

export function canAny(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => can(role, p));
}

/**
 * Data scope for list pages. Org admins see the whole company, department
 * admins only their own department, members only themselves.
 */
export type DataScope = 'self' | 'dept' | 'org' | 'platform';

export function scopeOf(role: Role): DataScope {
  if (role === 'VENDOR_OPS') return 'platform';
  if (role === 'ORG_ADMIN') return 'org';
  if (role === 'DEPT_ADMIN') return 'dept';
  return 'self';
}
