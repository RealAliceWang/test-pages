import { useState } from 'react';
import {
  ChevronDown, KeyRound, RefreshCw, TrendingDown, UserMinus, UserPlus,
} from 'lucide-react';
import Header from '../components/layout/Header';
import MetricCard, { type Metric } from '../components/common/MetricCard';
import TabFilter from '../components/common/TabFilter';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { moduleIconMap } from '../assets/moduleIcons';
import { can } from '../domain/permissions';
import {
  allocatedSeats, daysBetween, deptOf, isExpired, isPoolExpiring, memberOf,
  moduleOf, spareSeats, useApp,
} from '../store';
import type { PayMethod, SeatPool } from '../domain/types';

const filters = ['全部', '有空闲', '已占满', '即将到期'] as const;

export default function SeatPools() {
  const { state, me, myOrg, dispatch } = useApp();

  const manage = can(me.role, 'seat:manage');
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<SeatPool | null>(null);
  const [pickedMember, setPickedMember] = useState('');
  const [revoking, setRevoking] = useState<string | null>(null);
  const [renewing, setRenewing] = useState<SeatPool | null>(null);
  const [renewSeats, setRenewSeats] = useState(0);
  const [payMethod, setPayMethod] = useState<PayMethod>('在线支付');

  const pools = state.seatPools.filter((p) => p.orgId === me.orgId);

  const totalSeats = pools.reduce((s, p) => s + p.total, 0);
  const usedSeats = pools.reduce((s, p) => s + allocatedSeats(state, p.id), 0);
  const idleSeats = totalSeats - usedSeats;
  const utilisation = totalSeats ? Math.round((usedSeats / totalSeats) * 100) : 0;

  // Idle commercial seats are real money sitting unused — surface the number.
  const idleCost = pools.reduce((sum, p) => {
    const mod = moduleOf(state, p.moduleId);
    if (!mod || mod.unitPrice === 0) return sum;
    return sum + spareSeats(state, p) * mod.unitPrice;
  }, 0);

  const sel = filters[tab];
  const list = pools.filter((p) => {
    const mod = moduleOf(state, p.moduleId);
    const spare = spareSeats(state, p);
    if (sel === '有空闲' && spare === 0) return false;
    if (sel === '已占满' && spare > 0) return false;
    if (sel === '即将到期' && !isPoolExpiring(state, p)) return false;
    if (search && !(mod?.name.includes(search) || mod?.code.includes(search))) return false;
    return true;
  });

  // Members without a seat in this module are the valid assignment targets.
  const candidatesFor = (pool: SeatPool) => {
    const held = new Set(
      state.assignments.filter((a) => a.moduleId === pool.moduleId && a.status === '生效中').map((a) => a.memberId),
    );
    return state.members.filter(
      (m) =>
        m.orgId === me.orgId &&
        m.status === '在职' &&
        m.role !== 'VENDOR_OPS' &&
        !held.has(m.id) &&
        // Department admins may only serve their own department.
        (me.role === 'ORG_ADMIN' || m.deptId === me.deptId),
    );
  };

  const stats: Metric[] = [
    { icon: KeyRound, value: totalSeats, label: '持有席位总数', hint: `分布在 ${pools.length} 个席位池`, tone: 'accent' },
    { icon: UserPlus, value: usedSeats, label: '已分配', hint: '已发放给在职成员', tone: 'positive' },
    { icon: UserMinus, value: idleSeats, label: '空闲可分配', hint: '可直接分配，无需采购', tone: idleSeats ? 'attention' : 'neutral' },
    {
      icon: TrendingDown,
      value: `${utilisation}%`,
      label: '席位利用率',
      hint: `已分配 ${usedSeats} / 共 ${totalSeats} 席位`,
      tone: utilisation < 60 ? 'attention' : 'positive',
    },
  ];

  return (
    <div>
      <Header
        title="席位池"
        subtitle={`${myOrg.shortName} · ${manage ? '可分配与回收席位' : `${deptOf(state, me.deptId)?.name ?? '本部门'}视图（只读）`} · 共 ${pools.length} 个池`}
      />

      <div className="px-7 pb-7 flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-5 stagger">
          {stats.map((s, i) => (
            <MetricCard key={i} metric={s} />
          ))}
        </div>

        {idleCost > 0 && (
          <div className="panel px-5 py-4 flex items-start gap-3">
            <span className="w-[30px] h-[30px] rounded-full bg-warning-bg flex items-center justify-center shrink-0">
              <TrendingDown size={16} className="text-warning" />
            </span>
            <p className="text-[14px] text-text-secondary leading-relaxed">
              当前有 <span className="text-text font-semibold">{idleSeats}</span> 个空闲席位，
              其中商业版闲置对应年费约 <span className="text-warning font-semibold">¥{idleCost.toLocaleString()}</span>。
              闲置席位可先分配给新成员，或在续费时缩减数量。
            </p>
          </div>
        )}

        <div className="panel px-5 py-3.5 flex items-center justify-between gap-4">
          <TabFilter tabs={filters.map((f) => ({ label: f }))} activeIndex={tab} onChange={setTab} />
          <div className="w-[240px]">
            <SearchBar placeholder="搜索模块名称或编号..." value={search} onChange={setSearch} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {list.map((pool) => {
            const mod = moduleOf(state, pool.moduleId);
            const used = allocatedSeats(state, pool.id);
            const spare = spareSeats(state, pool);
            const pct = pool.total ? Math.round((used / pool.total) * 100) : 0;
            const left = daysBetween(state.now, pool.expireDate);
            const expired = isExpired(state, pool);
            const expanded = open === pool.id;
            const holders = state.assignments.filter((a) => a.poolId === pool.id && a.status === '生效中');
            const visibleHolders = me.role === 'ORG_ADMIN'
              ? holders
              : holders.filter((a) => memberOf(state, a.memberId)?.deptId === me.deptId);

            return (
              <div key={pool.id} className="panel overflow-hidden">
                <div className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-surface-secondary transition-colors"
                  onClick={() => setOpen(expanded ? null : pool.id)}>
                  <img src={moduleIconMap[mod?.icon ?? 'building'] || moduleIconMap.building} alt=""
                    className="w-[40px] h-[40px] object-contain shrink-0" />

                  <div className="w-[220px] shrink-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-medium text-text truncate">{mod?.name}</p>
                      <span className={`shrink-0 text-[12px] px-[6px] py-[1px] rounded-sm ${
                        mod?.edition === '商业版' ? 'bg-orange-bg text-orange' : 'bg-surface-hover text-text-muted'
                      }`}>
                        {mod?.edition}
                      </span>
                    </div>
                    <p className="text-[13px] text-text-muted mt-[3px]">{mod?.code} · {pool.source}</p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="meter flex-1">
                        <span
                          style={{
                            width: `${pct}%`,
                            background: expired
                              ? 'var(--color-text-placeholder)'
                              : pct >= 100 || pct < 50
                                ? 'var(--color-warning-light)'
                                : 'var(--color-signal)',
                          }}
                        />
                      </div>
                      <span className="text-[14px] font-semibold text-text tabular-nums shrink-0">{used} / {pool.total}</span>
                    </div>
                    <p className="text-[12px] text-text-muted mt-[5px]">
                      利用率 {pct}% · 空闲 {spare} 个
                      {pct < 50 && !expired && <span className="text-warning"> · 利用率偏低，续费可考虑缩减</span>}
                    </p>
                  </div>

                  <div className="w-[150px] shrink-0 text-right">
                    <p className="text-[13px] text-text">{pool.expireDate}</p>
                    <p className={`text-[12px] mt-[3px] ${!expired && isPoolExpiring(state, pool) ? 'text-warning' : 'text-text-muted'}`}>
                      {expired ? '已过期' : `剩余 ${left} 天`}
                    </p>
                  </div>

                  <StatusBadge status={expired ? '已过期' : spare > 0 ? '席位充足' : '席位已满'} />
                  <ChevronDown size={15} className={`text-text-muted shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>

                {expanded && (
                  <div className="border-t border-divider px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[14px] font-medium text-text">
                        席位持有人（{visibleHolders.length}
                        {me.role !== 'ORG_ADMIN' && holders.length !== visibleHolders.length && ` / 全企业 ${holders.length}`}）
                      </p>
                      {manage && (
                        <div className="flex items-center gap-2">
                          <button
                            disabled={spare === 0 || expired}
                            onClick={() => { setAssigning(pool); setPickedMember(''); }}
                            className={`h-[32px] px-4 rounded-full text-[13px] font-semibold inline-flex items-center gap-[6px] transition-colors ${
                              spare === 0 || expired
                                ? 'bg-surface-hover text-text-placeholder cursor-not-allowed'
                                : 'btn-primary text-white cursor-pointer'
                            }`}
                            title={spare === 0 ? '无空闲席位，请先扩容' : expired ? '席位池已过期' : ''}>
                            <UserPlus size={13} /> 分配席位
                          </button>
                          {mod && mod.unitPrice > 0 && (
                            <button onClick={() => { setRenewing(pool); setRenewSeats(pool.total); setPayMethod('在线支付'); }}
                              className="h-[32px] px-4 rounded-full text-[13px] font-semibold text-primary bg-primary-bg hover:brightness-95 transition-colors cursor-pointer inline-flex items-center gap-[6px]">
                              <RefreshCw size={13} /> 续费
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {visibleHolders.length > 0 ? (
                      <div className="border border-border rounded-sm divide-y divide-divider">
                        {visibleHolders.map((a) => {
                          const holder = memberOf(state, a.memberId);
                          const dept = deptOf(state, holder?.deptId ?? null);
                          const assigner = memberOf(state, a.assignedById);
                          return (
                            <div key={a.id} className="px-4 py-3 flex items-center gap-4">
                              <div className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-white text-[13px] shrink-0"
                                style={{ background: holder?.avatarColor ?? '#CBD5E1' }}>
                                {holder?.name.charAt(0) ?? '—'}
                              </div>
                              <div className="w-[150px] shrink-0">
                                <p className="text-[14px] text-text">{holder?.name}</p>
                                <p className="text-[12px] text-text-muted mt-[2px]">{holder?.employeeNo} · {dept?.name}</p>
                              </div>
                              <div className="w-[120px] shrink-0 text-[13px] text-text-secondary">{holder?.title}</div>
                              <div className="flex-1 text-[13px] text-text-muted">
                                已用 {a.usedDays} 天 · 最后使用 {a.lastUsed}
                              </div>
                              <div className="text-[12px] text-text-muted shrink-0">
                                {assigner?.name} 于 {a.assignedAt} 分配
                              </div>
                              {manage && (
                                <button onClick={() => setRevoking(a.id)}
                                  className="h-[32px] px-3.5 rounded-full text-[13px] font-semibold text-danger bg-danger-bg hover:brightness-95 transition-all cursor-pointer shrink-0 inline-flex items-center gap-1">
                                  <UserMinus size={12} /> 回收
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="border border-border rounded-sm py-8 text-center">
                        <p className="text-[13px] text-text-muted">
                          {me.role === 'ORG_ADMIN' ? '该池尚未分配任何席位' : '本部门在该池中没有席位'}
                        </p>
                      </div>
                    )}

                    {!manage && (
                      <p className="text-[12px] text-text-placeholder mt-3">
                        部门管理员可查看本部门席位占用情况；分配与回收由企业管理员操作。
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {list.length === 0 && (
          <div className="panel py-16 text-center">
            <KeyRound size={44} className="mx-auto mb-4 text-text-placeholder" />
            <p className="text-[15px] text-text-muted">没有符合条件的席位池</p>
          </div>
        )}
      </div>

      {/* Assign a spare seat */}
      <Modal open={Boolean(assigning)} onClose={() => setAssigning(null)} title="分配席位" width={480}>
        {assigning && (
          <div className="flex flex-col gap-4">
            <div className="px-4 py-3 rounded-sm bg-surface-secondary">
              <p className="text-[14px] text-text">{moduleOf(state, assigning.moduleId)?.name}</p>
              <p className="text-[13px] text-text-muted mt-1">
                当前空闲 {spareSeats(state, assigning)} 个席位 · 到期日 {assigning.expireDate}
              </p>
            </div>

            <div>
              <label className="block text-[14px] text-text-secondary mb-2">选择成员</label>
              <select value={pickedMember} onChange={(e) => setPickedMember(e.target.value)}
                className="w-full h-[36px] px-3 text-[14px] field focus:border-primary focus:outline-none cursor-pointer">
                <option value="">请选择要分配的成员</option>
                {candidatesFor(assigning).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} · {deptOf(state, m.deptId)?.name} · {m.title}
                  </option>
                ))}
              </select>
              <p className="text-[12px] text-text-placeholder mt-2">
                已持有该模块席位的成员不会出现在列表中
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button disabled={!pickedMember}
                onClick={() => {
                  dispatch({ type: 'ASSIGN_SEAT', poolId: assigning.id, memberId: pickedMember });
                  setAssigning(null);
                }}
                className={`h-[36px] px-5 rounded-full text-[14px] font-semibold transition-colors ${
                  pickedMember ? 'btn-primary text-white cursor-pointer' : 'bg-surface-hover text-text-placeholder cursor-not-allowed'
                }`}>
                确认分配
              </button>
              <button onClick={() => setAssigning(null)}
                className="btn-soft h-[38px] px-5 text-[14px] font-semibold cursor-pointer">
                取消
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reclaim a seat back to the pool */}
      <Modal open={Boolean(revoking)} onClose={() => setRevoking(null)} title="回收席位" width={460}>
        {revoking && (() => {
          const a = state.assignments.find((x) => x.id === revoking);
          const holder = a ? memberOf(state, a.memberId) : undefined;
          const mod = a ? moduleOf(state, a.moduleId) : undefined;
          return (
            <div className="flex flex-col gap-4">
              <div className="px-4 py-3 rounded-sm bg-warning-bg">
                <p className="text-[14px] text-warning leading-relaxed">
                  回收后 {holder?.name} 将立即无法启动「{mod?.name}」，该席位释放回池中可重新分配给他人。
                  历史使用记录（已用 {a?.usedDays} 天）会保留在审计日志中。
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => { dispatch({ type: 'REVOKE_SEAT', assignmentId: revoking }); setRevoking(null); }}
                  className="h-[38px] px-5 rounded-full text-[14px] font-semibold bg-danger text-white hover:brightness-110 transition-all cursor-pointer">
                  确认回收
                </button>
                <button onClick={() => setRevoking(null)}
                  className="btn-soft h-[38px] px-5 text-[14px] font-semibold cursor-pointer">
                  取消
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Renew by placing a new order against the same pool */}
      <Modal open={Boolean(renewing)} onClose={() => setRenewing(null)} title="续费席位池" width={520}>
        {renewing && (() => {
          const mod = moduleOf(state, renewing.moduleId)!;
          const used = allocatedSeats(state, renewing.id);
          const amount = mod.unitPrice * renewSeats;
          const shrinking = renewSeats < renewing.total;
          return (
            <div className="flex flex-col gap-4">
              <div className="border border-border rounded-sm divide-y divide-divider">
                {[
                  { label: '模块', value: `${mod.name}（${mod.edition}）` },
                  { label: '当前席位', value: `${renewing.total} 个，其中 ${used} 个在用` },
                  { label: '当前到期日', value: renewing.expireDate },
                  { label: '续费后到期', value: `延长 ${mod.duration} 天` },
                ].map((r) => (
                  <div key={r.label} className="flex px-4 py-[10px] text-[14px]">
                    <span className="w-[100px] shrink-0 text-text-muted">{r.label}</span>
                    <span className="text-text">{r.value}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[14px] text-text-secondary mb-2">续费席位数</label>
                <input type="number" min={used} max={99} value={renewSeats}
                  onChange={(e) => setRenewSeats(Math.max(used, Math.min(99, Number(e.target.value) || used)))}
                  className="w-[130px] h-[36px] px-3 text-[14px] field focus:border-primary focus:outline-none" />
                <p className="text-[12px] text-text-placeholder mt-2">
                  不能低于在用席位数 {used} 个。
                  {shrinking && <span className="text-success"> 缩减 {renewing.total - renewSeats} 个可节省 ¥{((renewing.total - renewSeats) * mod.unitPrice).toLocaleString()}/年。</span>}
                </p>
              </div>

              <div>
                <label className="block text-[14px] text-text-secondary mb-2">支付方式</label>
                <div className="flex items-center gap-2">
                  {(['在线支付', '对公转账'] as PayMethod[]).map((p) => (
                    <button key={p} onClick={() => setPayMethod(p)}
                      className={`h-[34px] px-4 rounded-full text-[13px] font-semibold transition-colors cursor-pointer ${
                        payMethod === p ? 'bg-primary-bg text-primary' : 'bg-surface-hover text-text-secondary hover:bg-border'
                      }`}>
                      {p}
                    </button>
                  ))}
                </div>
                <p className="text-[12px] text-text-placeholder mt-2">
                  {payMethod === '在线支付' ? '支付后席位立即续期' : '需厂商确认到账后席位才续期'}
                </p>
              </div>

              <div className="px-4 py-3 rounded-sm bg-surface-secondary flex items-center justify-between">
                <span className="text-[14px] text-text-secondary">应付金额</span>
                <span className="text-[20px] font-bold text-orange">¥{amount.toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => {
                  dispatch({ type: 'CREATE_ORDER', moduleId: renewing.moduleId, seats: renewSeats, payMethod, renewPoolId: renewing.id });
                  setRenewing(null);
                }}
                  className="h-[36px] px-5  text-[14px] font-medium btn-primary text-white cursor-pointer">
                  生成续费订单
                </button>
                <button onClick={() => setRenewing(null)}
                  className="btn-soft h-[38px] px-5 text-[14px] font-semibold cursor-pointer">
                  取消
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
