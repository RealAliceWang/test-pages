import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Building2,
  ChevronDown,
  Info,
  MoreVertical,
  Shield,
  TriangleAlert,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react';

import Header from '../components/layout/Header';
import MetricCard, { type Metric } from '../components/common/MetricCard';
import Modal from '../components/common/Modal';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import TabFilter from '../components/common/TabFilter';
import { can, scopeOf } from '../domain/permissions';
import { roleLabels, type Member, type MemberStatus, type Role } from '../domain/types';
import { moduleLabel } from '../domain/format';
import { assignmentsOfMember, deptOf, moduleOf, useApp, visibleMembers } from '../store';

const statusTabs: (MemberStatus | '全部')[] = ['全部', '在职', '待激活', '已停用'];

/** Roles an org admin can grant here; vendor accounts are out of an org's reach. */
const assignableRoles: Role[] = ['ORG_ADMIN', 'DEPT_ADMIN', 'MEMBER'];
const invitableRoles: Role[] = ['DEPT_ADMIN', 'MEMBER'];

const roleHints: Record<Role, string> = {
  ORG_ADMIN: '管理全企业成员、席位池与订单，审批企业级申请',
  DEPT_ADMIN: '查看本部门成员与席位，审批本部门申请',
  MEMBER: '浏览模块、提交申请、使用已分配的席位',
  VENDOR_OPS: '厂商侧运营账号，不参与企业内部管理',
};

const READ_ONLY_TIP = '仅企业管理员可操作';

const columns = [
  '成员信息',
  '职称',
  '部门',
  '角色',
  '联系方式',
  '持有席位',
  '状态',
  '入职时间',
  '最后登录',
  '操作',
];

const inputCls =
  'w-full h-[32px] px-3 text-[14px] text-text field placeholder:text-text-placeholder focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all';
const btnGhost = 'btn-ghost h-[38px] px-5 text-[13.5px] font-semibold cursor-pointer';
const btnPrimary =
  'btn-primary h-[38px] px-5 text-[13.5px] font-semibold cursor-pointer disabled:cursor-not-allowed';
const btnDanger =
  'h-[38px] px-5 rounded-full bg-danger text-[13.5px] font-semibold text-white cursor-pointer hover:brightness-110 transition-all';

interface InviteForm {
  name: string;
  employeeNo: string;
  title: string;
  deptId: string;
  role: Role;
  email: string;
  phone: string;
}

function emptyInvite(deptId: string): InviteForm {
  return { name: '', employeeNo: '', title: '', deptId, role: 'MEMBER', email: '', phone: '' };
}

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
  className?: string;
}

function Select({ value, onChange, options, ariaLabel, className = '' }: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[32px] pl-3 pr-7 text-[14px] text-text-secondary field appearance-none cursor-pointer focus:border-primary focus:outline-none transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-[8px] top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
      />
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-text-secondary mb-[6px]">
        {label}
        {required && <span className="text-danger ml-[2px]">*</span>}
      </span>
      {children}
    </label>
  );
}

function RoleTag({ role }: { role: Role }) {
  if (role === 'ORG_ADMIN') {
    return (
      <span className="inline-flex items-center gap-1 rounded-sm bg-primary-bg px-2 py-[2px] text-[13px] font-medium text-primary whitespace-nowrap">
        <Shield size={12} />
        {roleLabels[role]}
      </span>
    );
  }
  if (role === 'DEPT_ADMIN') {
    return (
      <span className="inline-flex items-center gap-1 rounded-sm bg-warning-bg px-2 py-[2px] text-[13px] font-medium text-warning whitespace-nowrap">
        <Building2 size={12} />
        {roleLabels[role]}
      </span>
    );
  }
  return <span className="text-[14px] text-text-secondary whitespace-nowrap">{roleLabels[role]}</span>;
}

interface MenuItemProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  danger?: boolean;
}

