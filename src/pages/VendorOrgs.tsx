import { useMemo, useState } from 'react';
import {
  BadgeCheck, Ban, Building2, CalendarClock, ChevronDown, CircleCheck,
  Coins, Power, ShieldAlert, SlidersHorizontal, Ticket, TriangleAlert, Users,
} from 'lucide-react';
import Header from '../components/layout/Header';
import MetricCard, { type Metric } from '../components/common/MetricCard';
import Modal from '../components/common/Modal';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import TabFilter from '../components/common/TabFilter';
import {
  allocatedSeats, daysBetween, isExpired, isPoolExpiring, membersOfOrg, moduleOf,
  spareSeats, useApp,
} from '../store';
import { VENDOR_ORG_ID } from '../domain/seed';
import { daysLeftLabel } from '../domain/format';
import { METER_FILL, POOL_EXPIRING_DAYS, poolHealth } from '../domain/poolHealth';
import type { Organization, SeatPool } from '../domain/types';

/** A pool of one customer org, enriched with everything the row renders. */
interface PoolRow {
  pool: SeatPool;
  moduleName: string;
  edition: string;
  allocated: number;
  spare: number;
  restDays: number;
  expired: boolean;
  expiring: boolean;
}

interface OrgRow {
  org: Organization;
  memberCount: number;
  pools: PoolRow[];
  totalSeats: number;
  allocated: number;
  usage: number;
  /** Free seats already handed out, the floor for any quota change. */
  grantedUsed: number;
  revenue: number;
  expiringCount: number;
}

const statusTabs = ['全部', '正常', '已停用'] as const;
const verifyOptions = ['全部认证状态', '已认证', '未认证'] as const;

const selectCls =
  'h-[32px] px-2 text-[14px] text-text-secondary field outline-none focus:border-primary transition-colors cursor-pointer';
const numberInputCls = 'field w-full h-[40px] px-4 text-[15px] text-text';

const columns = ['企业', '成员', '席位（已分配/持有）', '免费额度', '累计成交额', '状态', '创建时间', '联系人', '操作'];

const money = (n: number) => `¥${n.toLocaleString()}`;

function UsageBar({ percent }: { percent: number }) {
  // Shared meter; thresholds and fills come from the site-wide pool-health scale.
  return (
    <div className="meter w-[92px]">
      <span style={{ width: `${Math.min(percent, 100)}%`, background: METER_FILL[poolHealth(percent)] }} />
    </div>
  );
}

