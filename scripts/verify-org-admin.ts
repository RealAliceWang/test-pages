/**
 * Company-admin scenario suite.
 *
 * Written from the product side: each case states what a company admin should
 * be able to do, or must be stopped from doing, and drives the real reducer to
 * find out. Every case starts from a fresh seed so failures point at one rule
 * instead of at leftovers from the case before.
 *
 * Run with: npm run verify:admin
 */

import {
  allocatedSeats,
  assignmentsOfMember,
  inboxOf,
  initialState,
  memberOf,
  moduleOf,
  poolOf,
  reducer,
  spareSeats,
  visibleApplications,
  visibleAudit,
  visibleMembers,
  visibleOrders,
  type Action,
  type AppState,
} from '../src/store/appState';

// ---------------------------------------------------------------- harness

const IDS = {
  orgAdmin: 'm-1',   // 王振华 · 总工办 · 企业管理员
  deptAdmin: 'm-2',  // 李明 · 结构一所 · 部门管理员
  member: 'm-3',     // 张思远 · 结构一所 · 普通成员
  holder: 'm-10',    // 郑凯 · 持有 3 个席位
  otherOrgAdmin: 'x-0', // 黄伟 · 鸿图设计 · 另一家企业
  vendor: 'v-1',
};

let passed = 0;
const failures: string[] = [];

/** One case, on its own copy of the seed. */
function session(memberId: string = IDS.orgAdmin) {
  let s: AppState = reducer(initialState, { type: 'SWITCH_IDENTITY', memberId });
  return {
    get state() {
      return s;
    },
    run(a: Action) {
      s = reducer(s, a);
    },
    as(id: string) {
      s = reducer(s, { type: 'SWITCH_IDENTITY', memberId: id });
    },
  };
}

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

// ================================================================ A. 采购闭环

section('用例组 A · 采购闭环（申请通过 → 下单 → 支付 → 到账扩容）');

{
  // A1 The approved purchase turns into an order priced off the catalogue.
  const s = session();
  const app = s.state.applications.find((a) => a.status === '待采购')!;
  const mod = moduleOf(s.state, app.moduleId)!;
  s.run({ type: 'CREATE_ORDER', moduleId: app.moduleId, seats: app.seats, payMethod: '对公转账', applicationId: app.id });
  const order = s.state.orders.find((o) => o.status === '待支付' && o.moduleId === app.moduleId)!;
  check('A1 待采购申请可生成订单', Boolean(order), true);
  check('A1 订单金额按单价×席位数', order.amount, mod.unitPrice * app.seats);
  check('A1 可从申请反查订单号', s.state.applications.find((a) => a.id === app.id)!.orderId, order.id);
  // The workbench counts 待采购 as "still needs an order", so the count has to
  // drop once the order exists, or it keeps nagging about finished work.
  check(
    'A1 下单后不再计入待下单采购',
    s.state.applications.filter((a) => a.orgId === 'org-1' && a.status === '待采购').length,
    0,
  );
}

{
  // A2 The same approved request must not be bought twice.
  const s = session();
  const app = s.state.applications.find((a) => a.status === '待采购')!;
  const before = s.state.orders.length;
  s.run({ type: 'CREATE_ORDER', moduleId: app.moduleId, seats: app.seats, payMethod: '对公转账', applicationId: app.id });
  s.run({ type: 'CREATE_ORDER', moduleId: app.moduleId, seats: app.seats, payMethod: '对公转账', applicationId: app.id });
  check('A2 同一申请不能重复下单', s.state.orders.length, before + 1);
}

{
  // A3 An unpaid order can be dropped, and nothing is granted.
  const s = session();
  const unpaid = s.state.orders.find((o) => o.orgId === 'org-1' && o.status === '待支付')!;
  const poolBefore = poolOf(s.state, 'org-1', unpaid.moduleId)?.total ?? 0;
  s.run({ type: 'CANCEL_ORDER', orderId: unpaid.id });
  check('A3 待支付订单可取消', s.state.orders.find((o) => o.id === unpaid.id)!.status, '已取消');
  check('A3 取消不发放席位', poolOf(s.state, 'org-1', unpaid.moduleId)?.total ?? 0, poolBefore);
}