function MenuItem({ label, onClick, disabled, title, danger }: MenuItemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      onClick={onClick}
      className={`block w-full px-3 py-[7px] text-left text-[14px] transition-colors ${
        disabled
          ? 'text-text-placeholder cursor-not-allowed'
          : danger
            ? 'text-danger hover:bg-danger-bg cursor-pointer'
            : 'text-text-secondary hover:bg-surface-hover cursor-pointer'
      }`}
    >
      {label}
    </button>
  );
}

export default function Members() {
  const { state, me, myOrg, dispatch } = useApp();

  const canManage = can(me.role, 'member:manage');
  const scope = scopeOf(me.role);
  const orgDepts = state.departments.filter((d) => d.orgId === myOrg.id);

  const [tab, setTab] = useState(0);
  const [deptFilter, setDeptFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [menu, setMenu] = useState<string | null>(null);
  const [seatRow, setSeatRow] = useState<string | null>(null);

  const [roleTarget, setRoleTarget] = useState<Member | null>(null);
  const [nextRole, setNextRole] = useState<Role>('MEMBER');
  const [deptTarget, setDeptTarget] = useState<Member | null>(null);
  const [nextDept, setNextDept] = useState('');
  const [disableTarget, setDisableTarget] = useState<Member | null>(null);
  const [disableReason, setDisableReason] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState<InviteForm>(() => emptyInvite(orgDepts[0]?.id ?? ''));

  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) setMenu(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const base = useMemo(() => visibleMembers(state, me), [state, me]);

  const rows = useMemo(() => {
    const status = statusTabs[tab];
    const q = search.trim().toLowerCase();
    return base.filter((m) => {
      if (status !== '全部' && m.status !== status) return false;
      if (deptFilter !== 'all' && m.deptId !== deptFilter) return false;
      if (roleFilter !== 'all' && m.role !== roleFilter) return false;
      if (!q) return true;
      return [m.name, m.employeeNo, m.email].some((f) => f.toLowerCase().includes(q));
    });
  }, [base, tab, deptFilter, roleFilter, search]);

  const liveSeatsOf = (memberId: string) =>
    assignmentsOfMember(state, memberId).filter((a) => a.status === '生效中');

  /** Some modules share a display name across editions, so seat chips must
   * carry the edition — rendered via the shared moduleLabel formatter. */
  const seatLabel = (moduleId: string) => {
    const mod = moduleOf(state, moduleId);
    return mod ? moduleLabel(mod) : '未知模块';
  };

  const countOf = (s: MemberStatus) => base.filter((m) => m.status === s).length;

  const myDeptName = deptOf(state, me.deptId)?.name;
  const scopeLabel =
    scope === 'org' ? '全企业' : scope === 'dept' ? (myDeptName ?? '本部门') : scope === 'platform' ? '全平台' : '仅本人';

  const cards: Metric[] = [
    { icon: Users, value: base.length, label: '成员总数', hint: `数据范围：${scopeLabel}`, tone: 'accent' },
    { icon: UserCheck, value: countOf('在职'), label: '在职', hint: '可正常登录并持有席位', tone: 'positive' },
    { icon: UserCog, value: countOf('待激活'), label: '待激活', hint: '已邀请，尚未完成首次登录', tone: 'attention' },
    { icon: UserX, value: countOf('已停用'), label: '已停用', hint: '停用即回收其全部席位', tone: 'neutral' },
  ];

  function setField<K extends keyof InviteForm>(key: K, value: InviteForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openRole(m: Member) {
    setMenu(null);
    setNextRole(m.role);
    setRoleTarget(m);
  }

  function openDept(m: Member) {
    setMenu(null);
    setNextDept(m.deptId ?? orgDepts[0]?.id ?? '');
    setDeptTarget(m);
  }

  function openInvite() {
    setForm(emptyInvite(orgDepts[0]?.id ?? ''));
    setInviteOpen(true);
  }

  function submitRole() {
    if (!roleTarget) return;
    dispatch({ type: 'SET_MEMBER_ROLE', memberId: roleTarget.id, role: nextRole });
    setRoleTarget(null);
  }

  function submitDept() {
    if (!deptTarget || !nextDept) return;
    dispatch({ type: 'SET_MEMBER_DEPT', memberId: deptTarget.id, deptId: nextDept });
    setDeptTarget(null);
  }

  function closeDisable() {
    setDisableTarget(null);
    setDisableReason('');
  }

  function submitDisable() {
    if (!disableTarget) return;
    const reason = disableReason.trim();
    dispatch({
      type: 'SET_MEMBER_STATUS',
      memberId: disableTarget.id,
      status: '已停用',
      ...(reason ? { reason } : {}),
    });
    closeDisable();
  }

  function enableMember(m: Member) {
    setMenu(null);
    dispatch({ type: 'SET_MEMBER_STATUS', memberId: m.id, status: '在职' });
  }

  function submitInvite() {
    dispatch({
      type: 'INVITE_MEMBER',
      name: form.name.trim(),
      employeeNo: form.employeeNo.trim(),
      title: form.title.trim(),
      deptId: form.deptId,
      role: form.role,
      email: form.email.trim(),
      phone: form.phone.trim(),
    });
    setInviteOpen(false);
  }

  const inviteReady =
    form.name.trim() !== '' &&
    form.employeeNo.trim() !== '' &&
    form.title.trim() !== '' &&
    form.deptId !== '' &&
    form.phone.trim() !== '' &&
    form.email.trim().includes('@');

  const disableSeats = disableTarget ? liveSeatsOf(disableTarget.id) : [];

  const actions = (
    <button
      type="button"
      disabled={!canManage}
      title={!canManage ? READ_ONLY_TIP : undefined}
      onClick={openInvite}
      className="btn-primary flex items-center gap-[6px] h-[38px] px-5 text-[13.5px] font-semibold cursor-pointer disabled:cursor-not-allowed"
    >
      <UserPlus size={15} />
      邀请成员
    </button>
  );

  return (
    <div>
      <Header
        title="成员管理"
        subtitle={`共 ${base.length} 名成员 · 数据范围：${scopeLabel}`}
        actions={actions}
      />

      <div className="px-7 pb-7 flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-5 stagger">
          {cards.map((c) => (
            <MetricCard key={c.label} metric={c} />
          ))}
        </div>

        {!canManage && (
          <div className="flex items-start gap-2 rounded-md bg-primary-bg px-4 py-3">
            <Info size={15} className="text-primary mt-[2px] shrink-0" />
            <p className="text-[13px] text-primary leading-relaxed">
              当前身份为{roleLabels[me.role]}，可查看「{scopeLabel}」范围内的成员。邀请成员、变更角色与部门、停用账号均由企业管理员执行，
              下方操作项以禁用态展示，便于了解该角色的能力边界。
            </p>
          </div>
        )}

        <div className="panel px-5 py-3 flex items-center justify-between gap-4">
          <TabFilter tabs={statusTabs.map((s) => ({ label: s }))} activeIndex={tab} onChange={setTab} />
          <div className="flex items-center gap-2 shrink-0">
            {scope === 'org' && (
              <Select
                ariaLabel="按部门筛选"
                className="w-[150px]"
                value={deptFilter}
                onChange={setDeptFilter}
                options={[
                  { value: 'all', label: '全部部门' },
                  ...orgDepts.map((d) => ({ value: d.id, label: d.name })),
                ]}
              />
            )}
            <Select
              ariaLabel="按角色筛选"
              className="w-[132px]"
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: 'all', label: '全部角色' },
                ...assignableRoles.map((r) => ({ value: r, label: roleLabels[r] })),
              ]}
            />
            <div className="w-[220px]">
              <SearchBar placeholder="搜索姓名、工号或邮箱..." value={search} onChange={setSearch} />
            </div>
          </div>
        </div>

        <div ref={tableRef} className="panel">
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr className="border-b border-hairline">
                  {columns.map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[13px] font-normal text-text-muted whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="px-5 py-12 text-center text-[14px] text-text-muted">
                      没有符合条件的成员
                    </td>
                  </tr>
                )}
  
                {rows.map((m, i) => {
                  const seats = liveSeatsOf(m.id);
                  const isSelf = m.id === me.id;
                  const expanded = seatRow === m.id;
                  const roleTip = !canManage ? READ_ONLY_TIP : isSelf ? '不能变更自己的角色' : undefined;
                  const statusTip = !canManage ? READ_ONLY_TIP : isSelf ? '不能停用自己' : undefined;
  
                  return (
                    <Fragment key={m.id}>
                      <tr className={`hover:bg-surface-secondary transition-colors ${i ? 'border-t border-divider' : ''}`}>
                        <td className="px-5 py-[14px]">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-white text-[14px] shrink-0"
                              style={{ background: m.avatarColor }}
                            >
                              {m.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[14px] text-text leading-tight">
                                {m.name}
                                {isSelf && (
                                  <span className="ml-[6px] rounded-sm bg-primary-bg px-[5px] py-[1px] text-[12px] text-primary">
                                    本人
                                  </span>
                                )}
                              </p>
                              <p className="text-[13px] text-text-muted leading-tight mt-[3px]">{m.employeeNo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-[14px] text-[14px] text-text-secondary whitespace-nowrap">{m.title}</td>
                        <td className="px-5 py-[14px] text-[14px] text-text-secondary whitespace-nowrap">
                          {deptOf(state, m.deptId)?.name ?? '—'}
                        </td>
                        <td className="px-5 py-[14px]">
                          <RoleTag role={m.role} />
                        </td>
                        <td className="px-5 py-[14px] whitespace-nowrap">
                          <p className="text-[13px] text-text-secondary leading-tight">{m.email}</p>
                          <p className="text-[13px] text-text-muted leading-tight mt-[3px]">{m.phone}</p>
                        </td>
                        <td className="px-5 py-[14px]">
                          <button
                            type="button"
                            disabled={seats.length === 0}
                            title={seats.length > 0 ? '查看持有的模块' : '当前未持有席位'}
                            onClick={() => setSeatRow(expanded ? null : m.id)}
                            className={`inline-flex items-center gap-1 rounded-sm px-2 py-[2px] text-[13px] whitespace-nowrap transition-colors ${
                              seats.length === 0
                                ? 'text-text-muted cursor-default'
                                : expanded
                                  ? 'bg-primary-bg text-primary cursor-pointer'
                                  : 'text-text-secondary hover:bg-surface-hover cursor-pointer'
                            }`}
                          >
                            {seats.length} 个席位
                            {seats.length > 0 && (
                              <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
                            )}
                          </button>
                        </td>
                        <td className="px-5 py-[14px]">
                          <StatusBadge status={m.status} />
                        </td>
                        <td className="px-5 py-[14px] text-[13px] text-text-muted whitespace-nowrap">{m.joinedAt}</td>
                        <td className="px-5 py-[14px] text-[13px] text-text-muted whitespace-nowrap">{m.lastLogin}</td>
                        <td className="px-5 py-[14px]">
                          <div className="relative">
                            <button
                              type="button"
                              aria-label={`${m.name} 的操作`}
                              onClick={() => setMenu(menu === m.id ? null : m.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer hover:bg-surface-hover transition-colors"
                            >
                              <MoreVertical size={14} className="text-text-muted" />
                            </button>
  
                            {menu === m.id && (
                              <div className="panel-floating absolute right-0 top-full mt-1 z-20 min-w-[152px] py-1">
                                {!canManage && (
                                  <p className="px-3 py-[6px] mb-1 border-b border-divider text-[12px] text-text-muted">
                                    只读视角 · {READ_ONLY_TIP}
                                  </p>
                                )}
                                <MenuItem
                                  label="变更角色"
                                  disabled={!canManage || isSelf}
                                  title={roleTip}
                                  onClick={() => openRole(m)}
                                />
                                <MenuItem
                                  label="调整部门"
                                  disabled={!canManage}
                                  title={!canManage ? READ_ONLY_TIP : undefined}
                                  onClick={() => openDept(m)}
                                />
                                {m.status === '已停用' ? (
                                  <MenuItem
                                    label="启用成员"
                                    disabled={!canManage}
                                    title={!canManage ? READ_ONLY_TIP : undefined}
                                    onClick={() => enableMember(m)}
                                  />
                                ) : (
                                  <MenuItem
                                    label="停用成员"
                                    danger
                                    disabled={!canManage || isSelf}
                                    title={statusTip}
                                    onClick={() => {
                                      setMenu(null);
                                      setDisableTarget(m);
                                    }}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
  
                      {expanded && (
                        <tr className="bg-surface-secondary">
                          <td colSpan={columns.length} className="px-5 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[13px] text-text-muted">{m.name} 持有的席位：</span>
                              {seats.map((a) => (
                                <span
                                  key={a.id}
                                  className="rounded-sm bg-surface border border-border px-2 py-[2px] text-[13px] text-text-secondary"
                                >
                                  {seatLabel(a.moduleId)}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={roleTarget !== null} onClose={() => setRoleTarget(null)} title="变更角色" width={480}>
        {roleTarget && (
          <>
            <p className="text-[14px] text-text-secondary leading-relaxed">
              为 <span className="text-text font-medium">{roleTarget.name}</span>（{roleTarget.employeeNo} ·{' '}
              {deptOf(state, roleTarget.deptId)?.name ?? '—'}）选择新的角色，角色决定其数据范围与可执行操作。
            </p>

            <div className="mt-4 flex flex-col gap-2">
              {assignableRoles.map((r) => (
                <label
                  key={r}
                  className={`flex items-start gap-3 rounded-md border px-4 py-3 cursor-pointer transition-colors ${
                    nextRole === r ? 'border-primary bg-primary-bg' : 'border-border hover:bg-surface-hover'
                  }`}
                >
                  <input
                    type="radio"
                    name="member-role"
                    className="mt-[3px] accent-primary"
                    checked={nextRole === r}
                    onChange={() => setNextRole(r)}
                  />
                  <span>
                    <span className="block text-[14px] text-text">
                      {roleLabels[r]}
                      {r === roleTarget.role && <span className="ml-[6px] text-[12px] text-text-muted">当前角色</span>}
                    </span>
                    <span className="block text-[13px] text-text-muted mt-[2px] leading-relaxed">{roleHints[r]}</span>
                  </span>
                </label>
              ))}
            </div>

            {nextRole === 'ORG_ADMIN' && (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-danger/30 bg-danger-bg px-4 py-3">
                <TriangleAlert size={15} className="text-danger mt-[2px] shrink-0" />
                <p className="text-[13px] text-danger leading-relaxed">
                  该角色将获得全企业席位、订单与审批权限，请确认这是有意的高风险操作。
                </p>
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button type="button" className={btnGhost} onClick={() => setRoleTarget(null)}>
                取消
              </button>
              <button type="button" className={btnPrimary} disabled={nextRole === roleTarget.role} onClick={submitRole}>
                确认变更
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={deptTarget !== null} onClose={() => setDeptTarget(null)} title="调整部门" width={440}>
        {deptTarget && (
          <>
            <p className="text-[14px] text-text-secondary leading-relaxed">
              将 <span className="text-text font-medium">{deptTarget.name}</span> 从「
              {deptOf(state, deptTarget.deptId)?.name ?? '未分配'}」调整至新的部门。
            </p>

            <div className="mt-4">
              <Field label="目标部门" required>
                <Select
                  ariaLabel="目标部门"
                  value={nextDept}
                  onChange={setNextDept}
                  options={orgDepts.map((d) => ({ value: d.id, label: `${d.name}（${d.code}）` }))}
                />
              </Field>
            </div>

            <p className="mt-3 text-[13px] text-text-muted leading-relaxed">
              调整部门不影响该成员已持有的席位，席位始终由企业席位池统一管理；其后续申请将进入新部门的审批队列。
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button type="button" className={btnGhost} onClick={() => setDeptTarget(null)}>
                取消
              </button>
              <button
                type="button"
                className={btnPrimary}
                disabled={!nextDept || nextDept === deptTarget.deptId}
                onClick={submitDept}
              >
                确认调整
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={disableTarget !== null} onClose={closeDisable} title="停用成员" width={500}>
        {disableTarget && (
          <>
            <div className="flex items-start gap-3">
              <div className="w-[36px] h-[36px] rounded-md bg-danger-bg flex items-center justify-center shrink-0">
                <TriangleAlert size={18} className="text-danger" />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] text-text">确认停用「{disableTarget.name}」的账号？</p>
                <p className="text-[13px] text-text-muted mt-1">
                  {disableTarget.employeeNo} · {deptOf(state, disableTarget.deptId)?.name ?? '—'} ·{' '}
                  {roleLabels[disableTarget.role]}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-md bg-warning-bg px-4 py-3">
              <p className="text-[14px] text-warning leading-relaxed">
                {disableSeats.length > 0
                  ? `停用后将自动回收该成员持有的 ${disableSeats.length} 个席位，释放回企业席位池，可重新分配给他人。`
                  : '该成员当前未持有席位，停用后账号将无法登录，不涉及席位回收。'}
              </p>
              {disableSeats.length > 0 && (
                <div className="mt-[10px] flex flex-wrap gap-2">
                  {disableSeats.map((a) => (
                    <span key={a.id} className="rounded-sm bg-surface px-2 py-[2px] text-[13px] text-text-secondary">
                      {seatLabel(a.moduleId)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <p className="mt-3 text-[13px] text-text-muted leading-relaxed">
              停用后可再次启用，但已回收的席位不会自动归还，需要重新分配。
            </p>

            <div className="mt-3">
              <Field label="原因 / 备注（选填）">
                <textarea
                  value={disableReason}
                  rows={2}
                  placeholder="如：成员离职、违反数据安全规范等，便于日后审计追溯"
                  onChange={(e) => setDisableReason(e.target.value)}
                  className="w-full px-3 py-[8px] text-[14px] text-text field placeholder:text-text-placeholder focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all resize-none leading-relaxed"
                />
              </Field>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button type="button" className={btnGhost} onClick={closeDisable}>
                取消
              </button>
              <button type="button" className={btnDanger} onClick={submitDisable}>
                确认停用并回收席位
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="邀请成员" width={560}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="姓名" required>
            <input
              className={inputCls}
              value={form.name}
              placeholder="请输入成员姓名"
              onChange={(e) => setField('name', e.target.value)}
            />
          </Field>
          <Field label="工号" required>
            <input
              className={inputCls}
              value={form.employeeNo}
              placeholder="如 YG0035"
              onChange={(e) => setField('employeeNo', e.target.value)}
            />
          </Field>
          <Field label="职称" required>
            <input
              className={inputCls}
              value={form.title}
              placeholder="如 结构工程师"
              onChange={(e) => setField('title', e.target.value)}
            />
          </Field>
          <Field label="所属部门" required>
            <Select
              ariaLabel="所属部门"
              value={form.deptId}
              onChange={(v) => setField('deptId', v)}
              options={orgDepts.map((d) => ({ value: d.id, label: d.name }))}
            />
          </Field>
          <Field label="角色" required>
            <Select
              ariaLabel="角色"
              value={form.role}
              onChange={(v) => setField('role', v as Role)}
              options={invitableRoles.map((r) => ({ value: r, label: roleLabels[r] }))}
            />
          </Field>
          <Field label="手机号" required>
            <input
              className={inputCls}
              value={form.phone}
              placeholder="如 138****2860"
              onChange={(e) => setField('phone', e.target.value)}
            />
          </Field>
          <div className="col-span-2">
            <Field label="邮箱" required>
              <input
                className={inputCls}
                value={form.email}
                placeholder="用于接收激活邀请，如 name@yungou.com"
                onChange={(e) => setField('email', e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-md bg-primary-bg px-4 py-3">
          <Info size={14} className="text-primary mt-[3px] shrink-0" />
          <p className="text-[13px] text-primary leading-relaxed">
            新成员创建后状态为「待激活」，激活后才可提交申请与使用席位；席位不随成员创建发放，需从企业席位池另行分配。
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-[13px] text-text-muted">带 * 为必填项，邮箱需包含 @</p>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" className={btnGhost} onClick={() => setInviteOpen(false)}>
              取消
            </button>
            <button type="button" className={btnPrimary} disabled={!inviteReady} onClick={submitInvite}>
              发送邀请
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