export default function VendorOrgs() {
  const { state, dispatch } = useApp();

  const [tab, setTab] = useState(0);
  const [verify, setVerify] = useState(0);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [quotaOrg, setQuotaOrg] = useState<OrgRow | null>(null);
  const [quotaDraft, setQuotaDraft] = useState('');
  const [statusOrg, setStatusOrg] = useState<OrgRow | null>(null);

  const rows = useMemo<OrgRow[]>(() => {
    return state.organizations
      .filter((o) => o.id !== VENDOR_ORG_ID)
      .map((org) => {
        const pools: PoolRow[] = state.seatPools
          .filter((p) => p.orgId === org.id)
          .map((pool) => {
            const mod = moduleOf(state, pool.moduleId);
            const restDays = daysBetween(state.now, pool.expireDate);
            const expired = isExpired(state, pool);
            return {
              pool,
              moduleName: mod?.name ?? pool.moduleId,
              edition: mod?.edition ?? '—',
              allocated: allocatedSeats(state, pool.id),
              spare: spareSeats(state, pool),
              restDays,
              expired,
              expiring: isPoolExpiring(state, pool),
            };
          })
          .sort((a, b) => a.pool.expireDate.localeCompare(b.pool.expireDate));

        const totalSeats = pools.reduce((s, r) => s + r.pool.total, 0);
        const allocated = pools.reduce((s, r) => s + r.allocated, 0);

        return {
          org,
          memberCount: membersOfOrg(state, org.id).length,
          pools,
          totalSeats,
          allocated,
          usage: totalSeats ? Math.round((allocated / totalSeats) * 100) : 0,
          grantedUsed: pools
            .filter((r) => r.pool.source === '厂商赠予')
            .reduce((s, r) => s + r.allocated, 0),
          revenue: state.orders
            .filter((o) => o.orgId === org.id && o.status === '已完成')
            .reduce((s, o) => s + o.amount, 0),
          expiringCount: pools.filter((r) => r.expiring).length,
        };
      });
  }, [state]);

  const metrics = useMemo(() => {
    return {
      customers: rows.length,
      verified: rows.filter((r) => r.org.verified).length,
      soldSeats: state.seatPools
        .filter((p) => p.source === '采购')
        .reduce((s, p) => s + p.total, 0),
      gmv: state.orders
        .filter((o) => o.status === '已完成')
        .reduce((s, o) => s + o.amount, 0),
    };
  }, [rows, state.seatPools, state.orders]);

  const unverified = rows.filter((r) => !r.org.verified);

  const list = rows.filter((r) => {
    const s = statusTabs[tab];
    if (s !== '全部' && r.org.status !== s) return false;
    if (verify === 1 && !r.org.verified) return false;
    if (verify === 2 && r.org.verified) return false;
    if (search) {
      const hit = [r.org.name, r.org.shortName, r.org.code, r.org.contactName].some((v) =>
        v.includes(search),
      );
      if (!hit) return false;
    }
    return true;
  });

  const openQuota = (row: OrgRow) => {
    setQuotaDraft(String(row.org.freeSeatQuota));
    setQuotaOrg(row);
  };

  // A quota below the seats already granted would strand live licences.
  const quotaValue = Number(quotaDraft);
  const quotaValid =
    quotaDraft.trim() !== '' && Number.isInteger(quotaValue) && quotaValue >= 0;
  const quotaTooLow = quotaValid && quotaOrg ? quotaValue < quotaOrg.grantedUsed : false;
  const quotaUnchanged = quotaValid && quotaOrg ? quotaValue === quotaOrg.org.freeSeatQuota : false;
  const quotaSubmittable = quotaValid && !quotaTooLow && !quotaUnchanged;

  const submitQuota = () => {
    if (!quotaOrg || !quotaSubmittable) return;
    dispatch({ type: 'SET_FREE_QUOTA', orgId: quotaOrg.org.id, quota: quotaValue });
    setQuotaOrg(null);
  };

  const submitStatus = () => {
    if (!statusOrg) return;
    dispatch({
      type: 'SET_ORG_STATUS',
      orgId: statusOrg.org.id,
      status: statusOrg.org.status === '正常' ? '已停用' : '正常',
    });
    setStatusOrg(null);
  };

  const cards: Metric[] = [
    { icon: Building2, value: metrics.customers, label: '客户企业总数', hint: `${unverified.length} 家待认证`, tone: 'accent' },
    { icon: BadgeCheck, value: metrics.verified, label: '已认证企业', hint: '可正常下单与扩容', tone: 'positive' },
    { icon: Ticket, value: metrics.soldSeats, label: '全平台已售席位', hint: '含采购与免费额度', tone: 'neutral' },
    { icon: Coins, value: money(metrics.gmv), label: '累计成交额', hint: '已完成订单合计', tone: 'attention' },
  ];

  return (
    <div>
      <Header
        title="企业账号"
        subtitle="管理客户企业的认证、免费额度与账号状态"
        actions={
          <span className="text-[13px] text-text-muted">
            共 {metrics.customers} 家客户企业 · {unverified.length} 家待认证
          </span>
        }
      />

      <div className="px-7 pb-7 flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-5 stagger">
          {cards.map((c) => (
            <MetricCard key={c.label} metric={c} />
          ))}
        </div>

        {unverified.length > 0 && (
          <div className="bg-warning-bg border border-warning/30 rounded-md px-4 py-3 flex items-start gap-3">
            <ShieldAlert size={16} className="text-warning shrink-0 mt-[2px]" />
            <p className="text-[14px] text-warning leading-[22px]">
              {unverified.map((r) => r.org.shortName).join('、')} 尚未完成营业执照认证。
              <span className="text-text-secondary">
                未认证企业只能领用厂商赠予的免费额度，不能采购商业版模块，请先完成资质审核再开放采购。
              </span>
            </p>
          </div>
        )}

        <div className="panel px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TabFilter tabs={statusTabs.map((s) => ({ label: s }))} activeIndex={tab} onChange={setTab} />
            <select
              aria-label="认证状态"
              value={verify}
              onChange={(e) => setVerify(Number(e.target.value))}
              className={selectCls}
            >
              {verifyOptions.map((o, i) => (
                <option key={o} value={i}>{o}</option>
              ))}
            </select>
          </div>
          <div className="w-[240px]">
            <SearchBar placeholder="搜索企业名称、编号或联系人..." value={search} onChange={setSearch} />
          </div>
        </div>

        <div className="panel overflow-hidden">
          <table className="data-table w-full">
            <thead>
              <tr className="border-b border-hairline">
                <th className="w-[36px] px-2 py-3" />
                {columns.map((h) => (
                  <th key={h} className="text-left text-[13px] font-normal text-text-muted px-4 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => {
                const open = expanded === r.org.id;
                const disabled = r.org.status === '已停用';
                return [
                  <tr
                    key={r.org.id}
                    className="hover:bg-surface-secondary transition-colors"
                    style={{ borderTop: i ? '1px solid var(--color-divider)' : 'none' }}
                  >
                    <td className="px-2 py-[14px] align-top">
                      <button
                        onClick={() => setExpanded(open ? null : r.org.id)}
                        aria-label={open ? '收起席位明细' : '展开席位明细'}
                        aria-expanded={open}
                        className="w-7 h-7 flex items-center justify-center rounded-sm cursor-pointer hover:bg-surface-hover transition-colors"
                      >
                        <ChevronDown
                          size={14}
                          className={`text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </td>

                    <td className="px-4 py-[14px] align-top">
                      <div className="flex items-center gap-[6px]">
                        <p className={`text-[14px] font-medium ${disabled ? 'text-text-muted' : 'text-text'}`}>
                          {r.org.shortName}
                        </p>
                        {r.org.verified ? (
                          <BadgeCheck size={14} className="text-success shrink-0" aria-label="已认证" />
                        ) : (
                          <StatusBadge status="未认证" />
                        )}
                      </div>
                      <p className="text-[13px] text-text-muted mt-[3px]">
                        {r.org.code} · {r.org.industry} · {r.org.scale}
                      </p>
                    </td>

                    <td className="px-4 py-[14px] align-top text-[14px] text-text-secondary whitespace-nowrap">
                      <span className="inline-flex items-center gap-[4px]">
                        <Users size={13} className="text-text-muted" />
                        {r.memberCount}
                      </span>
                    </td>

                    <td className="px-4 py-[14px] align-top whitespace-nowrap">
                      <p className="text-[14px] text-text">
                        {r.allocated} / {r.totalSeats}
                        <span className="text-[13px] text-text-muted ml-[6px]">{r.usage}%</span>
                      </p>
                      <div className="mt-[6px]"><UsageBar percent={r.usage} /></div>
                      {r.expiringCount > 0 && (
                        <p className="text-[12px] text-warning mt-[5px] inline-flex items-center gap-[3px]">
                          <CalendarClock size={11} /> {r.expiringCount} 个池 {POOL_EXPIRING_DAYS} 天内到期
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-[14px] align-top whitespace-nowrap">
                      <p className="text-[14px] text-text">{r.org.freeSeatQuota}</p>
                      <p className="text-[12px] text-text-muted mt-[3px]">已用 {r.grantedUsed}</p>
                    </td>

                    <td className="px-4 py-[14px] align-top text-[14px] text-text whitespace-nowrap">
                      {r.revenue > 0 ? money(r.revenue) : <span className="text-text-muted">—</span>}
                    </td>

                    <td className="px-4 py-[14px] align-top"><StatusBadge status={r.org.status} /></td>

                    <td className="px-4 py-[14px] align-top text-[13px] text-text-muted whitespace-nowrap">
                      {r.org.createdAt}
                    </td>

                    <td className="px-4 py-[14px] align-top whitespace-nowrap">
                      <p className="text-[14px] text-text-secondary">{r.org.contactName}</p>
                      <p className="text-[13px] text-text-muted mt-[3px]">{r.org.contactPhone}</p>
                    </td>

                    <td className="px-4 py-[14px] align-top">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openQuota(r)}
                          className="h-[32px] px-3 rounded-full text-[13px] font-semibold text-primary bg-primary-bg hover:brightness-95 transition-all cursor-pointer inline-flex items-center gap-[4px] whitespace-nowrap"
                        >
                          <SlidersHorizontal size={14} /> 调整额度
                        </button>
                        <button
                          onClick={() => setStatusOrg(r)}
                          className={`h-[32px] px-3 rounded-full text-[13px] font-semibold transition-all cursor-pointer inline-flex items-center gap-[4px] whitespace-nowrap ${
                            disabled
                              ? 'text-success bg-success-bg hover:brightness-95'
                              : 'text-danger bg-danger-bg hover:brightness-95'
                          }`}
                        >
                          {disabled ? <><Power size={14} /> 启用</> : <><Ban size={14} /> 停用</>}
                        </button>
                      </div>
                    </td>
                  </tr>,

                  open && (
                    <tr key={`${r.org.id}-detail`} className="bg-surface-secondary">
                      <td colSpan={columns.length + 1} className="px-4 py-4">
                        <p className="text-[13px] text-text-muted mb-2 px-2">
                          {r.org.name} · 席位池明细（{r.pools.length}）
                        </p>
                        {r.pools.length === 0 ? (
                          <p className="text-[14px] text-text-muted px-2 py-3">该企业暂未持有任何席位池</p>
                        ) : (
                          <div className="panel overflow-hidden">
                            <table className="data-table w-full">
                              <thead>
                                <tr className="border-b border-hairline">
                                  {['模块', '版本', '总席位', '已分配', '空闲', '来源', '到期日'].map((h) => (
                                    <th key={h} className="text-left text-[12px] font-normal text-text-muted px-4 py-[9px] whitespace-nowrap">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {r.pools.map((p, j) => (
                                  <tr key={p.pool.id} style={{ borderTop: j ? '1px solid var(--color-divider)' : 'none' }}>
                                    <td className="px-4 py-[10px] text-[14px] text-text whitespace-nowrap">{p.moduleName}</td>
                                    <td className="px-4 py-[10px] text-[13px] text-text-secondary whitespace-nowrap">{p.edition}</td>
                                    <td className="px-4 py-[10px] text-[14px] text-text">{p.pool.total}</td>
                                    <td className="px-4 py-[10px] text-[14px] text-text">{p.allocated}</td>
                                    <td className={`px-4 py-[10px] text-[14px] ${p.spare === 0 ? 'text-warning' : 'text-text'}`}>
                                      {p.spare}
                                    </td>
                                    <td className="px-4 py-[10px] text-[13px] text-text-secondary whitespace-nowrap">
                                      {p.pool.source}
                                    </td>
                                    <td className="px-4 py-[10px] whitespace-nowrap">
                                      {p.expired ? (
                                        <span className="text-[14px] text-text-muted">{p.pool.expireDate}（已过期）</span>
                                      ) : p.expiring ? (
                                        <span className="text-[14px] text-warning inline-flex items-center gap-[4px]">
                                          <TriangleAlert size={12} />
                                          {p.pool.expireDate}（{daysLeftLabel(p.restDays)}）
                                        </span>
                                      ) : (
                                        <span className="text-[14px] text-text-secondary">{p.pool.expireDate}</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </td>
                    </tr>
                  ),
                ];
              })}
            </tbody>
          </table>

          {list.length === 0 && (
            <div className="py-16 text-center">
              <span className="w-[44px] h-[44px] rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-4">
                <Building2 size={20} className="text-text-muted" />
              </span>
              <p className="text-[13px] text-text-muted">没有符合条件的企业</p>
            </div>
          )}
        </div>
      </div>

      <Modal open={!!quotaOrg} onClose={() => setQuotaOrg(null)} title="调整免费额度" width={480}>
        {quotaOrg && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[15px] font-medium text-text">{quotaOrg.org.name}</p>
              <p className="text-[13px] text-text-muted mt-[3px]">{quotaOrg.org.code}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-secondary rounded-md px-4 py-3">
                <p className="text-[13px] text-text-muted">当前额度</p>
                <p className="text-[20px] text-text mt-1">{quotaOrg.org.freeSeatQuota}</p>
              </div>
              <div className="bg-surface-secondary rounded-md px-4 py-3">
                <p className="text-[13px] text-text-muted">已用免费席位</p>
                <p className="text-[20px] text-text mt-1">{quotaOrg.grantedUsed}</p>
              </div>
            </div>

            <div>
              <label htmlFor="quota-input" className="block text-[13px] font-medium text-text-secondary mb-[6px]">
                新的免费席位额度
              </label>
              <input
                id="quota-input"
                type="number"
                min={0}
                value={quotaDraft}
                onChange={(e) => setQuotaDraft(e.target.value)}
                className={numberInputCls}
              />
              {!quotaValid && quotaDraft.trim() !== '' && (
                <p className="text-[13px] text-danger mt-[6px]">请输入 0 或以上的整数</p>
              )}
              {quotaTooLow && (
                <p className="text-[13px] text-danger mt-[6px] inline-flex items-center gap-[4px]">
                  <TriangleAlert size={12} />
                  新额度不能低于该企业已用的 {quotaOrg.grantedUsed} 个免费席位，请先回收席位再下调
                </p>
              )}
              {quotaUnchanged && (
                <p className="text-[13px] text-text-muted mt-[6px]">额度未发生变化</p>
              )}
              {quotaSubmittable && (
                <p className="text-[13px] text-text-secondary mt-[6px]">
                  调整后该企业还可申领 {Math.max(0, quotaValue - quotaOrg.grantedUsed)} 个免费席位
                </p>
              )}
            </div>

            <p className="text-[13px] text-text-muted leading-[20px]">
              免费额度只影响后续的额度扩容审批，不会改动企业已持有的席位。
            </p>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={() => setQuotaOrg(null)}
                className="btn-soft h-[38px] px-5 text-[13.5px] font-semibold cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={submitQuota}
                disabled={!quotaSubmittable}
                className="btn-primary h-[38px] px-5 text-[13.5px] font-semibold cursor-pointer disabled:cursor-not-allowed"
              >
                确认调整
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!statusOrg}
        onClose={() => setStatusOrg(null)}
        title={statusOrg?.org.status === '正常' ? '停用企业账号' : '启用企业账号'}
        width={480}
      >
        {statusOrg && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[15px] font-medium text-text">{statusOrg.org.name}</p>
              <p className="text-[13px] text-text-muted mt-[3px]">
                {statusOrg.org.code} · {statusOrg.memberCount} 名成员 · 持有 {statusOrg.totalSeats} 个席位
              </p>
            </div>

            {statusOrg.org.status === '正常' ? (
              <div className="bg-danger-bg rounded-md px-4 py-3 flex items-start gap-3">
                <TriangleAlert size={16} className="text-danger shrink-0 mt-[2px]" />
                <div className="text-[14px] leading-[22px]">
                  <p className="text-danger">停用后该企业全部席位将暂停，成员无法启动模块。</p>
                  <p className="text-text-secondary mt-1">
                    当前会影响 {statusOrg.allocated} 个已分配席位；席位与订单记录会保留，重新启用后即刻恢复。
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-success-bg rounded-md px-4 py-3 flex items-start gap-3">
                <CircleCheck size={16} className="text-success shrink-0 mt-[2px]" />
                <p className="text-[14px] text-text-secondary leading-[22px]">
                  启用后该企业 {statusOrg.totalSeats} 个席位恢复可用，成员可继续启动已分配的模块。
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={() => setStatusOrg(null)}
                className="btn-soft h-[38px] px-5 text-[13.5px] font-semibold cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={submitStatus}
                className={`h-[38px] px-5 rounded-full text-[13.5px] font-semibold text-white transition-all hover:brightness-110 cursor-pointer ${
                  statusOrg.org.status === '正常' ? 'bg-danger' : 'bg-success'
                }`}
              >
                {statusOrg.org.status === '正常' ? '确认停用' : '确认启用'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
