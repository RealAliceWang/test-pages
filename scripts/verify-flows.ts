/**
 * Headless walkthrough of the authorization flows.
 *
 * Drives the real reducer through every branch of the application state machine
 * so we can prove the loops actually close without clicking through the UI.
 * Run with: npm run verify
 */

import {
  allocatedSeats,
  assignmentsOfMember,
  decideKind,
  inboxOf,
  initialState,
  isStandIn,
  memberOf,
  moduleOf,
  pendingStep,
  poolOf,
  reducer,
  seatStatusOf,
  spareSeats,
  visibleAssignments,
  visibleMembers,
  type AppState,
} from '../src/store/appState';
import { can, scopeOf } from '../src/domain/permissions';
import type { ApplicationKind } from '../src/domain/types';

// ---------------------------------------------------------------- harness

let passed = 0;
const failures: string[] = [];

function check(label: string, actual: unknown, expected: unknown): void {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed += 1;
    console.log(`  ✓ ${label}`);
  } else {
    failures.push(`${label} — 期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`);
    console.log(`  ✗ ${label}  期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`);
  }
}

function section(title: string): void {
  console.log(`\n${title}`);
}

/** Mutable cursor over the state so each step reads like a user action. */
let state: AppState = initialState;
const dispatch = (action: Parameters<typeof reducer>[1]): void => {
  state = reducer(state, action);
};

const IDS = { orgAdmin: 'm-1', deptAdmin: 'm-2', member: 'm-3', vendor: 'v-1' };
const as = (memberId: string) => dispatch({ type: 'SWITCH_IDENTITY', memberId });

/** The newest application belonging to the seeded member. */
const latestApp = () => state.applications.find((a) => a.applicantId === IDS.member)!;
const holds = (memberId: string, moduleId: string) =>
  assignmentsOfMember(state, memberId).some((a) => a.moduleId === moduleId);

// ---------------------------------------------------------------- 0. baseline

section('走查 0 · 基线与权限边界');

check('逻辑基准时间', state.now.slice(0, 10), '2026-03-31');
check('成员无席位管理权', can('MEMBER', 'seat:manage'), false);
check('企业管理员有席位管理权', can('ORG_ADMIN', 'seat:manage'), true);
check('部门管理员数据范围为部门', scopeOf('DEPT_ADMIN'), 'dept');
check('厂商无企业席位管理权', can('VENDOR_OPS', 'seat:manage'), false);
check('成员只看自己', scopeOf('MEMBER'), 'self');

// Department admins must not see other departments' members.
as(IDS.deptAdmin);
const deptMembers = visibleMembers(state, memberOf(state, IDS.deptAdmin)!);
check(
  '部门管理员仅见本部门成员',
  deptMembers.every((m) => m.deptId === 'dept-1'),
  true,
);
check('部门管理员看不到全部 14 名成员', deptMembers.length < state.members.length, true);

// ---------------------------------------------------------------- 1. SEAT

section('走查 1 · 池内直接分配（钢构深化 免费版，池内有余量）');

as(IDS.member);
const poolBefore = poolOf(state, 'org-1', '16')!;
check('申请前池内已分配', allocatedSeats(state, poolBefore.id), 1);
check('申请前空闲席位', spareSeats(state, poolBefore), 3);
check('张思远未持有钢构深化', holds(IDS.member, '16'), false);
check('分支判定为池内分配', decideKind(state, 'org-1', '16', 1), 'SEAT');

dispatch({
  type: 'SUBMIT_APPLICATION',
  moduleId: '16',
  seats: 1,
  reason: '深化图纸出图需要',
  projectName: '临港会展中心',
});
const seatApp = latestApp();
check('提交后状态', seatApp.status, '待部门审批');
check('审批链长度（仅部门）', seatApp.steps.length, 1);

as(IDS.deptAdmin);
check('该申请进入李明待办', inboxOf(state, memberOf(state, IDS.deptAdmin)!).some((a) => a.id === seatApp.id), true);
dispatch({ type: 'DECIDE_APPLICATION', applicationId: seatApp.id, approve: true, comment: '同意' });

check('审批后申请状态', state.applications.find((a) => a.id === seatApp.id)!.status, '已完成');
check('张思远已获得席位', holds(IDS.member, '16'), true);
check('池内已分配数 +1', allocatedSeats(state, poolBefore.id), 2);
check('池容量未变', poolOf(state, 'org-1', '16')!.total, 4);