{
  // A4 Money already sent: cancelling opens a refund the vendor has to settle,
  // it does not make the order disappear on the customer's word alone.
  const s = session();
  const paid = s.state.orders.find((o) => o.orgId === 'org-1' && o.status === '待厂商确认')!;
  s.run({ type: 'CANCEL_ORDER', orderId: paid.id });
  check('A4 已支付的订单取消后转为退款中', s.state.orders.find((o) => o.id === paid.id)!.status, '退款中');
  s.run({ type: 'CONFIRM_REFUND', orderId: paid.id });
  check('A4 企业自己不能确认退款', s.state.orders.find((o) => o.id === paid.id)!.status, '退款中');
  s.as(IDS.vendor);
  s.run({ type: 'CONFIRM_REFUND', orderId: paid.id });
  check('A4 厂商确认后订单关闭', s.state.orders.find((o) => o.id === paid.id)!.status, '已取消');
  check(
    'A4 退款全程留痕',
    s.state.auditLogs.filter((l) => l.target === paid.orderNo).length >= 2,
    true,
  );
}

{
  // A4b A refund must not quietly grant seats along the way.
  const s = session();
  const paid = s.state.orders.find((o) => o.orgId === 'org-1' && o.status === '待厂商确认')!;
  const totalBefore = poolOf(s.state, 'org-1', paid.moduleId)?.total ?? 0;
  s.run({ type: 'CANCEL_ORDER', orderId: paid.id });
  s.as(IDS.vendor);
  s.run({ type: 'CONFIRM_REFUND', orderId: paid.id });
  check('A4b 退款不发放席位', poolOf(s.state, 'org-1', paid.moduleId)?.total ?? 0, totalBefore);
}

{
  // A8 An order in flight belongs to its own company only.
  const s = session(IDS.otherOrgAdmin);
  const foreign = s.state.orders.find((o) => o.orgId === 'org-1' && o.status === '待支付')!;
  s.run({ type: 'CANCEL_ORDER', orderId: foreign.id });
  check('A8 别家企业管理员不能取消我的订单', s.state.orders.find((o) => o.id === foreign.id)!.status, '待支付');
  s.run({ type: 'PAY_ORDER', orderId: foreign.id });
  check('A8 别家企业管理员不能支付我的订单', s.state.orders.find((o) => o.id === foreign.id)!.status, '待支付');
}

{
  // A5 Cancelling the order must leave the approved request buyable again,
  // not stranded pointing at a dead order.
  const s = session();
  const app = s.state.applications.find((a) => a.status === '待采购')!;
  s.run({ type: 'CREATE_ORDER', moduleId: app.moduleId, seats: app.seats, payMethod: '对公转账', applicationId: app.id });
  const order = s.state.orders.find((o) => o.status === '待支付' && o.moduleId === app.moduleId)!;
  s.run({ type: 'CANCEL_ORDER', orderId: order.id });
  const reopened = s.state.applications.find((a) => a.id === app.id)!;
  check('A5 取消后申请回到待采购', reopened.status, '待采购');
  // Not "orderId is empty" — that would pass for free while the link is missing
  // entirely. What matters is that it never points at a dead order.
  check(
    'A5 申请不指向已取消的订单',
    !reopened.orderId || s.state.orders.find((o) => o.id === reopened.orderId)?.status !== '已取消',
    true,
  );
  const ordersBefore = s.state.orders.length;
  s.run({ type: 'CREATE_ORDER', moduleId: app.moduleId, seats: app.seats, payMethod: '在线支付', applicationId: app.id });
  check('A5 取消后可以重新下单', s.state.orders.length, ordersBefore + 1);
}

{
  // A6/A7 Transfer waits for the vendor; card payment settles at once.
  const s = session();
  const mod = s.state.catalog.find((m) => m.listed && m.unitPrice > 0)!;
  const totalBefore = poolOf(s.state, 'org-1', mod.id)?.total ?? 0;
  s.run({ type: 'CREATE_ORDER', moduleId: mod.id, seats: 1, payMethod: '对公转账' });
  const transfer = s.state.orders.find((o) => o.status === '待支付')!;
  s.run({ type: 'PAY_ORDER', orderId: transfer.id });
  check('A6 对公转账支付后等厂商确认', s.state.orders.find((o) => o.id === transfer.id)!.status, '待厂商确认');
  check('A6 确认前不扩容', poolOf(s.state, 'org-1', mod.id)?.total ?? 0, totalBefore);
  s.as(IDS.vendor);
  s.run({ type: 'CONFIRM_ORDER', orderId: transfer.id });
  check('A6 厂商确认后扩容', poolOf(s.state, 'org-1', mod.id)!.total, totalBefore + 1);

  const s2 = session();
  const totalBefore2 = poolOf(s2.state, 'org-1', mod.id)?.total ?? 0;
  s2.run({ type: 'CREATE_ORDER', moduleId: mod.id, seats: 1, payMethod: '在线支付' });
  const card = s2.state.orders.find((o) => o.status === '待支付')!;
  s2.run({ type: 'PAY_ORDER', orderId: card.id });
  check('A7 在线支付直接完成', s2.state.orders.find((o) => o.id === card.id)!.status, '已完成');
  check('A7 在线支付立即扩容', poolOf(s2.state, 'org-1', mod.id)!.total, totalBefore2 + 1);
}

