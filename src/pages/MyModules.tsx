import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Box, ChevronRight, Clock, RefreshCw, UserCheck } from 'lucide-react';
import Header from '../components/layout/Header';
import MetricCard, { type Metric } from '../components/common/MetricCard';
import RingProgress from '../components/common/RingProgress';
import StatusBadge from '../components/common/StatusBadge';
import TabFilter from '../components/common/TabFilter';
import { moduleIconMap } from '../assets/moduleIcons';
import { daysLeftLabel, moduleLabel } from '../domain/format';
import {
  assignmentsOfMember,
  daysBetween,
  memberOf,
  moduleOf,
  poolOf,
  seatStatusOf,
  useApp,
  type SeatStatus,
} from '../store';
import type { Assignment, CatalogModule, Order, SeatPool } from '../domain/types';
import type { AppState } from '../store';

interface SeatRow {
  assignment: Assignment;
  module: CatalogModule;
  pool: SeatPool;
  status: SeatStatus;
  /** Whole licence term of the pool the seat comes from. */
  totalDays: number;
  remainDays: number;
  /** Share of the licence term already consumed. */
  pct: number;
  /** How this seat came to be assigned, phrased for the member reading it. */
  provenance: string;
}

/**
 * A vendor-ops confirmation is what technically creates the assignment when a
 * purchase order lands, but the person who actually drove the seat into
 * existence is whoever ordered it — so trace the order behind the assignment
 * instead of naming the vendor rep who happened to click "confirm".
 */
function orderBehindAssignment(state: AppState, assignment: Assignment): Order | undefined {
  return state.orders.find((o) => {
    if (o.status !== '已完成' || o.orgId !== assignment.orgId || o.moduleId !== assignment.moduleId) return false;
    if (!o.confirmedAt || o.confirmedAt.slice(0, 10) !== assignment.assignedAt) return false;
    if (!o.applicationId) return false;
    const app = state.applications.find((a) => a.id === o.applicationId);
    return app?.applicantId === assignment.memberId;
  });
}

/** Colour of the remaining-days figure per seat status. */
const valueTone: Record<SeatStatus, string> = {
  生效中: 'text-primary',
  即将到期: 'text-warning',
  已过期: 'text-text-muted',
  已暂停: 'text-danger',
};

const filters: ('全部' | SeatStatus)[] = ['全部', '生效中', '即将到期', '已过期'];