// ---------------------------------------------------------------- 2. PURCHASE

section('走查 2 · 采购扩容（建筑结构 商业版，池已占满）');

as(IDS.member);
const p6 = poolOf(state, 'org-1', '19')!;
check('建筑结构商业版池已占满', spareSeats(state, p6), 0);
check('分支判定为采购', decideKind(state, 'org-1', '19', 2), 'PURCHASE');

dispatch({
  type: 'SUBMIT_APPLICATION',
  moduleId: '19',
  seats: 2,
  reason: '超限审查项目需要',
  projectName: '前滩超高层',
});
const buyApp = latestApp();
check('审批链长度（部门+企业）', buyApp.steps.length, 2);
check('提交后状态', buyApp.status, '待部门审批');

as(IDS.deptAdmin);
dispatch({ type: 'DECIDE_APPLICATION', applicationId: buyApp.id, approve: true, comment: '项目确有需要' });
check('部门通过后流转', state.applications.find((a) => a.id === buyApp.id)!.status, '待企业审批');

as(IDS.orgAdmin);
check('企业管理员待办包含该单', inboxOf(state, memberOf(state, IDS.orgAdmin)!).some((a) => a.id === buyApp.id), true);
dispatch({ type: 'DECIDE_APPLICATION', applicationId: buyApp.id, approve: true, comment: '同意采购' });
check('企业通过后进入待采购', state.applications.find((a) => a.id === buyApp.id)!.status, '待采购');

dispatch({ type: 'CREATE_ORDER', moduleId: '19', seats: 2, payMethod: '对公转账', applicationId: buyApp.id });
const order = state.orders[0];
check('订单金额 = 单价 × 席位数', order.amount, moduleOf(state, '19')!.unitPrice * 2);
check('订单初始状态', order.status, '待支付');

dispatch({ type: 'PAY_ORDER', orderId: order.id });
check('对公转账进入待厂商确认', state.orders.find((o) => o.id === order.id)!.status, '待厂商确认');
check('厂商确认前不发放席位', poolOf(state, 'org-1', '19')!.total, 5);

as(IDS.vendor);
dispatch({ type: 'CONFIRM_ORDER', orderId: order.id });
check('订单完成', state.orders.find((o) => o.id === order.id)!.status, '已完成');
check('申请闭环', state.applications.find((a) => a.id === buyApp.id)!.status, '已完成');
check('池容量扩容至 7', poolOf(state, 'org-1', '19')!.total, 7);
check('申请人自动获得席位', holds(IDS.member, '19'), true);

// ---------------------------------------------------------------- 3. QUOTA

section('走查 3 · 免费额度扩容（屋架桁架，企业未开通）');

as(IDS.member);
check('屋架桁架尚无席位池', poolOf(state, 'org-1', '6'), undefined);
check('分支判定为免费额度', decideKind(state, 'org-1', '6', 1), 'QUOTA');

dispatch({
  type: 'SUBMIT_APPLICATION',
  moduleId: '6',
  seats: 1,
  reason: '厂房屋架计算',
  projectName: '松江厂房改造',
});
const quotaApp = latestApp();
check('审批链长度（部门+企业+厂商）', quotaApp.steps.length, 3);

as(IDS.deptAdmin);
dispatch({ type: 'DECIDE_APPLICATION', applicationId: quotaApp.id, approve: true, comment: '同意' });
as(IDS.orgAdmin);
dispatch({ type: 'DECIDE_APPLICATION', applicationId: quotaApp.id, approve: true, comment: '同意' });
check('企业通过后待厂商审批', state.applications.find((a) => a.id === quotaApp.id)!.status, '待厂商审批');

as(IDS.vendor);
check('厂商待办包含该单', inboxOf(state, memberOf(state, IDS.vendor)!).some((a) => a.id === quotaApp.id), true);
dispatch({ type: 'DECIDE_APPLICATION', applicationId: quotaApp.id, approve: true, comment: '赠予额度' });
check('申请闭环', state.applications.find((a) => a.id === quotaApp.id)!.status, '已完成');
const newPool = poolOf(state, 'org-1', '6');
check('新建席位池', newPool !== undefined, true);
check('新池来源为厂商赠予', newPool!.source, '厂商赠予');
check('申请人自动获得席位', holds(IDS.member, '6'), true);