{
  // A9 The whole chain, end to end: approved → ordered → paid → seat in hand.
  const s = session();
  const app = s.state.applications.find((a) => a.status === '待采购')!;
  s.run({ type: 'CREATE_ORDER', moduleId: app.moduleId, seats: app.seats, payMethod: '在线支付', applicationId: app.id });
  check('A9 下单后申请转为已下单', s.state.applications.find((a) => a.id === app.id)!.status, '已下单');
  const order = s.state.orders.find((o) => o.applicationId === app.id)!;
  s.run({ type: 'PAY_ORDER', orderId: order.id });
  check('A9 支付后申请完成', s.state.applications.find((a) => a.id === app.id)!.status, '已完成');
  check(
    'A9 申请人拿到该模块席位',
    assignmentsOfMember(s.state, app.applicantId).some((a) => a.moduleId === app.moduleId),
    true,
  );
}

// ================================================================ B. 席位运营

section('用例组 B · 席位运营（分配、回收、续费）');

{
  // B1 Seats are company property: another company's staff cannot hold them.
  const s = session();
  const pool = s.state.seatPools.find((p) => p.orgId === 'org-1' && spareSeats(s.state, p) > 0)!;
  const before = s.state.assignments.length;
  s.run({ type: 'ASSIGN_SEAT', poolId: pool.id, memberId: IDS.otherOrgAdmin });
  check('B1 不能把本企业席位分给外部企业成员', s.state.assignments.length, before);
}

{
  // B2 A disabled account must not be given a live seat.
  const s = session();
  const pool = s.state.seatPools.find((p) => p.orgId === 'org-1' && spareSeats(s.state, p) > 0)!;
  s.run({ type: 'SET_MEMBER_STATUS', memberId: IDS.member, status: '已停用' });
  const before = s.state.assignments.filter((a) => a.status === '生效中').length;
  s.run({ type: 'ASSIGN_SEAT', poolId: pool.id, memberId: IDS.member });
  check('B2 不能给已停用成员分配席位', s.state.assignments.filter((a) => a.status === '生效中').length, before);
}

{
  // B3 One person needs one seat per module, not two.
  const s = session();
  const pool = s.state.seatPools.find((p) => p.orgId === 'org-1' && spareSeats(s.state, p) > 1)!;
  const free = s.state.members.find(
    (m) => m.orgId === 'org-1' && m.status === '在职' &&
      !assignmentsOfMember(s.state, m.id).some((a) => a.moduleId === pool.moduleId),
  )!;
  s.run({ type: 'ASSIGN_SEAT', poolId: pool.id, memberId: free.id });
  const after1 = allocatedSeats(s.state, pool.id);
  s.run({ type: 'ASSIGN_SEAT', poolId: pool.id, memberId: free.id });
  check('B3 同一成员同一模块不重复占席位', allocatedSeats(s.state, pool.id), after1);
}

{
  // B4/B5 Revoking frees the seat back into the pool.
  const s = session();
  const live = s.state.assignments.find((a) => a.orgId === 'org-1' && a.status === '生效中')!;
  const spareBefore = spareSeats(s.state, s.state.seatPools.find((p) => p.id === live.poolId)!);
  s.run({ type: 'REVOKE_SEAT', assignmentId: live.id });
  check('B5 回收后记录转为已回收', s.state.assignments.find((a) => a.id === live.id)!.status, '已回收');
  check('B5 回收后空闲席位 +1', spareSeats(s.state, s.state.seatPools.find((p) => p.id === live.poolId)!), spareBefore + 1);
}

