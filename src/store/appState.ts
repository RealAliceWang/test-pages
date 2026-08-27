import * as seed from '../domain/seed';
import { can, scopeOf, type Permission } from '../domain/permissions';
import { roleLabels } from '../domain/types';
import type {
  Application,
  ApplicationKind,
  ApplicationStatus,
  ApprovalStep,
  Assignment,
  AuditAction,
  AuditLog,
  CatalogModule,
  Department,
  Member,
  Order,
  Organization,
  PayMethod,
  Role,
  SeatPool,
} from '../domain/types';

// ---------------------------------------------------------------- time utils

function parse(ts: string): Date {
  const [d, t = '00:00'] = ts.split(' ');
  const [y, mo, da] = d.split('-').map(Number);
  const [h, mi] = t.split(':').map(Number);
  return new Date(y, mo - 1, da, h, mi);
}

const pad = (n: number) => String(n).padStart(2, '0');

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDateTime(d: Date): string {
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function addDays(dateStr: string, days: number): string {
  const d = parse(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((parse(to).getTime() - parse(from).getTime()) / 86400000);
}

// ---------------------------------------------------------------- state

export interface Flash {
  kind: 'success' | 'error' | 'info';
  text: string;
}

export interface AppState {
  /** Logical clock, advanced one minute per mutation to keep records ordered. */
  now: string;
  seq: number;
  currentMemberId: string;
  /** False after 退出登录 — the router then only serves /login and /register.
      Boots true so the seeded demo session (and every verify script) still
      lands straight on the workbench. */
  authed: boolean;
  organizations: Organization[];
  departments: Department[];
  members: Member[];
  catalog: CatalogModule[];
  seatPools: SeatPool[];
  assignments: Assignment[];
  applications: Application[];
  orders: Order[];
  auditLogs: AuditLog[];
  flash: Flash | null;
}

export const initialState: AppState = {
  now: seed.NOW,
  seq: 0,
  currentMemberId: seed.DEFAULT_MEMBER_ID,
  authed: true,
  organizations: seed.organizations,
  departments: seed.departments,
  members: seed.members,
  catalog: seed.catalog,
  seatPools: seed.seatPools,
  assignments: seed.assignments,
  applications: seed.applications,
  orders: seed.orders,
  auditLogs: seed.auditLogs,
  flash: null,
};

// ---------------------------------------------------------------- selectors

export function moduleOf(state: AppState, moduleId: string): CatalogModule | undefined {
  return state.catalog.find((m) => m.id === moduleId);
}

export function memberOf(state: AppState, memberId: string): Member | undefined {
  return state.members.find((m) => m.id === memberId);
}

export function deptOf(state: AppState, deptId: string | null): Department | undefined {
  return deptId ? state.departments.find((d) => d.id === deptId) : undefined;
}

export function orgOf(state: AppState, orgId: string): Organization | undefined {
  return state.organizations.find((o) => o.id === orgId);
}

export function poolOf(state: AppState, orgId: string, moduleId: string): SeatPool | undefined {
  return state.seatPools.find((p) => p.orgId === orgId && p.moduleId === moduleId);
}

export function poolById(state: AppState, poolId: string): SeatPool | undefined {
  return state.seatPools.find((p) => p.id === poolId);
}

export function departmentsOfOrg(state: AppState, orgId: string): Department[] {
  return state.departments.filter((d) => d.orgId === orgId);
}

/**
 * Two different warning windows on purpose: an administrator needs lead time to
 * raise a purchase order, while a member only needs to know in time to ask for a
 * renewal. Both live here so the pages cannot drift apart.
 */
export const POOL_EXPIRING_DAYS = 30;
export const SEAT_EXPIRING_DAYS = 15;

/** Seats currently held from a pool. Derived so it can never drift. */
export function allocatedSeats(state: AppState, poolId: string): number {
  return state.assignments.filter((a) => a.poolId === poolId && a.status === '生效中').length;
}

export function spareSeats(state: AppState, pool: SeatPool): number {
  return Math.max(0, pool.total - allocatedSeats(state, pool.id));
}

export function isExpired(state: AppState, pool: SeatPool): boolean {
  return daysBetween(state.now, pool.expireDate) < 0;
}

/** Days until a pool lapses. Negative once it has. */
export function daysLeftOf(state: AppState, pool: SeatPool): number {
  return daysBetween(state.now, pool.expireDate);
}

export function isPoolExpiring(state: AppState, pool: SeatPool): boolean {
  const left = daysLeftOf(state, pool);
  return left >= 0 && left <= POOL_EXPIRING_DAYS;
}

export type SeatStatus = '生效中' | '即将到期' | '已过期' | '已暂停';

export function isOrgActive(state: AppState, orgId: string): boolean {
  return orgOf(state, orgId)?.status === '正常';
}

/**
 * A seat's health is derived from its pool and the organization, never stored,
 * so renewing the pool or re-enabling the org updates every holder at once.
 */
export function seatStatusOf(state: AppState, assignment: Assignment): SeatStatus {
  const pool = poolById(state, assignment.poolId);
  if (!pool) return assignment.status === '已过期' ? '已过期' : '生效中';
  const left = daysLeftOf(state, pool);
  if (left < 0) return '已过期';
  if (!isOrgActive(state, assignment.orgId)) return '已暂停';
  return left <= SEAT_EXPIRING_DAYS ? '即将到期' : '生效中';
}

/** Live assignments of one member, newest first. */
export function assignmentsOfMember(state: AppState, memberId: string): Assignment[] {
  return state.assignments
    .filter((a) => a.memberId === memberId && a.status !== '已回收')
    .sort((a, b) => (a.assignedAt < b.assignedAt ? 1 : -1));
}

/** Seats a member actually holds right now, excluding expired ones. */
export function liveAssignmentsOfMember(state: AppState, memberId: string): Assignment[] {
  return assignmentsOfMember(state, memberId).filter((a) => a.status === '生效中');
}

export function membersOfOrg(state: AppState, orgId: string): Member[] {
  return state.members.filter((m) => m.orgId === orgId);
}

/**
 * Which approval step is waiting, if any. The chain is stored on the
 * application itself so different kinds can have different lengths.
 */
export function pendingStep(app: Application): ApprovalStep | undefined {
  return app.steps.find((s) => s.action === '待审批');
}

/**
 * Which step will be waiting once this member approves the pending one, or
 * undefined when their approval closes the chain. The answer is not simply
 * "the next rung": a stand-in may end up covering the level above too.
 */
export function stepAfterApproval(
  state: AppState,
  app: Application,
  actor: Member,
): ApprovalStep | undefined {
  const step = pendingStep(app);
  if (!step) return undefined;
  const i = app.steps.indexOf(step);
  const signed = app.steps.map((s, j) =>
    j === i ? { ...s, action: '通过' as const, approverId: actor.id } : s,
  );
  return coverUnsignableSteps(state, { ...app, steps: signed }, state.now).find(
    (s) => s.action === '待审批',
  );
}

/** Applications this member is expected to act on right now. */
export function inboxOf(state: AppState, member: Member): Application[] {
  return state.applications.filter((app) => {
    const step = pendingStep(app);
    if (!step) return false;
    return eligibleSigners(state, app, step).some((m) => m.id === member.id);
  });
}

/** Extra tasks that are not approvals: unpaid orders, expiring pools. */
export function todoCountOf(state: AppState, member: Member): number {
  let n = inboxOf(state, member).length;
  if (member.role === 'ORG_ADMIN') {
    n += state.orders.filter((o) => o.orgId === member.orgId && o.status === '待支付').length;
    n += state.applications.filter((a) => a.orgId === member.orgId && a.status === '待采购').length;
  }
  if (member.role === 'VENDOR_OPS') {
    n += state.orders.filter((o) => o.status === '待厂商确认').length;
  }
  return n;
}

/** Rows visible to a member on list pages, honouring the role's data scope. */
export function visibleMembers(state: AppState, member: Member): Member[] {
  const scope = scopeOf(member.role);
  if (scope === 'platform') return state.members.filter((m) => m.orgId !== seed.VENDOR_ORG_ID);
  if (scope === 'org') return membersOfOrg(state, member.orgId);
  // Department ids are scoped to an organization, so both must match.
  if (scope === 'dept') {
    return state.members.filter((m) => m.orgId === member.orgId && m.deptId === member.deptId);
  }
  return [member];
}

export function visibleAssignments(state: AppState, member: Member): Assignment[] {
  // Platform scope goes by organization rather than by member, so vendor-side
  // totals stay correct even for customers whose staff are not seeded.
  if (scopeOf(member.role) === 'platform') {
    return state.assignments.filter((a) => a.orgId !== seed.VENDOR_ORG_ID);
  }
  const ids = new Set(visibleMembers(state, member).map((m) => m.id));
  return state.assignments.filter((a) => ids.has(a.memberId));
}

export function visibleAudit(state: AppState, member: Member): AuditLog[] {
  const scope = scopeOf(member.role);
  const sorted = [...state.auditLogs].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  if (scope === 'platform') return sorted;
  if (scope === 'org') return sorted.filter((l) => l.orgId === member.orgId);
  if (scope === 'dept') {
    const peers = visibleMembers(state, member);
    const ids = new Set(peers.map((m) => m.id));
    const names = new Set(peers.map((m) => m.name));
    // Department admins see actions they or their people did, and actions
    // that named one of those people as the target (e.g. an org admin
    // assigning a seat to someone in the department).
    return sorted.filter(
      (l) => l.orgId === member.orgId && (ids.has(l.actorId) || names.has(l.target)),
    );
  }
  return [];
}

/** Applications a member may look at: own submissions plus anything in scope. */
export function visibleApplications(state: AppState, member: Member): Application[] {
  const sorted = [...state.applications].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  if (member.role === 'VENDOR_OPS') {
    return sorted.filter((a) => a.steps.some((s) => s.role === 'VENDOR_OPS'));
  }
  const scope = scopeOf(member.role);
  if (scope === 'org') return sorted.filter((a) => a.orgId === member.orgId);
  if (scope === 'dept') {
    return sorted.filter(
      (a) => a.orgId === member.orgId && (a.deptId === member.deptId || a.applicantId === member.id),
    );
  }
  return sorted.filter((a) => a.applicantId === member.id);
}

export function visibleOrders(state: AppState, member: Member): Order[] {
  const sorted = [...state.orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  if (member.role === 'VENDOR_OPS') return sorted;
  return sorted.filter((o) => o.orgId === member.orgId);
}

/**
 * Decide how a request must be satisfied. This is the heart of the seat-pool
 * model: spare seats need no money, everything else escalates.
 */
export function decideKind(
  state: AppState,
  orgId: string,
  moduleId: string,
  seats: number,
): ApplicationKind {
  const mod = moduleOf(state, moduleId);
  const pool = poolOf(state, orgId, moduleId);
  if (pool && !isExpired(state, pool) && spareSeats(state, pool) >= seats) return 'SEAT';
  return mod && mod.unitPrice > 0 ? 'PURCHASE' : 'QUOTA';
}

/**
 * The chain for a request, with the levels the applicant would have signed
 * themselves lifted one rung up. Nobody may approve their own request, so a
 * department admin's request starts at the company level, and a company admin
 * has no internal level left at all — only the vendor can still gate them.
 */
export function stepsFor(kind: ApplicationKind, applicantRole: Role): ApprovalStep[] {
  const dept: ApprovalStep = { role: 'DEPT_ADMIN', label: '部门审批', action: '待审批' };
  const org: ApprovalStep = { role: 'ORG_ADMIN', label: '企业审批', action: '待审批' };
  const vendor: ApprovalStep = { role: 'VENDOR_OPS', label: '厂商额度审批', action: '待审批' };

  const full = kind === 'SEAT' ? [dept] : kind === 'PURCHASE' ? [dept, org] : [dept, org, vendor];
  if (applicantRole === 'MEMBER') return full;

  // Drop the levels this applicant owns, then de-duplicate the promotion: a
  // department admin's purchase request would otherwise carry 企业审批 twice.
  const owned: Role[] = applicantRole === 'ORG_ADMIN' ? ['DEPT_ADMIN', 'ORG_ADMIN'] : ['DEPT_ADMIN'];
  const kept = full.filter((s) => !owned.includes(s.role));
  if (applicantRole === 'DEPT_ADMIN' && !kept.some((s) => s.role === 'ORG_ADMIN')) kept.unshift(org);
  return kept;
}

/** The waiting status that goes with whichever step is pending. */
function statusForStep(step: ApprovalStep): ApplicationStatus {
  if (step.role === 'DEPT_ADMIN') return '待部门审批';
  if (step.role === 'ORG_ADMIN') return '待企业审批';
  return '待厂商审批';
}

/**
 * Role and scope match for a step, ignoring who is disqualified. Company admins
 * can also cover a department step, which is how a department without its own
 * admin still gets served.
 */
function roleFitsStep(member: Member, app: Application, step: ApprovalStep): boolean {
  if (step.role === 'VENDOR_OPS') return member.role === 'VENDOR_OPS';
  if (member.orgId !== app.orgId) return false;
  if (step.role === 'ORG_ADMIN') return member.role === 'ORG_ADMIN';
  return (member.role === 'DEPT_ADMIN' && member.deptId === app.deptId) || member.role === 'ORG_ADMIN';
}

/**
 * Who may legitimately sign a step: never the applicant, and never anyone who
 * already signed an earlier step on the same chain — a two-level chain has to
 * mean two people, otherwise the second review is theatre.
 */
export function eligibleSigners(state: AppState, app: Application, step: ApprovalStep): Member[] {
  return state.members.filter(
    (m) =>
      m.status === '在职' &&
      m.id !== app.applicantId &&
      !app.steps.some((s) => s.approverId === m.id) &&
      roleFitsStep(m, app, step),
  );
}

/** True when this member is standing in for a level below their own. */
export function isStandIn(member: Member, step: ApprovalStep): boolean {
  return member.role === 'ORG_ADMIN' && step.role === 'DEPT_ADMIN';
}

/**
 * Steps that nobody is left to sign would strand the request in a queue no one
 * can reach. That happens when a company admin stands in for a department: the
 * level above is theirs too, and they may not sign the same chain twice. Close
 * such a step out on record instead, so the chain keeps moving and the reason
 * stays visible in the approval history.
 */
function coverUnsignableSteps(state: AppState, app: Application, now: string): ApprovalStep[] {
  const steps = [...app.steps];
  for (;;) {
    const i = steps.findIndex((s) => s.action === '待审批');
    if (i === -1) return steps;
    if (eligibleSigners(state, { ...app, steps }, steps[i]).length > 0) return steps;
    steps[i] = {
      ...steps[i],
      action: '通过',
      approverName: '—',
      comment: '上级已代下级审批，本级不重复签批',
      actedAt: now,
    };
  }
}

export const kindLabels: Record<ApplicationKind, string> = {
  SEAT: '席位分配',
  PURCHASE: '采购扩容',
  QUOTA: '免费额度扩容',
};

/**
 * Next application code for today, continuing on from whichever number is
 * already highest — including codes that shipped in the seed data — instead
 * of restarting from 001 every session. Two submissions on the same day in
 * the same session also cannot collide, since each one is generated after
 * the previous is already in `state.applications`.
 */
function nextApplicationCode(state: AppState, now: string): string {
  const prefix = `AP${now.slice(0, 10).replace(/-/g, '')}`;
  const used = state.applications
    .filter((a) => a.code.startsWith(prefix))
    .map((a) => Number(a.code.slice(prefix.length)))
    .filter((n) => Number.isFinite(n));
  const next = (used.length ? Math.max(...used) : 0) + 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

/** One-line preview of the approval chain, used by catalog and detail pages. */
export function kindHint(state: AppState, orgId: string, moduleId: string, seats = 1): string {
  const kind = decideKind(state, orgId, moduleId, seats);
  if (kind === 'SEAT') {
    const pool = poolOf(state, orgId, moduleId);
    const spare = pool ? spareSeats(state, pool) : 0;
    return `池内有 ${spare} 个空闲席位，仅需部门审批`;
  }
  if (kind === 'PURCHASE') return '需采购扩容，部门与企业两级审批';
  return '免费额度需厂商审批扩容';
}

// ---------------------------------------------------------------- actions

type Action =
  | { type: 'SWITCH_IDENTITY'; memberId: string }
  | { type: 'LOGIN'; memberId: string }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_MEMBER'; orgId: string; deptId: string; name: string; title: string; email: string; phone: string }
  | { type: 'DISMISS_FLASH' }
  | { type: 'SUBMIT_APPLICATION'; moduleId: string; seats: number; reason: string; projectName: string }
  | { type: 'WITHDRAW_APPLICATION'; applicationId: string }
  | { type: 'DECIDE_APPLICATION'; applicationId: string; approve: boolean; comment: string }
  | { type: 'ASSIGN_SEAT'; poolId: string; memberId: string }
  | { type: 'REVOKE_SEAT'; assignmentId: string; reason?: string }
  | { type: 'CREATE_ORDER'; moduleId: string; seats: number; payMethod: PayMethod; applicationId?: string; renewPoolId?: string }
  | { type: 'PAY_ORDER'; orderId: string }
  | { type: 'CONFIRM_ORDER'; orderId: string }
  | { type: 'CANCEL_ORDER'; orderId: string }
  | { type: 'CONFIRM_REFUND'; orderId: string }
  | { type: 'INVITE_MEMBER'; name: string; employeeNo: string; title: string; deptId: string; role: Role; email: string; phone: string }
  | { type: 'SET_MEMBER_STATUS'; memberId: string; status: Member['status']; reason?: string }
  | { type: 'SET_MEMBER_ROLE'; memberId: string; role: Role }
  | { type: 'SET_MEMBER_DEPT'; memberId: string; deptId: string }
  | { type: 'SET_MODULE_LISTED'; moduleId: string; listed: boolean }
  | { type: 'SET_MODULE_PRICE'; moduleId: string; unitPrice: number }
  | { type: 'SET_FREE_QUOTA'; orgId: string; quota: number }
  | { type: 'SET_ORG_STATUS'; orgId: string; status: Organization['status'] };

// ---------------------------------------------------------------- reducer

interface Ctx {
  state: AppState;
  actor: Member;
  now: string;
  logs: AuditLog[];
  seq: number;
}

function makeCtx(state: AppState): Ctx {
  const d = parse(state.now);
  d.setMinutes(d.getMinutes() + 1);
  const actor = memberOf(state, state.currentMemberId)!;
  return { state, actor, now: formatDateTime(d), logs: [], seq: state.seq };
}

/**
 * Simulated source IP for a new record. Real forensics would come from the
 * request, but this prototype has no server — so each actor is pinned to
 * whichever IP their own history already used (seed data included), which
 * keeps every person's trail internally consistent instead of every actor
 * sharing one address. Actors with no prior record yet (e.g. a member
 * invited this session) fall back to a value derived from their own id, so
 * they still get something distinct from everyone else's default.
 */
function ipFor(state: AppState, actor: Member): string {
  const prior = state.auditLogs.find((l) => l.actorId === actor.id);
  if (prior) return prior.ip;
  if (actor.role === 'VENDOR_OPS') return '58.246.***.12';
  const n = Number(actor.id.replace(/\D/g, '')) || 0;
  return `192.168.100.${100 + (n % 150)}`;
}

function log(ctx: Ctx, action: AuditAction, target: string, detail: string) {
  ctx.seq += 1;
  ctx.logs.push({
    id: `log-n${ctx.seq}`,
    orgId: ctx.actor.role === 'VENDOR_OPS' ? null : ctx.actor.orgId,
    actorId: ctx.actor.id,
    actorName: ctx.actor.name,
    actorRole: ctx.actor.role,
    action,
    target,
    detail,
    createdAt: ctx.now,
    ip: ipFor(ctx.state, ctx.actor),
  });
}

function commit(state: AppState, ctx: Ctx, patch: Partial<AppState>, flash: Flash | null): AppState {
  return {
    ...state,
    ...patch,
    now: ctx.now,
    seq: ctx.seq,
    auditLogs: [...ctx.logs, ...state.auditLogs],
    flash,
  };
}

function rejectIfPaused(state: AppState, orgId: string): AppState | null {
  if (isOrgActive(state, orgId)) return null;
  return {
    ...state,
    flash: { kind: 'error', text: '该企业账号已停用，席位已暂停，无法进行此操作' },
  };
}

/**
 * Permission each action demands. Approvals are missing on purpose: who may
 * sign a step depends on the request, so that check lives in the case itself.
 */
const actionPermission: Partial<Record<Action['type'], Permission>> = {
  SUBMIT_APPLICATION: 'application:create',
  WITHDRAW_APPLICATION: 'application:create',
  ASSIGN_SEAT: 'seat:manage',
  REVOKE_SEAT: 'seat:manage',
  CREATE_ORDER: 'order:manage',
  PAY_ORDER: 'order:manage',
  CANCEL_ORDER: 'order:manage',
  CONFIRM_ORDER: 'order:confirm',
  CONFIRM_REFUND: 'order:confirm',
  INVITE_MEMBER: 'member:manage',
  SET_MEMBER_STATUS: 'member:manage',
  SET_MEMBER_ROLE: 'member:manage',
  SET_MEMBER_DEPT: 'member:manage',
  SET_MODULE_LISTED: 'vendor:catalog',
  SET_MODULE_PRICE: 'vendor:catalog',
  SET_FREE_QUOTA: 'vendor:org-manage',
  SET_ORG_STATUS: 'vendor:org-manage',
};

/** Whether an action reaches into a company other than the actor's own. */
function touchesForeignOrg(state: AppState, action: Action, actor: Member): boolean {
  // The vendor operates across every customer by definition.
  if (actor.role === 'VENDOR_OPS') return false;
  const elsewhere = (orgId: string | undefined) => Boolean(orgId && orgId !== actor.orgId);

  switch (action.type) {
    case 'ASSIGN_SEAT':
      return elsewhere(state.seatPools.find((p) => p.id === action.poolId)?.orgId);
    case 'REVOKE_SEAT':
      return elsewhere(state.assignments.find((a) => a.id === action.assignmentId)?.orgId);
    case 'PAY_ORDER':
    case 'CANCEL_ORDER':
      return elsewhere(state.orders.find((o) => o.id === action.orderId)?.orgId);
    case 'SET_MEMBER_STATUS':
    case 'SET_MEMBER_ROLE':
    case 'SET_MEMBER_DEPT':
      return elsewhere(memberOf(state, action.memberId)?.orgId);
    case 'DECIDE_APPLICATION':
    case 'WITHDRAW_APPLICATION':
      return elsewhere(state.applications.find((a) => a.id === action.applicationId)?.orgId);
    default:
      return false;
  }
}

/**
 * The store is the only backend this prototype has, so authorisation belongs
 * here. Hiding a button is a courtesy to the user, not a permission check.
 */
function denyUnauthorised(state: AppState, action: Action): AppState | null {
  const actor = memberOf(state, state.currentMemberId);
  if (!actor) return null;

  const needed = actionPermission[action.type];
  if (needed && !can(actor.role, needed)) {
    return {
      ...state,
      flash: { kind: 'error', text: `${roleLabels[actor.role]}无权执行该操作` },
    };
  }
  if (touchesForeignOrg(state, action, actor)) {
    return { ...state, flash: { kind: 'error', text: '无法操作其他企业的数据' } };
  }
  return null;
}

/**
 * A dead order must not leave the request it came from stranded: hand it back
 * to the purchase queue so the company can order again.
 */
function releaseOrderedApplication(state: AppState, order: Order): Application[] {
  if (!order.applicationId) return state.applications;
  return state.applications.map((a) =>
    a.id === order.applicationId && a.status === '已下单'
      ? { ...a, status: '待采购' as const, orderId: undefined }
      : a,
  );
}

/**
 * Grant seats to a pool, creating it when the organization has none yet, then
 * hand one seat to the applicant. Shared by the purchase and quota branches.
 */
function fulfil(
  ctx: Ctx,
  pools: SeatPool[],
  assigns: Assignment[],
  args: {
    orgId: string;
    moduleId: string;
    seats: number;
    source: SeatPool['source'];
    renewPoolId?: string;
    assignTo?: string;
  },
): { pools: SeatPool[]; assigns: Assignment[]; poolId: string } {
  const { state } = ctx;
  const mod = moduleOf(state, args.moduleId);
  const term = mod?.duration ?? 365;

  let nextPools = pools;
  let poolId: string;

  const renewing = args.renewPoolId ? pools.find((p) => p.id === args.renewPoolId) : undefined;
  const existing = renewing ?? pools.find((p) => p.orgId === args.orgId && p.moduleId === args.moduleId);

  if (renewing) {
    // Extend from whichever is later: today or the current expiry. A renewal also
    // resets the seat count, so shrinking an over-provisioned pool actually works
    // — but never below the seats already handed out, which would oversell.
    const base = daysBetween(ctx.now, renewing.expireDate) > 0 ? renewing.expireDate : ctx.now;
    const inUse = assigns.filter((a) => a.poolId === renewing.id && a.status === '生效中').length;
    poolId = renewing.id;
    nextPools = pools.map((p) =>
      p.id === renewing.id
        ? { ...p, total: Math.max(args.seats, inUse), expireDate: addDays(base, term) }
        : p,
    );
  } else if (existing) {
    poolId = existing.id;
    nextPools = pools.map((p) => (p.id === existing.id ? { ...p, total: p.total + args.seats } : p));
  } else {
    ctx.seq += 1;
    poolId = `p-n${ctx.seq}`;
    nextPools = [
      ...pools,
      {
        id: poolId,
        orgId: args.orgId,
        moduleId: args.moduleId,
        total: args.seats,
        startDate: ctx.now.slice(0, 10),
        expireDate: addDays(ctx.now.slice(0, 10), term),
        source: args.source,
      },
    ];
  }

  let nextAssigns = assigns;
  if (args.assignTo) {
    const already = assigns.some(
      (a) => a.memberId === args.assignTo && a.moduleId === args.moduleId && a.status === '生效中',
    );
    if (!already) {
      ctx.seq += 1;
      nextAssigns = [
        {
          id: `as-n${ctx.seq}`,
          poolId,
          orgId: args.orgId,
          moduleId: args.moduleId,
          memberId: args.assignTo,
          assignedById: ctx.actor.id,
          assignedAt: ctx.now.slice(0, 10),
          status: '生效中',
          usedDays: 0,
          lastUsed: '—',
        },
        ...assigns,
      ];
    }
  }

  return { pools: nextPools, assigns: nextAssigns, poolId };
}

export function reducer(state: AppState, action: Action): AppState {
  const denied = denyUnauthorised(state, action);
  if (denied) return denied;

  switch (action.type) {
    case 'SWITCH_IDENTITY': {
      const m = memberOf(state, action.memberId);
      if (!m) return state;
      return { ...state, currentMemberId: action.memberId, authed: true, flash: null };
    }

    /* ---- Session. LOGIN / LOGOUT / REGISTER_MEMBER run pre-auth, so none of
       them appears in actionPermission and none may use makeCtx (whose actor
       is whoever was signed in last). */

    case 'LOGIN': {
      const m = memberOf(state, action.memberId);
      if (!m) {
        return { ...state, flash: { kind: 'error', text: '账号不存在，请检查后重试' } };
      }
      if (m.status === '待激活') {
        return { ...state, flash: { kind: 'error', text: '账号尚未激活，请联系企业管理员开通后再登录' } };
      }
      if (m.status === '已停用') {
        return { ...state, flash: { kind: 'error', text: '账号已停用，如需恢复请联系企业管理员' } };
      }
      const d = parse(state.now);
      d.setMinutes(d.getMinutes() + 1);
      const now = formatDateTime(d);
      return {
        ...state,
        now,
        currentMemberId: m.id,
        authed: true,
        members: state.members.map((x) => (x.id === m.id ? { ...x, lastLogin: now } : x)),
        flash: { kind: 'success', text: `欢迎回来，${m.name}` },
      };
    }

    case 'LOGOUT':
      return { ...state, authed: false, flash: null };

    case 'REGISTER_MEMBER': {
      const org = state.organizations.find((o) => o.id === action.orgId);
      const dept = state.departments.find((d) => d.id === action.deptId && d.orgId === action.orgId);
      const vendorOrgIds = new Set(state.members.filter((m) => m.role === 'VENDOR_OPS').map((m) => m.orgId));
      if (!org || vendorOrgIds.has(action.orgId)) {
        return { ...state, flash: { kind: 'error', text: '请选择要加入的企业' } };
      }
      if (!dept) {
        return { ...state, flash: { kind: 'error', text: '请选择该企业下的部门' } };
      }
      const email = action.email.trim().toLowerCase();
      const peers = membersOfOrg(state, action.orgId);
      if (peers.some((m) => m.email.toLowerCase() === email)) {
        return { ...state, flash: { kind: 'error', text: `邮箱 ${action.email} 已被使用，可直接登录` } };
      }

      /* Employee numbers follow whatever pattern this company already uses
         (e.g. YG0007): reuse the letter prefix and continue the sequence. */
      const prefix = peers[0]?.employeeNo.match(/^[A-Za-z]+/)?.[0] ?? 'YG';
      const maxNo = peers.reduce((mx, m) => Math.max(mx, Number(m.employeeNo.replace(/^\D+/, '')) || 0), 0);
      const employeeNo = `${prefix}${String(maxNo + 1).padStart(4, '0')}`;

      const d = parse(state.now);
      d.setMinutes(d.getMinutes() + 1);
      const now = formatDateTime(d);
      const seq = state.seq + 1;
      const member: Member = {
        id: `m-n${seq}`,
        orgId: action.orgId,
        deptId: action.deptId,
        name: action.name.trim(),
        employeeNo,
        title: action.title.trim() || '工程师',
        role: 'MEMBER',
        email: action.email.trim(),
        phone: action.phone.trim(),
        status: '待激活',
        joinedAt: now.slice(0, 10),
        lastLogin: '—',
        avatarColor: ['#2563EB', '#16A34A', '#F97316', '#8B5CF6', '#14B8A6'][seq % 5],
      };
      /* Self-service registration is its own audit trail entry, authored by
         the applicant — the org admin reads it before deciding to activate. */
      const ctx: Ctx = { state, actor: member, now, logs: [], seq };
      log(ctx, '注册申请', member.name,
        `自助注册申请加入${org.shortName} · ${dept.name}（${member.title}），账号待企业管理员激活`);
      return commit(state, ctx, { members: [...state.members, member] }, {
        kind: 'success',
        text: `注册申请已提交，工号 ${employeeNo}，等待企业管理员激活`,
      });
    }

    case 'DISMISS_FLASH':
      return { ...state, flash: null };

    case 'SUBMIT_APPLICATION': {
      const ctx = makeCtx(state);
      const { actor } = ctx;
      const blocked = rejectIfPaused(state, actor.orgId);
      if (blocked) return blocked;
      const mod = moduleOf(state, action.moduleId);
      if (!mod || !actor.deptId) return state;

      const kind = decideKind(state, actor.orgId, action.moduleId, action.seats);
      const steps = stepsFor(kind, actor.role);
      // A company admin already holds every internal approval power, so a chain
      // with nothing left to approve would only be self-approval in disguise.
      if (steps.length === 0) {
        return {
          ...state,
          flash: {
            kind: 'error',
            text:
              kind === 'SEAT'
                ? '你是企业管理员，可直接在「席位池」为成员分配席位，无需提交申请'
                : '你是企业管理员，可直接在「订单与账单」下单采购，无需提交申请',
          },
        };
      }

      ctx.seq += 1;
      const code = nextApplicationCode(state, ctx.now);
      const app: Application = {
        id: `a-n${ctx.seq}`,
        code,
        orgId: actor.orgId,
        deptId: actor.deptId,
        applicantId: actor.id,
        moduleId: action.moduleId,
        kind,
        seats: action.seats,
        reason: action.reason,
        projectName: action.projectName || '—',
        status: statusForStep(steps[0]),
        steps,
        createdAt: ctx.now,
      };

      log(ctx, '提交申请', code, `申请「${mod.name}${mod.edition === '商业版' ? '（商业版）' : ''}」${action.seats} 个席位（${kindLabels[kind]}）`);

      return commit(state, ctx, { applications: [app, ...state.applications] }, {
        kind: 'success',
        text: `申请已提交，单号 ${code}，当前${app.status}`,
      });
    }

    case 'WITHDRAW_APPLICATION': {
      const app = state.applications.find((a) => a.id === action.applicationId);
      if (!app) return state;
      if (app.applicantId !== state.currentMemberId) {
        return { ...state, flash: { kind: 'error', text: '只能撤销自己提交的申请' } };
      }
      const ctx = makeCtx(state);
      log(ctx, '撤销申请', app.code, '申请人主动撤销');
      return commit(
        state,
        ctx,
        {
          applications: state.applications.map((a) =>
            a.id === app.id ? { ...a, status: '已撤销' as const } : a,
          ),
        },
        { kind: 'info', text: `申请 ${app.code} 已撤销` },
      );
    }

    case 'DECIDE_APPLICATION': {
      const app = state.applications.find((a) => a.id === action.applicationId);
      if (!app) return state;
      const step = pendingStep(app);
      if (!step) return state;
      // Being able to see a request is not the same as being its approver.
      if (!eligibleSigners(state, app, step).some((m) => m.id === state.currentMemberId)) {
        return { ...state, flash: { kind: 'error', text: `${app.code} 当前不由你审批` } };
      }
      if (action.approve) {
        const blocked = rejectIfPaused(state, app.orgId);
        if (blocked) return blocked;
      }

      const ctx = makeCtx(state);
      const { actor } = ctx;
      const mod = moduleOf(state, app.moduleId)!;
      const applicant = memberOf(state, app.applicantId);

      const stepIndex = app.steps.indexOf(step);
      const decided: ApprovalStep = {
        ...step,
        action: action.approve ? '通过' : '驳回',
        approverId: actor.id,
        approverName: actor.name,
        comment: action.comment,
        actedAt: ctx.now,
      };
      const signed = app.steps.map((s, i) => (i === stepIndex ? decided : s));

      // Covering a lower level is legitimate but must be legible in the trail.
      const standIn = isStandIn(actor, step) ? '（代部门审批）' : '';

      const auditAction: AuditAction =
        step.role === 'DEPT_ADMIN'
          ? action.approve ? '部门审批通过' : '部门审批驳回'
          : step.role === 'ORG_ADMIN'
            ? action.approve ? '企业审批通过' : '企业审批驳回'
            : action.approve ? '厂商审批通过' : '厂商审批驳回';

      // An approver's comment is evidence too, not just a rejecter's — keep
      // it in the trail on the approve path the same way it already is here.
      const withComment = (text: string) => (action.comment ? `${text}；意见：${action.comment}` : text);

      if (!action.approve) {
        log(ctx, auditAction, app.code, `驳回「${mod.name}」申请：${action.comment || '未填写理由'}`);
        return commit(
          state,
          ctx,
          {
            applications: state.applications.map((a) =>
              a.id === app.id ? { ...a, steps: signed, status: '已驳回' as const } : a,
            ),
          },
          { kind: 'info', text: `已驳回 ${app.code}` },
        );
      }

      const steps = coverUnsignableSteps(state, { ...app, steps: signed }, ctx.now);

      const nextStep = steps.find((s) => s.action === '待审批');
      if (nextStep) {
        const status = statusForStep(nextStep);
        log(ctx, auditAction, app.code, withComment(`${standIn}同意并上报下一级：${mod.name}`));
        return commit(
          state,
          ctx,
          {
            applications: state.applications.map((a) =>
              a.id === app.id ? { ...a, steps, status } : a,
            ),
          },
          { kind: 'success', text: `${app.code} 已通过，流转至${status.replace('待', '')}` },
        );
      }

      // Last step approved — resolve by kind.
      if (app.kind === 'SEAT') {
        const pool = poolOf(state, app.orgId, app.moduleId);
        if (!pool) return state;
        // The pool may have filled up between submission and approval.
        if (spareSeats(state, pool) < 1) {
          return {
            ...state,
            flash: {
              kind: 'error',
              text: `「${mod.name}」席位已被占满，无法直接分配。请先扩容后再审批，或驳回本申请。`,
            },
          };
        }
        ctx.seq += 1;
        const assign: Assignment = {
          id: `as-n${ctx.seq}`,
          poolId: pool.id,
          orgId: app.orgId,
          moduleId: app.moduleId,
          memberId: app.applicantId,
          assignedById: actor.id,
          assignedAt: ctx.now.slice(0, 10),
          status: '生效中',
          usedDays: 0,
          lastUsed: '—',
        };
        log(ctx, auditAction, app.code, withComment(`${standIn}同意并从池内分配「${mod.name}」1 个席位`));
        log(ctx, '分配席位', applicant?.name ?? app.applicantId, `「${mod.name}」席位已分配给${applicant?.name ?? ''}`);
        return commit(
          state,
          ctx,
          {
            applications: state.applications.map((a) =>
              a.id === app.id ? { ...a, steps, status: '已完成' as const } : a,
            ),
            assignments: [assign, ...state.assignments],
          },
          { kind: 'success', text: `${app.code} 已通过，席位已分配给${applicant?.name ?? '申请人'}` },
        );
      }

      if (app.kind === 'PURCHASE') {
        log(ctx, auditAction, app.code, withComment(`${standIn}同意采购「${mod.name}」${app.seats} 个席位，转入采购流程`));
        return commit(
          state,
          ctx,
          {
            applications: state.applications.map((a) =>
              a.id === app.id ? { ...a, steps, status: '待采购' as const } : a,
            ),
          },
          { kind: 'success', text: `${app.code} 审批通过，请前往订单管理下单采购` },
        );
      }

      // QUOTA — the vendor grants free seats directly.
      const granted = fulfil(ctx, state.seatPools, state.assignments, {
        orgId: app.orgId,
        moduleId: app.moduleId,
        seats: app.seats,
        source: '厂商赠予',
        assignTo: app.applicantId,
      });
      log(ctx, auditAction, app.code, withComment(`批准「${mod.name}」免费额度 ${app.seats} 个席位`));
      log(ctx, '分配席位', applicant?.name ?? app.applicantId, `额度到账后自动分配「${mod.name}」席位`);
      return commit(
        state,
        ctx,
        {
          applications: state.applications.map((a) =>
            a.id === app.id ? { ...a, steps, status: '已完成' as const } : a,
          ),
          seatPools: granted.pools,
          assignments: granted.assigns,
        },
        { kind: 'success', text: `${app.code} 已批准，${app.seats} 个免费席位已发放` },
      );
    }

    case 'ASSIGN_SEAT': {
      const pool = state.seatPools.find((p) => p.id === action.poolId);
      const target = memberOf(state, action.memberId);
      if (!pool || !target) return state;
      const blocked = rejectIfPaused(state, pool.orgId);
      if (blocked) return blocked;
      // Seats belong to one company and one person at a time.
      if (target.orgId !== pool.orgId) {
        return { ...state, flash: { kind: 'error', text: '该成员不属于本企业，无法分配席位' } };
      }
      if (target.status === '已停用') {
        return {
          ...state,
          flash: { kind: 'error', text: `${target.name}的账号已停用，请先恢复后再分配席位` },
        };
      }
      if (assignmentsOfMember(state, target.id).some((a) => a.moduleId === pool.moduleId)) {
        return {
          ...state,
          flash: { kind: 'error', text: `${target.name}已持有该模块席位，无需重复分配` },
        };
      }
      if (spareSeats(state, pool) < 1) {
        return { ...state, flash: { kind: 'error', text: '该模块已无空闲席位，请先扩容' } };
      }
      const ctx = makeCtx(state);
      const mod = moduleOf(state, pool.moduleId)!;
      ctx.seq += 1;
      const assign: Assignment = {
        id: `as-n${ctx.seq}`,
        poolId: pool.id,
        orgId: pool.orgId,
        moduleId: pool.moduleId,
        memberId: target.id,
        assignedById: ctx.actor.id,
        assignedAt: ctx.now.slice(0, 10),
        status: '生效中',
        usedDays: 0,
        lastUsed: '—',
      };
      log(ctx, '分配席位', target.name, `从「${mod.name}」池分配 1 个席位给${target.name}`);
      return commit(state, ctx, { assignments: [assign, ...state.assignments] }, {
        kind: 'success',
        text: `已将「${mod.name}」席位分配给${target.name}`,
      });
    }

    case 'REVOKE_SEAT': {
      const assign = state.assignments.find((a) => a.id === action.assignmentId);
      if (!assign || assign.status !== '生效中') return state;
      const ctx = makeCtx(state);
      const mod = moduleOf(state, assign.moduleId)!;
      const target = memberOf(state, assign.memberId);
      const reasonSuffix = action.reason ? `；原因：${action.reason}` : '';
      log(ctx, '回收席位', target?.name ?? assign.memberId, `回收${target?.name ?? ''}的「${mod.name}」席位，已释放回池${reasonSuffix}`);
      return commit(
        state,
        ctx,
        {
          assignments: state.assignments.map((a) =>
            a.id === assign.id
              ? { ...a, status: '已回收' as const, revokedAt: ctx.now.slice(0, 10), revokedById: ctx.actor.id }
              : a,
          ),
        },
        { kind: 'success', text: `已回收${target?.name ?? ''}的「${mod.name}」席位，可重新分配` },
      );
    }

    case 'CREATE_ORDER': {
      const ctx = makeCtx(state);
      const blocked = rejectIfPaused(state, ctx.actor.orgId);
      if (blocked) return blocked;
      const mod = moduleOf(state, action.moduleId);
      if (!mod) return state;

      // One approved request buys once. Without this the workbench prompt and a
      // second click turn into a second invoice.
      if (action.applicationId) {
        const live = state.orders.find(
          (o) => o.applicationId === action.applicationId && o.status !== '已取消',
        );
        if (live) {
          return {
            ...state,
            flash: { kind: 'error', text: `该申请已生成订单 ${live.orderNo}，请勿重复下单` },
          };
        }
      }

      // Renewing downwards is allowed, but not past the seats already in use.
      if (action.renewPoolId) {
        const pool = state.seatPools.find((p) => p.id === action.renewPoolId);
        const inUse = pool ? allocatedSeats(state, pool.id) : 0;
        if (action.seats < inUse) {
          return {
            ...state,
            flash: {
              kind: 'error',
              text: `该池有 ${inUse} 个席位在用，续费数量不能少于 ${inUse} 个。请先回收席位再缩容。`,
            },
          };
        }
      }

      ctx.seq += 1;
      const orderNo = `ORD${ctx.now.slice(0, 10).replace(/-/g, '')}${String(ctx.seq).padStart(3, '0')}`;
      const order: Order = {
        id: `o-n${ctx.seq}`,
        orderNo,
        orgId: ctx.actor.orgId,
        moduleId: action.moduleId,
        seats: action.seats,
        unitPrice: mod.unitPrice,
        amount: mod.unitPrice * action.seats,
        payMethod: action.payMethod,
        status: '待支付',
        createdById: ctx.actor.id,
        createdAt: ctx.now,
        renewPoolId: action.renewPoolId,
        applicationId: action.applicationId,
      };
      log(ctx, action.renewPoolId ? '续费席位池' : '创建订单', orderNo, `${action.renewPoolId ? '续费' : '采购'}「${mod.name}」${action.seats} 个席位，金额 ¥${order.amount.toLocaleString()}`);
      return commit(
        state,
        ctx,
        {
          orders: [order, ...state.orders],
          // Mark the request as bought so it stops showing up as still needing
          // an order, and keep the link readable from either side.
          applications: state.applications.map((a) =>
            a.id === action.applicationId && a.status === '待采购'
              ? { ...a, status: '已下单' as const, orderId: order.id }
              : a,
          ),
        },
        { kind: 'success', text: `订单 ${orderNo} 已创建，待支付 ¥${order.amount.toLocaleString()}` },
      );
    }

    case 'PAY_ORDER': {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order || order.status !== '待支付') return state;
      const blocked = rejectIfPaused(state, order.orgId);
      if (blocked) return blocked;
      const ctx = makeCtx(state);
      const mod = moduleOf(state, order.moduleId)!;

      // Bank transfers need the vendor to confirm receipt; online pay lands at once.
      if (order.payMethod === '对公转账') {
        log(ctx, '支付订单', order.orderNo, `对公转账支付 ¥${order.amount.toLocaleString()}，等待厂商确认到账`);
        return commit(
          state,
          ctx,
          {
            orders: state.orders.map((o) =>
              o.id === order.id ? { ...o, status: '待厂商确认' as const, paidAt: ctx.now } : o,
            ),
          },
          { kind: 'info', text: `转账凭证已提交，等待厂商确认到账后席位生效` },
        );
      }

      const app = order.applicationId
        ? state.applications.find((a) => a.id === order.applicationId)
        : undefined;
      const granted = fulfil(ctx, state.seatPools, state.assignments, {
        orgId: order.orgId,
        moduleId: order.moduleId,
        seats: order.seats,
        source: '采购',
        renewPoolId: order.renewPoolId,
        assignTo: app?.applicantId,
      });
      log(ctx, '支付订单', order.orderNo, `在线支付 ¥${order.amount.toLocaleString()}，${order.renewPoolId ? '席位池已续期' : `${order.seats} 个席位已到账`}`);

      return commit(
        state,
        ctx,
        {
          orders: state.orders.map((o) =>
            o.id === order.id
              ? { ...o, status: '已完成' as const, paidAt: ctx.now, confirmedAt: ctx.now, invoiceNo: `INV${order.orderNo.slice(3)}` }
              : o,
          ),
          seatPools: granted.pools,
          assignments: granted.assigns,
          applications: app
            ? state.applications.map((a) => (a.id === app.id ? { ...a, status: '已完成' as const, orderId: order.id } : a))
            : state.applications,
        },
        {
          kind: 'success',
          text: order.renewPoolId
            ? `支付成功，「${mod.name}」席位池已续期`
            : `支付成功，${order.seats} 个「${mod.name}」席位已到账`,
        },
      );
    }

    case 'CONFIRM_ORDER': {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order || order.status !== '待厂商确认') return state;
      const ctx = makeCtx(state);
      const mod = moduleOf(state, order.moduleId)!;
      const org = orgOf(state, order.orgId);
      const app = order.applicationId
        ? state.applications.find((a) => a.id === order.applicationId)
        : undefined;

      const granted = fulfil(ctx, state.seatPools, state.assignments, {
        orgId: order.orgId,
        moduleId: order.moduleId,
        seats: order.seats,
        source: '采购',
        renewPoolId: order.renewPoolId,
        assignTo: app?.applicantId,
      });
      log(ctx, '确认到账', order.orderNo, `确认${org?.shortName ?? ''}「${mod.name}」${order.seats} 个席位到账`);

      return commit(
        state,
        ctx,
        {
          orders: state.orders.map((o) =>
            o.id === order.id
              ? { ...o, status: '已完成' as const, confirmedAt: ctx.now, invoiceNo: `INV${order.orderNo.slice(3)}` }
              : o,
          ),
          seatPools: granted.pools,
          assignments: granted.assigns,
          applications: app
            ? state.applications.map((a) => (a.id === app.id ? { ...a, status: '已完成' as const, orderId: order.id } : a))
            : state.applications,
        },
        { kind: 'success', text: `已确认 ${order.orderNo} 到账，席位已发放至${org?.shortName ?? '企业'}` },
      );
    }

    case 'CANCEL_ORDER': {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order) return state;
      if (order.status !== '待支付' && order.status !== '待厂商确认') {
        return {
          ...state,
          flash: { kind: 'error', text: `订单 ${order.orderNo} 当前为${order.status}，无法取消` },
        };
      }
      const ctx = makeCtx(state);

      // Money already left the customer, so the order cannot simply vanish:
      // it waits for the vendor to settle the reversal.
      if (order.status === '待厂商确认') {
        log(ctx, '取消订单', order.orderNo, `申请退款 ¥${order.amount.toLocaleString()}，等待厂商确认`);
        return commit(
          state,
          ctx,
          { orders: state.orders.map((o) => (o.id === order.id ? { ...o, status: '退款中' as const } : o)) },
          { kind: 'info', text: `已提交退款申请，等待厂商确认后订单关闭` },
        );
      }

      log(ctx, '取消订单', order.orderNo, `取消订单，金额 ¥${order.amount.toLocaleString()}`);
      return commit(
        state,
        ctx,
        {
          orders: state.orders.map((o) => (o.id === order.id ? { ...o, status: '已取消' as const } : o)),
          applications: releaseOrderedApplication(state, order),
        },
        { kind: 'info', text: `订单 ${order.orderNo} 已取消` },
      );
    }

    case 'CONFIRM_REFUND': {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order || order.status !== '退款中') return state;
      const ctx = makeCtx(state);
      const org = orgOf(state, order.orgId);
      log(ctx, '取消订单', order.orderNo, `确认退款 ¥${order.amount.toLocaleString()}，订单关闭`);
      return commit(
        state,
        ctx,
        {
          orders: state.orders.map((o) => (o.id === order.id ? { ...o, status: '已取消' as const } : o)),
          applications: releaseOrderedApplication(state, order),
        },
        { kind: 'success', text: `已确认退款，${org?.shortName ?? ''}订单 ${order.orderNo} 已关闭` },
      );
    }

    case 'INVITE_MEMBER': {
      const actor = memberOf(state, state.currentMemberId);
      if (!actor) return state;
      const orgPeers = membersOfOrg(state, actor.orgId);
      const no = action.employeeNo.trim();
      const email = action.email.trim().toLowerCase();
      if (orgPeers.some((m) => m.employeeNo === no)) {
        return { ...state, flash: { kind: 'error', text: `工号 ${no} 已存在，请勿重复邀请` } };
      }
      if (orgPeers.some((m) => m.email.toLowerCase() === email)) {
        return { ...state, flash: { kind: 'error', text: `邮箱 ${action.email} 已被使用` } };
      }
      // A member's department has to be one of this company's own.
      if (!state.departments.some((d) => d.id === action.deptId && d.orgId === actor.orgId)) {
        return { ...state, flash: { kind: 'error', text: '请选择本企业的部门' } };
      }
      const ctx = makeCtx(state);
      ctx.seq += 1;
      const member: Member = {
        id: `m-n${ctx.seq}`,
        orgId: ctx.actor.orgId,
        deptId: action.deptId,
        name: action.name,
        employeeNo: action.employeeNo,
        title: action.title,
        role: action.role,
        email: action.email,
        phone: action.phone,
        status: '待激活',
        joinedAt: ctx.now.slice(0, 10),
        lastLogin: '—',
        avatarColor: ['#2563EB', '#16A34A', '#F97316', '#8B5CF6', '#14B8A6'][ctx.seq % 5],
      };
      const dept = deptOf(state, action.deptId);
      log(ctx, '邀请成员', action.name, `邀请${action.name}加入${dept?.name ?? ''}，角色为${action.role === 'DEPT_ADMIN' ? '部门管理员' : '普通成员'}`);
      return commit(state, ctx, { members: [...state.members, member] }, {
        kind: 'success',
        text: `已向${action.name}发送邀请，待其激活账号`,
      });
    }

    case 'SET_MEMBER_STATUS': {
      const target = memberOf(state, action.memberId);
      if (!target) return state;
      // Locking yourself out would leave the organization unmanageable.
      if (target.id === state.currentMemberId && action.status === '已停用') {
        return { ...state, flash: { kind: 'error', text: '不能停用自己的账号' } };
      }
      const ctx = makeCtx(state);
      const disabling = action.status === '已停用';

      // Disabling a member frees every seat they hold — the whole point of pooling.
      const freed = disabling
        ? state.assignments.filter((a) => a.memberId === target.id && a.status === '生效中')
        : [];
      const reasonSuffix = action.reason ? `；原因：${action.reason}` : '';

      log(ctx, disabling ? '停用成员' : '启用成员', target.name,
        disabling
          ? `停用${target.name}，同时回收其 ${freed.length} 个席位${reasonSuffix}`
          : `启用${target.name}${reasonSuffix}`);

      return commit(
        state,
        ctx,
        {
          members: state.members.map((m) => (m.id === target.id ? { ...m, status: action.status } : m)),
          assignments: disabling
            ? state.assignments.map((a) =>
                a.memberId === target.id && a.status === '生效中'
                  ? { ...a, status: '已回收' as const, revokedAt: ctx.now.slice(0, 10), revokedById: ctx.actor.id }
                  : a,
              )
            : state.assignments,
        },
        {
          kind: 'success',
          text: disabling
            ? `已停用${target.name}，释放 ${freed.length} 个席位回池`
            : `已启用${target.name}`,
        },
      );
    }

    case 'SET_MEMBER_ROLE': {
      const target = memberOf(state, action.memberId);
      if (!target) return state;
      if (target.id === state.currentMemberId) {
        return { ...state, flash: { kind: 'error', text: '不能变更自己的角色' } };
      }
      // The last enterprise administrator may not be demoted away.
      if (target.role === 'ORG_ADMIN' && action.role !== 'ORG_ADMIN') {
        const admins = state.members.filter(
          (m) => m.orgId === target.orgId && m.role === 'ORG_ADMIN' && m.status === '在职',
        );
        if (admins.length <= 1) {
          return {
            ...state,
            flash: { kind: 'error', text: '企业至少需要保留一名企业管理员，请先指派其他人' },
          };
        }
      }
      const ctx = makeCtx(state);
      log(ctx, '变更角色', target.name, `${target.name}的角色由${target.role === 'DEPT_ADMIN' ? '部门管理员' : target.role === 'ORG_ADMIN' ? '企业管理员' : '普通成员'}变更为${action.role === 'DEPT_ADMIN' ? '部门管理员' : action.role === 'ORG_ADMIN' ? '企业管理员' : '普通成员'}`);
      return commit(
        state,
        ctx,
        { members: state.members.map((m) => (m.id === target.id ? { ...m, role: action.role } : m)) },
        { kind: 'success', text: `已变更${target.name}的角色` },
      );
    }

    case 'SET_MEMBER_DEPT': {
      const target = memberOf(state, action.memberId);
      const dept = deptOf(state, action.deptId);
      if (!target || !dept) return state;
      if (dept.orgId !== target.orgId) {
        return { ...state, flash: { kind: 'error', text: '只能调整到本企业的部门' } };
      }
      const ctx = makeCtx(state);
      log(ctx, '变更部门', target.name, `${target.name}调整至${dept.name}`);
      return commit(
        state,
        ctx,
        { members: state.members.map((m) => (m.id === target.id ? { ...m, deptId: action.deptId } : m)) },
        { kind: 'success', text: `已将${target.name}调整至${dept.name}` },
      );
    }

    case 'SET_MODULE_LISTED': {
      const mod = moduleOf(state, action.moduleId);
      if (!mod) return state;
      const ctx = makeCtx(state);
      log(ctx, action.listed ? '模块上架' : '模块下架', `${mod.name}（${mod.edition}）`, action.listed ? '已上架，企业可申请' : '已下架，不影响已发放席位');
      return commit(
        state,
        ctx,
        { catalog: state.catalog.map((m) => (m.id === mod.id ? { ...m, listed: action.listed } : m)) },
        { kind: 'success', text: `「${mod.name}」已${action.listed ? '上架' : '下架'}` },
      );
    }

    case 'SET_MODULE_PRICE': {
      const mod = moduleOf(state, action.moduleId);
      if (!mod) return state;
      const ctx = makeCtx(state);
      log(ctx, '调整定价', `${mod.name}（${mod.edition}）`, `单价由 ¥${mod.unitPrice.toLocaleString()} 调整为 ¥${action.unitPrice.toLocaleString()}`);
      return commit(
        state,
        ctx,
        { catalog: state.catalog.map((m) => (m.id === mod.id ? { ...m, unitPrice: action.unitPrice } : m)) },
        { kind: 'success', text: `「${mod.name}」单价已更新` },
      );
    }

    case 'SET_FREE_QUOTA': {
      const org = orgOf(state, action.orgId);
      if (!org) return state;
      // Granted seats are already in use, so the quota cannot drop below them.
      const usedFree = state.seatPools
        .filter((p) => p.orgId === org.id && p.source === '厂商赠予')
        .reduce((sum, p) => sum + allocatedSeats(state, p.id), 0);
      if (action.quota < usedFree) {
        return {
          ...state,
          flash: {
            kind: 'error',
            text: `${org.shortName} 已使用 ${usedFree} 个免费席位，额度不能低于该数值`,
          },
        };
      }
      const ctx = makeCtx(state);
      log(ctx, '调整免费额度', org.name, `免费席位额度由 ${org.freeSeatQuota} 调整为 ${action.quota}`);
      return commit(
        state,
        ctx,
        { organizations: state.organizations.map((o) => (o.id === org.id ? { ...o, freeSeatQuota: action.quota } : o)) },
        { kind: 'success', text: `${org.shortName} 免费额度已调整为 ${action.quota}` },
      );
    }

    case 'SET_ORG_STATUS': {
      const org = orgOf(state, action.orgId);
      if (!org) return state;
      const ctx = makeCtx(state);
      log(ctx, action.status === '已停用' ? '停用企业' : '启用企业', org.name, action.status === '已停用' ? '停用企业账号，全部席位暂停' : '恢复企业账号');
      return commit(
        state,
        ctx,
        { organizations: state.organizations.map((o) => (o.id === org.id ? { ...o, status: action.status } : o)) },
        { kind: 'success', text: `${org.shortName} 已${action.status === '已停用' ? '停用' : '启用'}` },
      );
    }

    default:
      return state;
  }
}

export type { Action };