// ---------------------------------------------------------------- 4. 驳回

section('走查 4 · 驳回与撤销');

as(IDS.member);
dispatch({ type: 'SUBMIT_APPLICATION', moduleId: '7', seats: 1, reason: '试用', projectName: '内部预研' });
const rejectApp = latestApp();
as(IDS.deptAdmin);
dispatch({ type: 'DECIDE_APPLICATION', applicationId: rejectApp.id, approve: false, comment: '暂无项目落地' });
const rejected = state.applications.find((a) => a.id === rejectApp.id)!;
check('驳回后状态', rejected.status, '已驳回');
check('驳回意见留痕', rejected.steps[0].comment, '暂无项目落地');
check('驳回不产生席位', holds(IDS.member, '7'), false);

as(IDS.member);
dispatch({ type: 'SUBMIT_APPLICATION', moduleId: '9', seats: 1, reason: '楼梯计算', projectName: '内部预研' });
const withdrawApp = latestApp();
dispatch({ type: 'WITHDRAW_APPLICATION', applicationId: withdrawApp.id });
check('撤销后状态', state.applications.find((a) => a.id === withdrawApp.id)!.status, '已撤销');

// ---------------------------------------------------------------- 5. 离职释放

section('走查 5 · 离职席位自动回收');

as(IDS.orgAdmin);
const leaving = 'm-10';
const heldBefore = assignmentsOfMember(state, leaving).length;
check('郑凯停用前持有席位数', heldBefore, 3);
dispatch({ type: 'SET_MEMBER_STATUS', memberId: leaving, status: '已停用' });
check('停用后成员状态', memberOf(state, leaving)!.status, '已停用');
check('停用后持有席位清零', assignmentsOfMember(state, leaving).length, 0);
check(
  '回收记录留痕',
  state.assignments.filter((a) => a.memberId === leaving && a.status === '已回收').length >= heldBefore,
  true,
);

// ---------------------------------------------------------------- 6. 超卖防护

section('走查 6 · 超卖防护与续费');

as(IDS.orgAdmin);
const fullPool = poolOf(state, 'org-1', '5')!; // 多高层免费版 6/6
check('多高层池已占满', spareSeats(state, fullPool), 0);
const before = state.assignments.length;
dispatch({ type: 'ASSIGN_SEAT', poolId: fullPool.id, memberId: 'm-5' });
check('占满时分配被拒绝', state.assignments.length, before);
check('拒绝时给出错误提示', state.flash?.kind, 'error');

// Renewal shrinks an over-provisioned pool instead of stacking seats.
const renewPool = poolOf(state, 'org-1', '21')!; // 多高层商业版 total 3, 2 in use
dispatch({ type: 'CREATE_ORDER', moduleId: '21', seats: 2, payMethod: '在线支付', renewPoolId: renewPool.id });
const renewOrder = state.orders[0];
dispatch({ type: 'PAY_ORDER', orderId: renewOrder.id });
check('在线支付直接完成', state.orders.find((o) => o.id === renewOrder.id)!.status, '已完成');
check('续费按新数量重置容量', poolOf(state, 'org-1', '21')!.total, 2);
check('续费延长到期日', poolOf(state, 'org-1', '21')!.expireDate > renewPool.expireDate, true);

// ---------------------------------------------------------------- 7. 防误操作

section('走查 7 · 管理操作的自我保护');

as(IDS.orgAdmin);
dispatch({ type: 'SET_MEMBER_STATUS', memberId: IDS.orgAdmin, status: '已停用' });
check('不能停用自己', memberOf(state, IDS.orgAdmin)!.status, '在职');
check('给出拒绝提示', state.flash?.kind, 'error');

dispatch({ type: 'SET_MEMBER_ROLE', memberId: IDS.orgAdmin, role: 'MEMBER' });
check('不能变更自己的角色', memberOf(state, IDS.orgAdmin)!.role, 'ORG_ADMIN');