{
  // B6 Renewal must not shrink capacity below what is already in use.
  const s = session();
  const pool = s.state.seatPools.find((p) => p.orgId === 'org-1' && allocatedSeats(s.state, p.id) >= 2)!;
  const inUse = allocatedSeats(s.state, pool.id);
  s.run({ type: 'CREATE_ORDER', moduleId: pool.moduleId, seats: 1, payMethod: '在线支付', renewPoolId: pool.id });
  const renew = s.state.orders.find((o) => o.status === '待支付');
  if (renew) s.run({ type: 'PAY_ORDER', orderId: renew.id });
  const after = poolOf(s.state, 'org-1', pool.moduleId)!;
  check('B6 续费容量不低于在用席位数', after.total >= inUse, true);
  check('B6 续费后无人被挤掉', allocatedSeats(s.state, after.id), inUse);
  check(
    'B6 续费后不出现超卖的池',
    s.state.seatPools.every((p) => allocatedSeats(s.state, p.id) <= p.total),
    true,
  );
}

// ================================================================ C. 人员治理

section('用例组 C · 人员治理（邀请、调岗、角色变更）');

{
  // C1 A member must land in a department that actually belongs to the company.
  const s = session();
  const before = s.state.members.length;
  s.run({
    type: 'INVITE_MEMBER',
    name: '野部门测试', employeeNo: 'YG9001', title: '工程师',
    deptId: 'dept-does-not-exist', role: 'MEMBER', email: 'x@yungou.com', phone: '138****0001',
  });
  check('C1 不能邀请到不存在的部门', s.state.members.length, before);
  check(
    'C1 所有成员的部门都属于本企业',
    s.state.members.every(
      (m) => !m.deptId || s.state.departments.some((d) => d.id === m.deptId && d.orgId === m.orgId),
    ),
    true,
  );
}

{
  // C3 Demoting a department admin must not orphan their pending approvals.
  const s = session();
  const pending = s.state.applications.filter((a) => a.orgId === 'org-1' && a.status === '待部门审批');
  s.run({ type: 'SET_MEMBER_ROLE', memberId: IDS.deptAdmin, role: 'MEMBER' });
  const orphaned = pending.filter(
    (a) => !s.state.members.some((m) => inboxOf(s.state, m).some((x) => x.id === a.id)),
  );
  check('C3 部门管理员降级后待审批不悬空', orphaned.length, 0);
}

{
  // C4 Same for a transfer out of the department.
  const s = session();
  const pending = s.state.applications.filter((a) => a.orgId === 'org-1' && a.status === '待部门审批');
  s.run({ type: 'SET_MEMBER_DEPT', memberId: IDS.deptAdmin, deptId: 'dept-4' });
  const orphaned = pending.filter(
    (a) => !s.state.members.some((m) => inboxOf(s.state, m).some((x) => x.id === a.id)),
  );
  check('C4 部门管理员调岗后待审批不悬空', orphaned.length, 0);
}

{
  // C6 The company must never be left without an administrator.
  const s = session();
  const admins = s.state.members.filter((m) => m.orgId === 'org-1' && m.role === 'ORG_ADMIN' && m.status === '在职');
  check('C6 种子中企业只有一名企业管理员', admins.length, 1);
  s.run({ type: 'SET_MEMBER_STATUS', memberId: IDS.orgAdmin, status: '已停用' });
  check('C6 不能停用自己', memberOf(s.state, IDS.orgAdmin)!.status, '在职');
  s.run({ type: 'SET_MEMBER_ROLE', memberId: IDS.orgAdmin, role: 'MEMBER' });
  check('C6 不能把自己降级', memberOf(s.state, IDS.orgAdmin)!.role, 'ORG_ADMIN');
}

{
  // C7 Disabling a member returns their seats to the pool.
  const s = session();
  const held = assignmentsOfMember(s.state, IDS.holder).length;
  check('C7 郑凯持有席位', held > 0, true);
  s.run({ type: 'SET_MEMBER_STATUS', memberId: IDS.holder, status: '已停用' });
  check('C7 停用后席位全部释放', assignmentsOfMember(s.state, IDS.holder).length, 0);
}

// ================================================================ D. 数据边界

section('用例组 D · 权限与数据边界');

{
  const s = session();
  const me = memberOf(s.state, IDS.orgAdmin)!;
  check(
    'D1 只看本企业的申请',
    visibleApplications(s.state, me).every((a) => a.orgId === 'org-1'),
    true,
  );
  check('D1 只看本企业的订单', visibleOrders(s.state, me).every((o) => o.orgId === 'org-1'), true);
  check('D1 只看本企业的成员', visibleMembers(s.state, me).every((m) => m.orgId === 'org-1'), true);
  check('D1 只看本企业的审计', visibleAudit(s.state, me).every((l) => l.orgId === 'org-1'), true);

  // D2 The vendor stage is not the company's to decide.
  check(
    'D2 待厂商审批不进企业管理员待办',
    inboxOf(s.state, me).every((a) => a.status !== '待厂商审批'),
    true,
  );
}

