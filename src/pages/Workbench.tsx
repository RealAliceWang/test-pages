import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, BarChart3, Box, Boxes, Building2, CheckSquare, ClipboardCheck,
  ClipboardList, CreditCard, KeyRound, LayoutGrid, Receipt, UserRound, Users,
} from 'lucide-react';
import Header from '../components/layout/Header';
import RingProgress from '../components/common/RingProgress';
import SectionCard from '../components/common/SectionCard';
import MiniStat, { type MiniStatProps } from '../components/common/MiniStat';
import { useAside } from '../components/layout/asideSlot';
import WorkQueue from './workbench/WorkQueue';
import ActivityChart from './workbench/ActivityChart';
import {
  allocatedSeats, assignmentsOfMember, daysBetween, daysLeftOf, inboxOf,
  isPoolExpiring, moduleOf, useApp,
} from '../store';
import { can, canAny } from '../domain/permissions';
import { roleLabels } from '../domain/types';
import { usageHistory } from '../domain/seed';
import { daysLeftLabel, moduleLabel } from '../domain/format';
import { POOL_EXPIRING_DAYS } from '../domain/poolHealth';

export default function Workbench() {
  const navigate = useNavigate();
  const { state, me, myOrg, myDept } = useApp();

  const inbox = inboxOf(state, me);
  const myApps = state.applications.filter((a) => a.applicantId === me.id);
  const myLiveApps = myApps.filter((a) => !['已完成', '已驳回', '已撤销'].includes(a.status));
  const mySeats = assignmentsOfMember(state, me.id).filter((a) => a.status === '生效中');

  const orgPools = state.seatPools.filter((p) => p.orgId === me.orgId);
  const orgTotal = orgPools.reduce((s, p) => s + p.total, 0);
  const orgUsed = orgPools.reduce((s, p) => s + allocatedSeats(state, p.id), 0);
  const utilisation = orgTotal ? Math.round((orgUsed / orgTotal) * 100) : 0;

  /* How much of what the company already owns this person has picked up. */
  const openedModules = new Set(orgPools.map((p) => p.moduleId));
  const myModules = new Set(mySeats.map((a) => a.moduleId));

  const expiringPools = orgPools
    .map((p) => ({ pool: p, left: daysLeftOf(state, p) }))
    .filter((x) => isPoolExpiring(state, x.pool))
    .sort((a, b) => a.left - b.left);

  const unpaidOrders = state.orders.filter((o) => o.orgId === me.orgId && o.status === '待支付');
  const toConfirm = state.orders.filter((o) => o.status === '待厂商确认');

  const subtitle =
    me.role === 'VENDOR_OPS'
      ? `${myOrg.shortName} · ${roleLabels[me.role]} · 平台全局视角`
      : `${myOrg.name} · ${myDept ? `${myDept.name} · ` : ''}${roleLabels[me.role]}`;

  /* One headline number per role, so the hero states the thing that matters
     most for this identity rather than repeating the metric row.
     `ring` is only set when the figure is a bounded ratio — a dial around an
     unbounded count would imply a ceiling that does not exist. */
  const hero: {
    value: string | number;
    unit: string;
    line: string;
    ring?: number;
    cta: { label: string; to: string };
  } =
    me.role === 'MEMBER'
      ? {
          value: mySeats.length,
          unit: '我持有的席位',
          line: '当前生效的授权，可直接在客户端登录使用',
          cta: { label: '浏览模块中心', to: '/modules' },
        }
      : me.role === 'VENDOR_OPS'
        ? {
            value: inbox.length + toConfirm.length,
            unit: '待处理事项',
            line: '包含厂商审批与到账确认，处理后企业侧立即生效',
            cta: { label: '前往审批', to: '/approvals' },
          }
        : {
            value: `${utilisation}%`,
            unit: '席位利用率',
            line: `已分配 ${orgUsed} / 共 ${orgTotal} 个席位，空闲席位可直接分配无需采购`,
            ring: utilisation,
            cta: { label: '管理席位池', to: '/seats' },
          };

  /* Two bounded ratios per role. Unbounded counts stay out — a fraction with
     no denominator cannot be drawn as a bar. The hint spells out what the
     remainder of each ratio means, which is the actionable half. */
  const orgApps = state.applications.filter((a) => a.orgId === me.orgId).length;
  const vendorApps = state.applications.filter((a) => a.kind === 'QUOTA').length;

  const ratios: MiniStatProps[] =
    me.role === 'MEMBER'
      ? [
          {
            label: '申请已办结',
            current: myApps.length - myLiveApps.length,
            total: myApps.length,
            hint: `进行中 ${myLiveApps.length} 项`,
            icon: ClipboardCheck,
            onClick: () => navigate('/applications'),
          },
          {
            label: '已领取模块',
            current: myModules.size,
            total: openedModules.size,
            hint: `企业已开通，还有 ${Math.max(0, openedModules.size - myModules.size)} 个可申请`,
            icon: Boxes,
            onClick: () => navigate('/modules'),
          },
        ]
      : me.role === 'VENDOR_OPS'
        ? [
            {
              label: '待厂商审批',
              current: inbox.length,
              total: Math.max(inbox.length, vendorApps),
              hint: `本季度已处理 ${Math.max(0, vendorApps - inbox.length)} 项`,
              icon: CheckSquare,
              warn: inbox.length > 0,
              onClick: () => navigate('/approvals'),
            },
            {
              label: '待确认到账',
              current: toConfirm.length,
              total: Math.max(toConfirm.length, state.orders.length),
              hint: `累计订单 ${state.orders.length} 笔`,
              icon: CreditCard,
              warn: toConfirm.length > 0,
              onClick: () => navigate('/orders'),
            },
          ]
        : [
            {
              label: '待我审批',
              current: inbox.length,
              total: Math.max(inbox.length, orgApps),
              hint: `本企业累计 ${orgApps} 项申请，已办结 ${Math.max(0, orgApps - inbox.length)} 项`,
              icon: CheckSquare,
              warn: inbox.length > 0,
              onClick: () => navigate('/approvals'),
            },
            {
              label: '席位已分配',
              current: orgUsed,
              total: orgTotal,
              hint: `空闲 ${orgTotal - orgUsed} 个，可直接分配无需采购`,
              icon: KeyRound,
              warn: utilisation < 60,
              onClick: () => navigate('/seats'),
            },
          ];

  /* Last 7 days of the seeded history, scaled by how much of the org is in
     scope so a department view does not claim company-wide numbers. */
  const activityScale = me.role === 'VENDOR_OPS' ? 4.5 : me.role === 'MEMBER' ? 0.12 : 1;
  const activity = usageHistory.slice(-7).map((d) => ({
    label: `${Number(d.date.split('-')[1])}日`,
    value: Math.max(1, Math.round(d.launches * activityScale)),
  }));
  const activityTotal = activity.reduce((s, d) => s + d.value, 0);
  const activityAvg = Math.round(activityTotal / activity.length);
  const activityPeak = Math.max(...activity.map((d) => d.value));

  /* Colleagues worth showing: same department for members, the wider org for
     admins, and customer-side admins for the vendor. */
  const team = (
    me.role === 'VENDOR_OPS'
      ? state.members.filter((m) => m.orgId !== me.orgId && m.role === 'ORG_ADMIN')
      : state.members.filter(
          (m) =>
            m.orgId === me.orgId &&
            m.status === '在职' &&
            m.id !== me.id &&
            (me.role === 'ORG_ADMIN' || m.deptId === me.deptId),
        )
  ).slice(0, 8);

  const teamTitle =
    me.role === 'VENDOR_OPS' ? '客户企业管理员' : me.role === 'ORG_ADMIN' ? '企业成员' : '我的部门';

  /* Column count chosen so the faces always land in two rows and the last row
     is never left holding a single portrait. */
  const teamCols = team.length > 6 ? 'grid-cols-4' : team.length > 4 ? 'grid-cols-3' : 'grid-cols-2';

  const canSeeMembers = can(me.role, 'member:view-dept') || can(me.role, 'member:manage');
  const canSeeStats = canAny(me.role, ['stats:dept', 'stats:org', 'stats:platform']);

  /* Things running out of time, unified across roles into one shape. */
  const watchlist: { id: string; name: string; note: string; left: number }[] =
    me.role === 'MEMBER'
      ? mySeats.map((a) => {
          const pool = state.seatPools.find((p) => p.id === a.poolId);
          const mod = moduleOf(state, a.moduleId);
          return {
            id: a.id,
            name: mod ? moduleLabel(mod) : a.moduleId,
            note: `已用 ${a.usedDays} 天`,
            left: pool ? daysBetween(state.now, pool.expireDate) : 0,
          };
        })
      : expiringPools.map(({ pool, left }) => {
          const mod = moduleOf(state, pool.moduleId);
          return {
            id: pool.id,
            name: mod ? moduleLabel(mod) : pool.moduleId,
            note: `${allocatedSeats(state, pool.id)}/${pool.total} 在用 · ${pool.expireDate}`,
            left,
          };
        });

  /* Entry points this identity can actually reach. */
  const shortcuts = [
    { to: '/modules', label: '模块中心', hint: '浏览并申请授权', icon: LayoutGrid, show: can(me.role, 'module:browse') },
    { to: '/approvals', label: '审批中心', hint: `${inbox.length} 项待处理`, icon: CheckSquare, show: canAny(me.role, ['approval:dept', 'approval:org', 'approval:vendor']) },
    { to: '/seats', label: '席位池', hint: `空闲 ${orgTotal - orgUsed} 个`, icon: KeyRound, show: canAny(me.role, ['seat:view-dept', 'seat:manage']) },
    { to: '/members', label: '成员管理', hint: '角色与部门', icon: Users, show: canSeeMembers },
    { to: '/orders', label: '订单与账单', hint: `${unpaidOrders.length} 笔待支付`, icon: Receipt, show: can(me.role, 'order:view') },
    { to: '/statistics', label: '用量统计', hint: '席位与活跃度', icon: BarChart3, show: canSeeStats },
    { to: '/my-modules', label: '我的授权', hint: `${mySeats.length} 个席位`, icon: Box, show: can(me.role, 'assignment:view-own') },
    { to: '/applications', label: '我的申请', hint: `${myLiveApps.length} 项进行中`, icon: ClipboardList, show: can(me.role, 'application:create') },
    { to: '/vendor/orgs', label: '企业账号', hint: '认证与额度', icon: Building2, show: can(me.role, 'vendor:org-manage') },
    { to: '/profile', label: '个人信息', hint: '账号与偏好', icon: UserRound, show: true },
  ]
    .filter((s) => s.show)
    .slice(0, 6);

  const hour = Number(state.now.slice(11, 13)) || 9;
  const greeting = `${hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好'}，${me.name}`;

  /* Publish the work queue into the shell's right-hand rail. */
  useAside(
    <WorkQueue
      items={me.role === 'MEMBER' ? myApps : inbox}
      pools={orgPools}
      ownView={me.role === 'MEMBER'}
    />,
    [me.id, myApps.length, inbox.length, orgPools.length, state.assignments.length],
  );

  return (
    <div>
      <Header title={greeting} subtitle={subtitle} search />

      {/* Cards stretch to their row, so the two columns always end on the same
          line. Every card body below is built to spend that extra height on
          content rather than leaving a void at the bottom. */}
      <div className="px-7 pb-7 grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Identity card — the warm anchor, carrying who you are and the one
            ratio that matters for this role. */}
        <div className="xl:col-span-5 xl:order-1 panel-feature px-6 py-6 flex flex-col justify-between min-h-[212px]">
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[20px] font-extrabold leading-[1.2] tracking-[-0.02em]">{me.name}</p>
              <p className="text-[13px] font-semibold mt-1.5">{me.title}</p>
              <p className="text-[12px] font-medium mt-1">
                {myOrg.shortName}
                {myDept ? ` · ${myDept.name}` : ''}
              </p>
            </div>

            {hero.ring !== undefined ? (
              <RingProgress
                value={hero.ring}
                size={78}
                thickness={8}
                track="rgba(255,255,255,0.24)"
                caption={hero.unit}
                label={
                  <span className="display-num text-[16px] text-white">{Math.round(hero.ring)}%</span>
                }
              />
            ) : (
              <span
                className="w-[62px] h-[62px] rounded-full flex items-center justify-center text-[26px] font-extrabold shrink-0 ring-2 ring-white/30"
                style={{ background: me.avatarColor }}
              >
                {me.name.charAt(0)}
              </span>
            )}
          </div>

          <div className="relative mt-5 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <span className="display-num text-[40px]">{hero.value}</span>
              <p className="text-[12px] font-medium mt-1.5">{hero.unit}</p>
            </div>
            <button
              onClick={() => navigate(hero.cta.to)}
              className="shrink-0 h-[38px] px-5 rounded-full bg-white text-[13.5px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-transform duration-200 hover:scale-[1.04] active:scale-[0.97]"
              style={{ color: 'var(--color-feature-deep)' }}
            >
              {hero.cta.label}
              <ArrowRight size={14} strokeWidth={2.6} />
            </button>
          </div>
        </div>

        {/* Two ratio tiles, sized to sit level with the identity card */}
        <div className="xl:col-span-7 xl:order-2 grid grid-cols-2 auto-rows-fr gap-4">
          {ratios.map((r) => (
            <MiniStat key={r.label} {...r} />
          ))}
        </div>

        {/* Activity — the big number plus a week of bars */}
        <SectionCard
          title="近 7 天活跃度"
          actionLabel={canSeeStats ? '用量统计' : undefined}
          to="/statistics"
          className="xl:col-span-7 xl:order-4"
        >
          <div className="flex items-baseline gap-2.5">
            <span className="display-num text-[34px] text-text">{activityTotal}</span>
            <span className="text-[13px] font-semibold text-text-muted">次模块启动</span>
            <span className="ml-auto text-[12px] text-text-placeholder">日均 {activityAvg} 次</span>
          </div>
          <div className="mt-5 flex-1 min-h-[172px]">
            <ActivityChart data={activity} focusLabel={`${activityPeak} 次`} />
          </div>
        </SectionCard>

        {/* People — avatar row, straight from the reference */}
        <SectionCard
          title={teamTitle}
          actionLabel={canSeeMembers ? '查看全部' : undefined}
          to="/members"
          className="xl:col-span-5 xl:order-3"
        >
          {team.length > 0 ? (
            /* Two rows of faces, spaced apart to fill the card. */
            <div className={`flex-1 grid ${teamCols} gap-x-2 gap-y-4 content-evenly`}>
              {team.map((m) => (
                <div key={m.id} className="flex flex-col items-center text-center gap-2">
                  <span
                    className="w-[46px] h-[46px] rounded-full flex items-center justify-center text-white text-[16px] font-bold"
                    style={{ background: m.avatarColor }}
                  >
                    {m.name.charAt(0)}
                  </span>
                  <div className="min-w-0 w-full">
                    <p className="text-[13px] font-semibold text-text truncate">{m.name}</p>
                    <p className="text-[12px] text-text-muted truncate mt-[2px]">{m.title}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="flex-1 flex items-center justify-center text-[13px] text-text-muted">
              暂无可展示的成员
            </p>
          )}
        </SectionCard>

        {/* Expiry watchlist, or the member's own seats */}
        <SectionCard
          title={me.role === 'MEMBER' ? '我的席位' : '到期预警'}
          actionLabel="查看全部"
          to={me.role === 'MEMBER' ? '/my-modules' : '/seats'}
          className="xl:col-span-5 xl:order-5"
        >
          <div className="flex-1 flex flex-col gap-2">
            {watchlist.slice(0, 3).map((w) => (
              <button
                key={w.id}
                onClick={() => navigate(me.role === 'MEMBER' ? '/my-modules' : '/seats')}
                className="panel-inset flex-1 px-4 py-3 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors hover:bg-surface-hover"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-text truncate">{w.name}</p>
                  <p className="text-[12px] text-text-muted mt-[3px] truncate">{w.note}</p>
                </div>
                <span
                  className={`num text-[12px] font-bold rounded-full px-2.5 py-[3px] shrink-0 ${
                    w.left <= POOL_EXPIRING_DAYS
                      ? 'bg-warning-bg text-warning'
                      : 'bg-surface-hover text-text-secondary'
                  }`}
                >
                  {daysLeftLabel(w.left)}
                </span>
              </button>
            ))}

            {watchlist.length === 0 && (
              <div className="flex-1 flex flex-col justify-center py-8 text-center">
                <span className="w-[44px] h-[44px] rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-3">
                  <KeyRound size={20} className="text-text-placeholder" />
                </span>
                <p className="text-[13px] text-text-muted">
                  {me.role === 'MEMBER' ? '你还没有被分配任何席位' : '近期没有到期的席位池'}
                </p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Quick links — the reference's "Documents" tile, repurposed */}
        <SectionCard title="快捷入口" className="xl:col-span-7 xl:order-6">
          {/* Two rows either way: three across for the admin's six entries,
              two across for the shorter member set. */}
          <div
            className={`flex-1 grid grid-cols-2 ${shortcuts.length > 4 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} auto-rows-fr gap-3`}
          >
            {shortcuts.map((s) => (
              <button
                key={s.to}
                onClick={() => navigate(s.to)}
                className="panel-inset px-4 py-4 flex flex-col items-start justify-between gap-3 text-left cursor-pointer transition-colors hover:bg-surface-hover"
              >
                <span className="w-[38px] h-[38px] rounded-full bg-surface border border-border flex items-center justify-center">
                  <s.icon size={17} className="text-text-secondary" strokeWidth={2} />
                </span>
                <div className="min-w-0 w-full">
                  <p className="text-[13px] font-semibold text-text truncate">{s.label}</p>
                  <p className="text-[12px] text-text-muted mt-[3px] truncate">{s.hint}</p>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