// The vendor may not push a quota below what the customer already uses.
as(IDS.vendor);
const org1 = state.organizations.find((o) => o.id === 'org-1')!;
dispatch({ type: 'SET_FREE_QUOTA', orgId: 'org-1', quota: 1 });
check('免费额度不能低于已用数', state.organizations.find((o) => o.id === 'org-1')!.freeSeatQuota, org1.freeSeatQuota);
check('给出拒绝提示', state.flash?.kind, 'error');
dispatch({ type: 'SET_FREE_QUOTA', orgId: 'org-1', quota: 60 });
check('合法额度可调整', state.organizations.find((o) => o.id === 'org-1')!.freeSeatQuota, 60);

as(IDS.orgAdmin);
const memberCount = state.members.length;
dispatch({
  type: 'INVITE_MEMBER',
  name: '重复工号',
  employeeNo: 'YG0007',
  title: '结构工程师',
  deptId: 'dept-1',
  role: 'MEMBER',
  email: 'dup@yungou.com',
  phone: '138****0000',
});
check('工号重复时拒绝邀请', state.members.length, memberCount);

// Disabling a customer pauses seats without reclaiming them. Only the vendor
// may flip an account, and only that company's own admin manages its seats.
const holder = state.assignments.find((a) => a.orgId === 'org-2' && a.status === '生效中')!;
as(IDS.vendor);
dispatch({ type: 'SET_ORG_STATUS', orgId: 'org-2', status: '已停用' });
check('停用后分配记录仍在', state.assignments.find((a) => a.id === holder.id)!.status, '生效中');
check('停用后席位显示为已暂停', seatStatusOf(state, holder), '已暂停');
const assignedBefore = state.assignments.length;
as('x-0');
dispatch({ type: 'ASSIGN_SEAT', poolId: 'p-20', memberId: 'x-1' });
check('停用企业不能再分配席位', state.assignments.length, assignedBefore);
as(IDS.vendor);
dispatch({ type: 'SET_ORG_STATUS', orgId: 'org-2', status: '正常' });
check('启用后席位立即恢复', seatStatusOf(state, holder), '生效中');

// ---------------------------------------------------------------- 8. 数据范围

section('走查 8 · 跨企业数据隔离');

check(
  '席位记录的持有人都存在',
  state.assignments.every((a) => memberOf(state, a.memberId) !== undefined),
  true,
);
// org-4 is a freshly opened account with a granted pool but no allocation yet,
// so only three organizations have holders.
const vendorSeats = visibleAssignments(state, memberOf(state, IDS.vendor)!);
check(
  '厂商可见席位不漏任何客户企业',
  vendorSeats.length,
  state.assignments.filter((a) => a.orgId !== 'org-vendor').length,
);
check('厂商可见席位覆盖 3 家有持有人的企业', new Set(vendorSeats.map((a) => a.orgId)).size, 3);
check(
  '厂商可见席位不含厂商自身',
  visibleAssignments(state, memberOf(state, IDS.vendor)!).every((a) => a.orgId !== 'org-vendor'),
  true,
);
check(
  '部门管理员可见成员限于本企业本部门',
  visibleMembers(state, memberOf(state, IDS.deptAdmin)!).every(
    (m) => m.orgId === 'org-1' && m.deptId === 'dept-1',
  ),
  true,
);

// ---------------------------------------------------------------- 9. 审计

section('走查 9 · 审计完整性');

check('审计日志随操作增长', state.auditLogs.length > initialState.auditLogs.length, true);
check(
  '每条日志都有操作人',
  state.auditLogs.every((l) => Boolean(l.actorName) && Boolean(l.action)),
  true,
);
check('逻辑时钟已推进', state.now > initialState.now, true);

// ---------------------------------------------------------------- 10. 审批回避

section('走查 10 · 审批回避与不重复签批');

/** First listed module whose request would take the wanted branch. */
const moduleWithKind = (kind: ApplicationKind, seats = 1) =>
  state.catalog.find((m) => m.listed && decideKind(state, 'org-1', m.id, seats) === kind)!;

// A company admin holds every internal approval power, so a seat or purchase
// request of theirs would only ever be self-approved. It is refused outright.
as(IDS.orgAdmin);
const appsBefore = state.applications.length;
dispatch({
  type: 'SUBMIT_APPLICATION',
  moduleId: moduleWithKind('SEAT').id,
  seats: 1,
  reason: '企业管理员自提席位申请',
  projectName: '内部预研',
});
check('企业管理员的席位申请不成单', state.applications.length, appsBefore);
check('并提示改用直接分配', state.flash?.kind, 'error');