export default function MyModules() {
  const navigate = useNavigate();
  const { state, me } = useApp();
  const [tab, setTab] = useState(0);

  const rows = useMemo<SeatRow[]>(
    () =>
      assignmentsOfMember(state, me.id).flatMap((assignment) => {
        const module = moduleOf(state, assignment.moduleId);
        const pool = poolOf(state, assignment.orgId, assignment.moduleId);
        if (!module || !pool) return [];

        const totalDays = Math.max(1, daysBetween(pool.startDate, pool.expireDate));
        const remain = daysBetween(state.now, pool.expireDate);
        const status = seatStatusOf(state, assignment);
        const expired = status === '已过期';

        const elapsed = expired ? totalDays : totalDays - Math.max(0, remain);
        const assignedBy = memberOf(state, assignment.assignedById);
        const order = assignedBy?.role === 'VENDOR_OPS' ? orderBehindAssignment(state, assignment) : undefined;
        const provenance = order
          ? `席位随订单 ${order.orderNo} 于 ${assignment.assignedAt} 到账自动分配`
          : assignedBy?.role === 'VENDOR_OPS'
            ? `席位于 ${assignment.assignedAt} 经厂商审批后自动分配`
            : `席位由 ${assignedBy?.name ?? '企业管理员'} 于 ${assignment.assignedAt} 分配`;
        return [
          {
            assignment,
            module,
            pool,
            status,
            totalDays,
            remainDays: Math.max(0, remain),
            pct: Math.min(100, Math.max(0, Math.round((elapsed / totalDays) * 100))),
            provenance,
          },
        ];
      }),
    [state, me.id],
  );

  const countOf = (s: SeatStatus) => rows.filter((r) => r.status === s).length;
  const sel = filters[tab];
  const list = sel === '全部' ? rows : rows.filter((r) => r.status === sel);

  const stats: Metric[] = [
    { icon: Box, label: '生效中', value: countOf('生效中'), hint: '可直接在客户端登录使用', tone: 'accent' },
    { icon: AlertTriangle, label: '即将到期', value: countOf('即将到期'), hint: '到期前需申请续期', tone: 'attention' },
    { icon: Clock, label: '已过期', value: countOf('已过期'), hint: '席位已回池，可重新申请', tone: 'neutral' },
  ];

  return (
    <div>
      <Header title="我的授权" subtitle="企业分配给我的模块席位，查看有效期与使用情况" />

      <div className="px-7 pb-7 flex flex-col gap-4">
        {/* Seat status overview */}
        <div className="grid grid-cols-3 gap-5 stagger">
          {stats.map((s) => (
            <MetricCard key={s.label} metric={s} />
          ))}
        </div>

        {countOf('已暂停') > 0 && (
          <div className="rounded-md bg-danger-bg px-5 py-3.5 text-[14px] text-danger">
            企业账号已停用，{countOf('已暂停')} 个席位已暂停。记录保留，企业重新启用后即可继续使用。
          </div>
        )}

        {/* Filters */}
        <div className="panel px-5 py-3.5 flex items-center justify-between">
          <TabFilter
            tabs={filters.map((f) => ({
              label: f === '全部' ? `全部席位（${rows.length}）` : `${f}（${countOf(f)}）`,
            }))}
            activeIndex={tab}
            onChange={setTab}
          />
          <button
            onClick={() => navigate('/modules')}
            className="h-[32px] px-4 text-[13px] font-semibold text-primary bg-primary-bg rounded-full inline-flex items-center gap-[6px] hover:brightness-95 transition-all cursor-pointer"
          >
            浏览模块中心 <ChevronRight size={14} />
          </button>
        </div>

        {/* Seat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((r) => {
            return (
              <div
                key={r.assignment.id}
                onClick={() => navigate(`/module/${r.module.id}`)}
                className="panel px-5 py-5 flex flex-col gap-3 cursor-pointer panel-hover"
              >
                <div className="flex items-center gap-4">
                  {/* Licence term progress — the shared ring, signal fill on a divider track */}
                  <RingProgress
                    value={r.pct}
                    size={96}
                    thickness={8}
                    track="var(--color-divider)"
                    caption="期限进度"
                    label={
                      <span className="flex flex-col items-center">
                        <span className="text-[16px] font-bold text-text leading-none">{r.pct}%</span>
                        <span className="text-[12px] text-text-muted mt-1">期限进度</span>
                      </span>
                    }
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-[48px] h-[48px] rounded-md flex items-center justify-center shrink-0">
                        <img
                          src={moduleIconMap[r.module.icon] || moduleIconMap.building}
                          alt=""
                          className="w-[48px] h-[48px] object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-text truncate">{moduleLabel(r.module)}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[13px] text-text-muted">{r.module.code}</span>
                          <StatusBadge status={r.module.edition} />
                        </div>
                      </div>
                      <span className="ml-auto shrink-0">
                        <StatusBadge status={r.status} />
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-1 text-[13px]">
                      <span className="text-text-muted">已用/总天数</span>
                      <span className="text-text font-medium text-right">
                        {r.assignment.usedDays} / {r.totalDays} 天
                      </span>
                      <span className="text-text-muted">{r.status === '已过期' ? '状态' : '距到期'}</span>
                      <span className={`font-medium text-right ${valueTone[r.status]}`}>
                        {r.status === '已过期' ? '已过期' : daysLeftLabel(r.remainDays)}
                      </span>
                      <span className="text-text-muted">到期日期</span>
                      <span className="text-text font-medium text-right">{r.pool.expireDate}</span>
                      <span className="text-text-muted">席位来源</span>
                      <span className="text-text font-medium text-right">
                        {r.pool.source} · 共 {r.pool.total} 席
                      </span>
                      <span className="text-text-muted">最后使用</span>
                      <span className="text-text font-medium text-right">{r.assignment.lastUsed}</span>
                    </div>
                  </div>
                </div>

                {/* Seats belong to the company, so provenance matters more than a receipt */}
                <div className="pt-3 border-t border-divider flex items-center gap-2 text-[12px] text-text-muted">
                  <UserCheck size={13} className="shrink-0" />
                  <span className="truncate">{r.provenance}</span>
                </div>

                {r.status !== '生效中' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/apply/${r.module.id}`);
                    }}
                    className="w-full h-[32px] rounded-full text-[13px] font-semibold text-primary bg-primary-bg inline-flex items-center justify-center gap-1.5 hover:brightness-95 transition-all cursor-pointer"
                  >
                    <RefreshCw size={14} /> 申请续期
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {list.length === 0 && (
          <div className="panel py-16 flex flex-col items-center">
            <div className="w-[44px] h-[44px] rounded-full bg-surface-hover flex items-center justify-center mb-3">
              <Box size={20} className="text-text-placeholder" />
            </div>
            <p className="text-[13px] text-text-muted">
              {rows.length === 0 ? '当前还没有分配给你的席位' : `暂无${sel}的席位`}
            </p>
            <p className="text-[13px] text-text-muted mt-1 mb-5">
              席位由企业统一采购与分配，可在模块中心选择需要的模块后提交申请
            </p>
            <button
              onClick={() => navigate('/modules')}
              className="h-[38px] px-5 rounded-full text-[13.5px] font-semibold text-primary bg-primary-bg hover:brightness-95 transition-all inline-flex items-center gap-1 cursor-pointer"
            >
              去模块中心看看 <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
