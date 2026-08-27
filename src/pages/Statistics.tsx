import { useMemo, useState } from 'react';
import {
  BarChart3,
  ChevronDown,
  Gauge,
  Inbox,
  Info,
  Layers,
  PackageX,
  PieChart as PieChartIcon,
  TrendingDown,
  UserCheck,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Header from '../components/layout/Header';
import StatusBadge from '../components/common/StatusBadge';
import {
  allocatedSeats,
  daysBetween,
  deptOf,
  memberOf,
  moduleOf,
  orgOf,
  POOL_EXPIRING_DAYS,
  spareSeats,
  useApp,
  visibleAssignments,
  visibleMembers,
} from '../store';
import { can, scopeOf } from '../domain/permissions';
import { METER_FILL, poolHealth } from '../domain/poolHealth';
import { daysLeftLabel } from '../domain/format';
import { usageHistory } from '../domain/seed';
import { chart, chartSeries, chartTooltip } from '../theme';
import MetricCard, { type Metric } from '../components/common/MetricCard';
import RingProgress from '../components/common/RingProgress';

const ACCENTS = chartSeries;

const axisTick = { fontSize: 13, fill: chart.axis };
const axisLine = { stroke: chart.grid };
const tooltipStyle = chartTooltip;

const card = 'panel p-6';

const PERIOD_OPTIONS = [
  { label: '近 7 天', days: 7 },
  { label: '近 14 天', days: 14 },
  { label: '近 30 天', days: 30 },
] as const;

type PeriodDays = (typeof PERIOD_OPTIONS)[number]['days'];

/** Shifts a seeded 'MM-DD' label by `days` (may be negative). The seed never
 *  crosses a year boundary, so a throwaway fixed-year Date is enough. */
function shiftLabel(mmdd: string, days: number): string {
  const [month, day] = mmdd.split('-').map(Number);
  const d = new Date(2026, month - 1, day);
  d.setDate(d.getDate() + days);
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** usageHistory only seeds 14 real days. Shorter windows slice its tail; the
 *  30-day window is padded with earlier days cycled from the same pattern
 *  (lightly damped so it doesn't read as an exact repeat) rather than
 *  inventing a second, disconnected dataset. */
function historyForPeriod(days: number): typeof usageHistory {
  if (days <= usageHistory.length) return usageHistory.slice(usageHistory.length - days);
  const missing = days - usageHistory.length;
  const lead = Array.from({ length: missing }, (_, idx) => {
    const stepsBack = missing - idx;
    const source = usageHistory[usageHistory.length - 1 - (stepsBack % usageHistory.length)];
    const damp = 0.7 + 0.05 * (stepsBack % 5);
    return {
      date: shiftLabel(usageHistory[0].date, -stepsBack),
      launches: Math.max(1, Math.round(source.launches * damp)),
      activeMembers: Math.max(1, Math.round(source.activeMembers * damp)),
    };
  });
  return [...lead, ...usageHistory];
}

export default function Statistics() {
  const { state, me, myOrg, myDept } = useApp();
  const scope = scopeOf(me.role);
  const [periodDays, setPeriodDays] = useState<PeriodDays>(14);

  const pools = useMemo(
    () => (scope === 'platform' ? state.seatPools : state.seatPools.filter((p) => p.orgId === me.orgId)),
    [state.seatPools, scope, me.orgId],
  );

  // Members of other organizations are not part of state.members, so
  // visibleAssignments cannot reach them. The platform view therefore
  // aggregates straight from the pools in scope.
  const activeSeats = useMemo(() => {
    if (scope === 'platform') {
      const poolIds = new Set(pools.map((p) => p.id));
      return state.assignments.filter((a) => a.status === '生效中' && poolIds.has(a.poolId));
    }
    return visibleAssignments(state, me).filter((a) => a.status === '生效中');
  }, [state, me, scope, pools]);

  // Enterprise-wide allocated total, independent of the department scoping
  // below — the usage-trend factor further down estimates a department's
  // overall share of company activity, not just the pools it happens to use.
  const orgAllocated = pools.reduce((sum, p) => sum + allocatedSeats(state, p.id), 0);

  // A department owns no seat quota of its own — pools are a shared org
  // resource — so the ring / low-rate / idle numbers a department admin sees
  // are scoped down to the pools their own members actually hold seats in,
  // the same subset the "本部门持有席位" card already relies on. Org and
  // platform scope keep using every pool in scope (scopePools === pools).
  const scopePools = useMemo(() => {
    if (scope !== 'dept') return pools;
    const heldPoolIds = new Set(activeSeats.map((a) => a.poolId));
    return pools.filter((p) => heldPoolIds.has(p.id));
  }, [scope, pools, activeSeats]);

  const totalSeats = scopePools.reduce((sum, p) => sum + p.total, 0);
  const allocated = scopePools.reduce((sum, p) => sum + allocatedSeats(state, p.id), 0);
  const spare = Math.max(0, totalSeats - allocated);
  const utilization = totalSeats ? Math.round((allocated / totalSeats) * 100) : 0;
  const idleCost = scopePools.reduce(
    (sum, p) => sum + spareSeats(state, p) * (moduleOf(state, p.moduleId)?.unitPrice ?? 0),
    0,
  );

  const holders = new Set(activeSeats.map((a) => a.memberId)).size;
  const scopeMemberCount = visibleMembers(state, me).length;
  const orgCount = new Set(pools.map((p) => p.orgId)).size;

  /* Pools sitting below the healthy line (poolHealth's "low" bucket). The
     ring above already carries the overall rate, so the metric row reports
     the actionable count instead. */
  const lowRateCount = scopePools.filter(
    (p) => p.total && poolHealth(Math.round((allocatedSeats(state, p.id) / p.total) * 100)) === 'low',
  ).length;

  const scopeLabel =
    scope === 'platform'
      ? `全平台（${orgCount} 家企业）`
      : scope === 'org'
        ? `全企业（${myOrg.shortName}）`
        : `本部门（${myDept?.name ?? '未分配部门'}）`;

  const scopeNote =
    scope === 'platform'
      ? '当前为厂商运营视角：席位与利用率按全平台各企业席位池汇总，用量趋势为平台估算值。'
      : scope === 'org'
        ? '当前为企业管理员视角：覆盖本企业全部部门的席位池与成员用量。'
        : '当前为部门管理员视角：席位池是企业共有资源，表中「总席位 / 已分配」为企业口径，「本部门持有」列才是你所辖成员实际占用的席位。';

  const cards: Metric[] = [
    {
      icon: Layers,
      label: scope === 'dept' ? '本部门持有席位' : '席位总量',
      value: scope === 'dept' ? activeSeats.length : totalSeats,
      hint: scope === 'dept' ? `涉及 ${scopePools.length} 个模块的席位池` : `分布在 ${pools.length} 个席位池`,
      tone: 'accent',
    },
    {
      icon: Gauge,
      label: '低利用率席位池',
      value: lowRateCount,
      hint: '低于 50% 健康线的池',
      tone: 'attention',
    },
    {
      icon: UserCheck,
      label: scope === 'dept' ? '本部门活跃成员' : '活跃成员',
      value: holders,
      hint: scope === 'platform' ? `覆盖 ${orgCount} 家企业` : `范围内共 ${scopeMemberCount} 人`,
      tone: 'positive',
    },
    {
      icon: PackageX,
      label: '闲置席位',
      value: spare,
      hint: idleCost > 0 ? `闲置成本约 ¥${idleCost.toLocaleString()}/年` : '闲置席位均为免费版，无成本',
      tone: 'neutral',
    },
  ];

  // The seeded history describes one organization. Scale it up for the platform
  // view and down by the department's share of allocated seats.
  const factor =
    scope === 'platform'
      ? 4.5
      : scope === 'dept'
        ? Math.max(0.15, orgAllocated ? activeSeats.length / orgAllocated : 1)
        : 1;

  const trend = useMemo(
    () =>
      historyForPeriod(periodDays).map((p) => ({
        date: p.date,
        launches: Math.round(p.launches * factor),
        activeMembers: Math.max(1, Math.round(p.activeMembers * factor)),
      })),
    [factor, periodDays],
  );

  const trendTitle =
    scope === 'platform' ? '平台用量趋势（全平台汇总）' : scope === 'org' ? '企业用量趋势' : '本部门用量趋势';
  const trendNote =
    scope === 'platform'
      ? `近 ${periodDays} 天 · 跨企业汇总估算`
      : scope === 'org'
        ? `近 ${periodDays} 天 · 全企业实际值`
        : `近 ${periodDays} 天 · 按本部门席位占比 ${Math.round(factor * 100)}% 折算`;

  const moduleRanking = useMemo(() => {
    const counts = new Map<string, number>();
    activeSeats.forEach((a) => counts.set(a.moduleId, (counts.get(a.moduleId) ?? 0) + 1));
    return [...counts.entries()]
      .map(([moduleId, seats]) => {
        const mod = moduleOf(state, moduleId);
        // Free and commercial editions share a module name, so it must be shown.
        return { name: `${mod?.name ?? moduleId}·${mod?.edition === '商业版' ? '商业' : '免费'}`, seats };
      })
      .sort((a, b) => b.seats - a.seats)
      .slice(0, 8);
  }, [activeSeats, state]);

  const poolRows = useMemo(
    () =>
      pools
        .map((p) => {
          const mod = moduleOf(state, p.moduleId);
          const alloc = allocatedSeats(state, p.id);
          return {
            id: p.id,
            name: mod?.name ?? p.moduleId,
            edition: mod?.edition ?? '免费版',
            unitPrice: mod?.unitPrice ?? 0,
            orgName: orgOf(state, p.orgId)?.shortName ?? p.orgId,
            source: p.source,
            total: p.total,
            alloc,
            held: activeSeats.filter((a) => a.poolId === p.id).length,
            spare: Math.max(0, p.total - alloc),
            rate: p.total ? Math.round((alloc / p.total) * 100) : 0,
            expireDate: p.expireDate,
            daysLeft: daysBetween(state.now, p.expireDate),
          };
        })
        .sort((a, b) => a.rate - b.rate),
    [pools, state, activeSeats],
  );

  const lowRows = poolRows.filter((r) => poolHealth(r.rate) === 'low');
  const lowWaste = lowRows.reduce((sum, r) => sum + r.spare * r.unitPrice, 0);

  const showDistribution = can(me.role, 'stats:org') || can(me.role, 'stats:platform');

  const distribution = useMemo(() => {
    if (!showDistribution) return [];
    const counts = new Map<string, number>();
    activeSeats.forEach((a) => {
      const key =
        scope === 'platform'
          ? (orgOf(state, a.orgId)?.shortName ?? a.orgId)
          : (deptOf(state, memberOf(state, a.memberId)?.deptId ?? null)?.name ?? '未归属部门');
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [activeSeats, scope, state, showDistribution]);

  return (
    <div>
      <Header
        title="用量统计"
        subtitle={`数据范围：${scopeLabel} · 近 ${periodDays} 天`}
        actions={
          <div className="relative">
            <select
              aria-label="统计周期"
              value={periodDays}
              onChange={(e) => setPeriodDays(Number(e.target.value) as PeriodDays)}
              className="field h-[32px] pl-3 pr-[30px] text-[14px] text-text appearance-none cursor-pointer"
            >
              {PERIOD_OPTIONS.map((o) => (
                <option key={o.days} value={o.days}>
                  统计周期：{o.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-[10px] top-1/2 -translate-y-1/2 text-text-placeholder pointer-events-none"
            />
          </div>
        }
      />

      <div className="px-7 pb-7 flex flex-col gap-4">
        {/* Metric cards */}
        {/* Bento: the utilisation dial is the page's thesis, so it gets its own
            tall cell rather than being flattened into the metric row. */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
          <div className="xl:col-span-4 panel px-6 py-6 flex items-center gap-6">
            <RingProgress value={utilization} size={124} thickness={12} caption="席位利用率" />
            <div className="min-w-0">
              <p className="eyebrow">席位利用率</p>
              <p className="num text-[14px] font-semibold text-text mt-2.5">
                {allocated} / {totalSeats} 席
              </p>
              <p className="text-[13px] text-text-muted mt-1.5 leading-relaxed">
                {poolHealth(utilization) !== 'low'
                  ? '利用率健康，续费时可维持现有规模'
                  : '低于 50% 健康线，续费可考虑缩减'}
                {scope === 'dept' ? '（仅统计本部门涉及的模块）' : ''}
              </p>
            </div>
          </div>

          <div className="xl:col-span-8 grid grid-cols-2 gap-5 stagger">
            {cards.map((c) => (
              <MetricCard key={c.label} metric={c} />
            ))}
          </div>
        </div>

        {/* Scope banner — the same page serves three very different audiences */}
        <div className="panel-inset px-5 py-3.5 flex items-start gap-2.5">
          <Info size={15} className="text-primary shrink-0 mt-[2px]" />
          <p className="text-[13px] text-text-secondary leading-relaxed">
            <span className="font-semibold text-text">数据范围：{scopeLabel}</span>
            {' · '}
            {scopeNote}
          </p>
        </div>

        {/* Usage trend */}
        <div className={card}>
          <div className="flex items-baseline justify-between mb-5">
            <h3 className="text-[13.5px] font-bold text-text tracking-[-0.01em]">{trendTitle}</h3>
            <span className="text-[13px] text-text-muted">{trendNote}</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="statLaunches" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chart.primary} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={chart.primary} stopOpacity={0.02} />
                </linearGradient>
                {/* Comparison series takes the palette's secondary, not the
                    success tone: active members is a neutral measure, and
                    green has to keep meaning "good" elsewhere. */}
                <linearGradient id="statMembers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chart.secondary} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={chart.secondary} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
              <XAxis dataKey="date" tick={axisTick} axisLine={axisLine} tickLine={false} />
              <YAxis yAxisId="left" tick={axisTick} axisLine={axisLine} tickLine={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={axisTick}
                axisLine={axisLine}
                tickLine={false}
                unit="人"
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 13, color: chart.axis, paddingTop: 10 }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="launches"
                stroke={chart.primary}
                strokeWidth={2}
                fill="url(#statLaunches)"
                name="模块启动次数"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="activeMembers"
                stroke={chart.secondary}
                strokeWidth={2}
                fill="url(#statMembers)"
                name="活跃成员数"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Module ranking + scope distribution */}
        <div className={`grid grid-cols-1 gap-4 ${showDistribution ? 'lg:grid-cols-2' : ''}`}>
          <div className={card}>
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-[13.5px] font-bold text-text tracking-[-0.01em]">模块持有席位排行</h3>
              <span className="text-[13px] text-text-muted">Top 8 · 生效中席位</span>
            </div>
            {moduleRanking.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-2">
                <div className="w-[44px] h-[44px] rounded-full bg-surface-hover flex items-center justify-center">
                  <BarChart3 size={20} className="text-text-placeholder" />
                </div>
                <p className="text-[13px] text-text-muted mt-1 text-center">当前范围内暂无生效中的席位</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={moduleRanking} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} horizontal={false} />
                  <XAxis type="number" tick={axisTick} axisLine={axisLine} tickLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    width={104}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="seats" fill={chart.signal} radius={[0, 6, 6, 0]} barSize={18} name="持有席位" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {showDistribution && (
            <div className={card}>
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="text-[13.5px] font-bold text-text tracking-[-0.01em]">
                  {scope === 'platform' ? '企业维度席位分布' : '部门维度席位分布'}
                </h3>
                <span className="text-[13px] text-text-muted">
                  {scope === 'platform' ? '按企业统计持有席位' : '按部门统计持有席位'}
                </span>
              </div>
              {distribution.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-2">
                  <div className="w-[44px] h-[44px] rounded-full bg-surface-hover flex items-center justify-center">
                    <PieChartIcon size={20} className="text-text-placeholder" />
                  </div>
                  <p className="text-[13px] text-text-muted mt-1 text-center">暂无可分布的席位数据</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={104}
                      dataKey="value"
                      stroke="none"
                      fontSize={13}
                      // Unrelated global state (e.g. the flash toast auto-
                      // dismissing) re-renders the whole app and can hand this
                      // chart a new `distribution` array reference even when
                      // its values haven't changed. Recharts treats a new
                      // array as "new data" and replays the enter animation,
                      // which flashes the chart empty mid-transition. The
                      // entrance animation isn't essential here, so it's
                      // switched off rather than chasing every upstream
                      // reference change.
                      isAnimationActive={false}
                      label={({ name, value }) => `${name} ${value}`}
                      labelLine={{ stroke: 'var(--color-text-placeholder)', strokeWidth: 1 }}
                    >
                      {distribution.map((d, i) => (
                        <Cell key={d.name} fill={ACCENTS[i % ACCENTS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} 席`} contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>

        {/* Utilization detail */}
        <div className="panel">
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[13.5px] font-bold text-text tracking-[-0.01em]">席位利用率明细</h3>
              <span className="text-[13px] text-text-muted">共 {poolRows.length} 个席位池 · 按利用率升序</span>
            </div>
            <div className="mt-3 flex items-start gap-2 bg-warning-bg rounded-sm px-3 py-2">
              <TrendingDown size={15} className="text-warning shrink-0 mt-[2px]" />
              <p className="text-[13px] text-text-secondary leading-relaxed">
                利用率低于 50% 的席位池已标黄（{lowRows.length} 个）：闲置席位不会自动退费，
                续费时可考虑缩减席位数
                {lowWaste > 0 ? `，这部分闲置席位年成本约 ¥${lowWaste.toLocaleString()}` : ''}。
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table w-full text-[14px]">
              <thead>
                <tr className="bg-surface-secondary text-text-muted text-[13px]">
                  {scope === 'platform' && <th className="text-left font-normal px-5 py-3 whitespace-nowrap">企业</th>}
                  <th className="text-left font-normal px-5 py-3 whitespace-nowrap">模块</th>
                  <th className="text-left font-normal px-5 py-3 whitespace-nowrap">版本</th>
                  <th className="text-right font-normal px-5 py-3 whitespace-nowrap">总席位</th>
                  <th className="text-right font-normal px-5 py-3 whitespace-nowrap">
                    {scope === 'dept' ? '全企业已分配' : '已分配'}
                  </th>
                  {scope === 'dept' && (
                    <th className="text-right font-normal px-5 py-3 whitespace-nowrap">本部门持有</th>
                  )}
                  <th className="text-right font-normal px-5 py-3 whitespace-nowrap">空闲</th>
                  <th className="text-left font-normal px-5 py-3 w-[180px] whitespace-nowrap">利用率</th>
                  <th className="text-left font-normal px-5 py-3 whitespace-nowrap">到期日</th>
                </tr>
              </thead>
              <tbody>
                {poolRows.map((r) => {
                  /* Health bucket and fill come from the shared poolHealth
                     contract — under-used rows get the pale caution tint so
                     the eye lands on the exceptions. */
                  const health = poolHealth(r.rate);
                  return (
                    <tr
                      key={r.id}
                      className={`border-t border-hairline ${health === 'low' ? 'bg-caution-light/15' : 'hover:bg-surface-hover'} transition-colors`}
                    >
                      {scope === 'platform' && (
                        <td className="px-5 py-3 text-text-secondary whitespace-nowrap">{r.orgName}</td>
                      )}
                      <td className="px-5 py-3 text-text whitespace-nowrap">{r.name}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <StatusBadge status={r.edition} />
                      </td>
                      <td className="px-5 py-3 text-right text-text tabular-nums">{r.total}</td>
                      <td className="px-5 py-3 text-right text-text-secondary tabular-nums">{r.alloc}</td>
                      {scope === 'dept' && (
                        <td className="px-5 py-3 text-right text-text tabular-nums">{r.held}</td>
                      )}
                      <td
                        className={`px-5 py-3 text-right tabular-nums ${r.spare > 0 ? 'text-warning' : 'text-text-muted'}`}
                      >
                        {r.spare}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="meter flex-1 min-w-[70px]">
                            <span style={{ width: `${Math.min(r.rate, 100)}%`, background: METER_FILL[health] }} />
                          </div>
                          <span
                            className={`num text-[13px] font-semibold w-[38px] text-right ${
                              health === 'low' ? 'text-warning' : 'text-text'
                            }`}
                          >
                            {r.rate}%
                          </span>
                          {health === 'full' && <StatusBadge status="已满" />}
                        </div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className="text-text-secondary tabular-nums">{r.expireDate}</span>
                        {r.daysLeft < 0 ? (
                          <span className="text-[13px] text-danger ml-2">已过期</span>
                        ) : r.daysLeft <= POOL_EXPIRING_DAYS ? (
                          <span className="text-[13px] text-warning ml-2">{daysLeftLabel(r.daysLeft)}</span>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
                {poolRows.length === 0 && (
                  <tr className="border-t border-border">
                    <td colSpan={9} className="px-5 py-16">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-[44px] h-[44px] rounded-full bg-surface-hover flex items-center justify-center">
                          <Inbox size={20} className="text-text-placeholder" />
                        </div>
                        <p className="text-[13px] text-text-muted mt-1 text-center">当前范围内还没有席位池</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