{
  // D3 Seat accounting must hold everywhere, for every pool.
  const s = session();
  check(
    'D3 任何池的已分配数不超过容量',
    s.state.seatPools.every((p) => allocatedSeats(s.state, p.id) <= p.total),
    true,
  );
}

// ================================================================ E. 越权兜底

section('用例组 E · 服务端兜底（不能只靠界面藏按钮）');

{
  // E1 A plain member driving the same action must be refused.
  const s = session(IDS.member);
  const pool = s.state.seatPools.find((p) => p.orgId === 'org-1' && spareSeats(s.state, p) > 0)!;
  const before = s.state.assignments.length;
  s.run({ type: 'ASSIGN_SEAT', poolId: pool.id, memberId: IDS.member });
  check('E1 普通成员不能自行分配席位', s.state.assignments.length, before);
}

{
  // E2 Nor may they spend the company's money.
  const s = session(IDS.member);
  const mod = s.state.catalog.find((m) => m.listed && m.unitPrice > 0)!;
  const before = s.state.orders.length;
  s.run({ type: 'CREATE_ORDER', moduleId: mod.id, seats: 1, payMethod: '在线支付' });
  check('E2 普通成员不能创建采购订单', s.state.orders.length, before);
}

{
  // E3 Nor manage people.
  const s = session(IDS.deptAdmin);
  const before = memberOf(s.state, IDS.member)!.role;
  s.run({ type: 'SET_MEMBER_ROLE', memberId: IDS.member, role: 'ORG_ADMIN' });
  check('E3 部门管理员不能提拔他人为企业管理员', memberOf(s.state, IDS.member)!.role, before);
}

{
  // E4 A company admin holds no vendor powers, however senior they are.
  const s = session();
  const org = s.state.organizations.find((o) => o.id === 'org-1')!;
  s.run({ type: 'SET_FREE_QUOTA', orgId: 'org-1', quota: 999 });
  check('E4 企业管理员不能自行调整免费额度', s.state.organizations.find((o) => o.id === 'org-1')!.freeSeatQuota, org.freeSeatQuota);
  s.run({ type: 'SET_ORG_STATUS', orgId: 'org-1', status: '已停用' });
  check('E4 企业管理员不能改企业账号状态', s.state.organizations.find((o) => o.id === 'org-1')!.status, org.status);
  const listed = s.state.catalog.find((m) => m.listed)!;
  s.run({ type: 'SET_MODULE_PRICE', moduleId: listed.id, unitPrice: 1 });
  check('E4 企业管理员不能改模块定价', s.state.catalog.find((m) => m.id === listed.id)!.unitPrice, listed.unitPrice);
}

{
  // E5 Seeing a request in a list is not permission to sign it.
  const s = session(IDS.member);
  const someone = s.state.applications.find((a) => a.orgId === 'org-1' && a.status === '待部门审批')!;
  s.run({ type: 'DECIDE_APPLICATION', applicationId: someone.id, approve: true, comment: '我自己批了' });
  check('E5 普通成员不能审批他人申请', s.state.applications.find((a) => a.id === someone.id)!.status, '待部门审批');
}

{
  // E6 Withdrawal is the applicant's own right.
  const s = session();
  const other = s.state.applications.find((a) => a.applicantId !== IDS.orgAdmin && a.status === '待部门审批')!;
  s.run({ type: 'WITHDRAW_APPLICATION', applicationId: other.id });
  check('E6 不能撤销他人的申请', s.state.applications.find((a) => a.id === other.id)!.status, '待部门审批');
}

{
  // E7 Another company's staff are none of this admin's business.
  const s = session();
  const foreign = s.state.members.find((m) => m.orgId === 'org-2')!;
  s.run({ type: 'SET_MEMBER_STATUS', memberId: foreign.id, status: '已停用' });
  check('E7 不能停用其他企业的成员', memberOf(s.state, foreign.id)!.status, foreign.status);
  s.run({ type: 'SET_MEMBER_DEPT', memberId: foreign.id, deptId: 'dept-1' });
  check('E7 不能把其他企业成员划到本企业部门', memberOf(s.state, foreign.id)!.deptId, foreign.deptId);
}

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