// The vendor still gates free quota, so that one request does exist — with the
// two internal levels dropped, since both of them are the applicant.
dispatch({
  type: 'SUBMIT_APPLICATION',
  moduleId: moduleWithKind('QUOTA').id,
  seats: 1,
  reason: '企业管理员申请免费额度扩容',
  projectName: '内部预研',
});
const orgAdminQuota = state.applications.find((a) => a.applicantId === IDS.orgAdmin)!;
check('企业管理员的额度申请只剩厂商一级', orgAdminQuota.steps.map((s) => s.label), ['厂商额度审批']);
check('提交后直接待厂商审批', orgAdminQuota.status, '待厂商审批');
check(
  '企业管理员不能审自己的申请',
  inboxOf(state, memberOf(state, IDS.orgAdmin)!).some((a) => a.id === orgAdminQuota.id),
  false,
);

// A department admin's own request skips their own level and starts above it.
as(IDS.deptAdmin);
dispatch({
  type: 'SUBMIT_APPLICATION',
  moduleId: moduleWithKind('PURCHASE', 2).id,
  seats: 2,
  reason: '部门管理员自提采购申请',
  projectName: '内部预研',
});
const deptAdminApp = state.applications.find((a) => a.applicantId === IDS.deptAdmin)!;
check('部门管理员的申请跳过部门审批', deptAdminApp.steps.map((s) => s.label), ['企业审批']);
check('提交后直接待企业审批', deptAdminApp.status, '待企业审批');
check(
  '部门管理员不能审自己的申请',
  inboxOf(state, memberOf(state, IDS.deptAdmin)!).some((a) => a.id === deptAdminApp.id),
  false,
);
check(
  '该申请落到企业管理员待办',
  inboxOf(state, memberOf(state, IDS.orgAdmin)!).some((a) => a.id === deptAdminApp.id),
  true,
);

// 总工办 has no department admin of its own, so the company admin stands in —
// and having signed the department step, may not sign the company step too.
const standInApp = state.applications.find((a) => a.id === 'a-7')!;
check('总工办无部门管理员', state.members.some((m) => m.deptId === 'dept-5' && m.role === 'DEPT_ADMIN'), false);
check('该申请不属于其他部门管理员', inboxOf(state, memberOf(state, IDS.deptAdmin)!).some((a) => a.id === 'a-7'), false);

as(IDS.orgAdmin);
const orgAdmin = memberOf(state, IDS.orgAdmin)!;
check('企业管理员可代部门审批', inboxOf(state, orgAdmin).some((a) => a.id === 'a-7'), true);
check('该条被识别为代审', isStandIn(orgAdmin, pendingStep(standInApp)!), true);

dispatch({ type: 'DECIDE_APPLICATION', applicationId: 'a-7', approve: true, comment: '总工办确有需求' });
const covered = state.applications.find((a) => a.id === 'a-7')!;
check('代审后跳过企业审批直达厂商', covered.status, '待厂商审批');
check('部门审批由本人签批', covered.steps[0].approverName, '王振华');
check('企业审批不再由同一人签批', covered.steps[1].approverName, '—');
check('企业审批留下不重复签批的说明', covered.steps[1].comment, '上级已代下级审批，本级不重复签批');
check('代审后不再出现在其待办', inboxOf(state, memberOf(state, IDS.orgAdmin)!).some((a) => a.id === 'a-7'), false);
check(
  '审计留痕标注代部门审批',
  state.auditLogs.some((l) => l.target === covered.code && l.detail.includes('代部门审批')),
  true,
);

// Whoever signs a chain never appears on it twice.
check(
  '没有任何申请被同一人签批两次',
  state.applications.every((a) => {
    const ids = a.steps.map((s) => s.approverId).filter(Boolean);
    return new Set(ids).size === ids.length;
  }),
  true,
);
check(
  '没有任何申请由申请人自己签批',
  state.applications.every((a) => a.steps.every((s) => s.approverId !== a.applicantId)),
  true,
);

// ---------------------------------------------------------------- 汇总

console.log(`\n${'─'.repeat(52)}`);
if (failures.length === 0) {
  console.log(`全部通过：${passed} 项断言`);
  process.exit(0);
} else {
  console.log(`通过 ${passed} 项，失败 ${failures.length} 项：`);
  failures.forEach((f) => console.log(`  · ${f}`));
  process.exit(1);
}
