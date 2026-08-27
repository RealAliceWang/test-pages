import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import TabFilter from '../../components/common/TabFilter';
import StatusBadge from '../../components/common/StatusBadge';
import { moduleIconMap } from '../../assets/moduleIcons';
import {
  allocatedSeats, deptOf, kindLabels, memberOf, moduleOf, pendingStep, isStandIn, useApp,
} from '../../store';
import { moduleLabel } from '../../domain/format';
import { METER_FILL, poolHealth } from '../../domain/poolHealth';
import type { Application, SeatPool } from '../../domain/types';

interface WorkQueueProps {
  /** Items awaiting this identity, or this member's own submissions. */
  items: Application[];
  pools: SeatPool[];
  /** Members act on an inbox of their own applications, not approvals. */
  ownView: boolean;
}

const filters = ['全部', '待处理', '已完成'];

/**
 * The shell's right-hand rail: what needs doing, then how full the pools are.
 *
 * Both blocks answer "what should I look at next", which is why they sit
 * outside the scrolling dashboard — they stay put while the page moves.
 */
export default function WorkQueue({ items, pools, ownView }: WorkQueueProps) {
  const navigate = useNavigate();
  const { state, me } = useApp();
  const [tab, setTab] = useState(0);

  const settled = (a: Application) => ['已完成', '已驳回', '已撤销'].includes(a.status);
  const list =
    tab === 1 ? items.filter((a) => !settled(a)) : tab === 2 ? items.filter(settled) : items;

  const target = ownView ? '/applications' : '/approvals';

  // Counted across every pool, not just the five rendered below, so the
  // headline stays accurate even when a longer list is truncated.
  const fullPoolCount = pools.filter(
    (p) => p.total > 0 && allocatedSeats(state, p.id) >= p.total,
  ).length;
  const spareModuleCount = pools.length - fullPoolCount;

  return (
    <div className="flex flex-col gap-7 px-6 py-6">
      {/* ---- Queue ---- */}
      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[16px] font-extrabold text-text tracking-[-0.02em]">
            {ownView ? '我的申请' : '待我处理'}
          </h2>
          <button
            onClick={() => navigate(target)}
            className="text-[12px] font-semibold text-text-muted hover:text-text transition-colors cursor-pointer shrink-0 px-2 py-2 -mx-2 -my-2 rounded-full"
          >
            查看全部
          </button>
        </div>

        <div className="mt-3.5">
          <TabFilter tabs={filters.map((f) => ({ label: f }))} activeIndex={tab} onChange={setTab} />
        </div>

        <div className="mt-4 flex flex-col gap-1">
          {list.slice(0, 6).map((app) => {
            const mod = moduleOf(state, app.moduleId);
            const applicant = memberOf(state, app.applicantId);
            const dept = deptOf(state, app.deptId);
            const step = pendingStep(app);
            const standIn = step ? isStandIn(me, step) : false;
            const done = settled(app);

            // Own submissions still land on the generic list — /applications
            // has no focus/highlight support — but approvals to act on carry
            // the application's id so the approver lands right on that row
            // instead of having to re-find it in a longer list.
            const dest = ownView ? target : `/approvals?focus=${encodeURIComponent(app.id)}`;

            return (
              <button
                key={app.id}
                onClick={() => navigate(dest)}
                className="w-full text-left flex gap-3 rounded-md px-3 py-3 transition-colors hover:bg-surface-secondary cursor-pointer"
              >
                {/* The module this request is about. A checkbox would promise
                    a selection this row does not offer — it only navigates. */}
                <img
                  src={moduleIconMap[mod?.icon ?? 'building'] || moduleIconMap.building}
                  alt=""
                  className={`mt-[1px] w-[30px] h-[30px] object-contain shrink-0 ${
                    done ? 'opacity-45' : ''
                  }`}
                />

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[13.5px] font-semibold leading-[19px] ${
                      done ? 'text-text-muted' : 'text-text'
                    }`}
                  >
                    {mod ? moduleLabel(mod) : app.moduleId}
                  </p>
                  <p className="text-[12px] text-text-secondary mt-[3px] truncate">
                    {kindLabels[app.kind]} · {app.seats} 席位 ·{' '}
                    {ownView ? app.createdAt : `${applicant?.name} · ${dept?.name}`}
                  </p>

                  {/* Settled rows keep a status chip too: with the tick gone,
                      this is the only thing marking them as closed. */}
                  <div className="mt-2">
                    {standIn ? (
                      <span className="text-[12px] font-medium text-warning bg-warning-bg rounded-full px-2 py-0.5">
                        代部门审批
                      </span>
                    ) : (
                      <StatusBadge status={app.status} />
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {list.length === 0 && (
            <div className="py-10 text-center">
              <span className="w-[44px] h-[44px] rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-3">
                <Inbox size={20} className="text-text-placeholder" />
              </span>
              <p className="text-[13px] text-text-muted">
                {tab === 2 ? '暂无已完成的记录' : '当前没有待处理的事项'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ---- Pool goals ---- */}
      {pools.length > 0 && (
        <section>
          <h2 className="text-[16px] font-extrabold text-text tracking-[-0.02em]">席位目标</h2>
          <p className="text-[12px] text-text-muted mt-1.5 leading-relaxed">
            席位利用率越高，续费时的单位成本越低
          </p>

          {/* Answers "can I assign a seat right now" without a trip to /seats:
              a headline count of which modules are maxed out versus which
              still have room. */}
          <p
            className={`text-[12px] font-semibold mt-2 leading-relaxed ${
              fullPoolCount > 0 ? 'text-warning' : 'text-text-muted'
            }`}
          >
            {fullPoolCount > 0
              ? `${fullPoolCount} 个模块已满${spareModuleCount > 0 ? `，${spareModuleCount} 个模块有空位` : ''}`
              : `${pools.length} 个模块均有空位`}
          </p>

          <div className="mt-4 flex flex-col gap-4">
            {pools.slice(0, 5).map((pool) => {
              const mod = moduleOf(state, pool.moduleId);
              const used = allocatedSeats(state, pool.id);
              const pct = pool.total ? Math.round((used / pool.total) * 100) : 0;
              const health = poolHealth(pct);
              const full = health === 'full';
              return (
                <button
                  key={pool.id}
                  onClick={() => navigate('/seats')}
                  className="w-full text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-text truncate group-hover:text-primary transition-colors">
                      {mod ? moduleLabel(mod) : pool.moduleId}
                    </p>
                    {full && (
                      <span className="shrink-0">
                        <StatusBadge status="席位已满" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 mt-2">
                    <div className="meter flex-1">
                      <span
                        style={{
                          width: `${pct}%`,
                          background: METER_FILL[health],
                        }}
                      />
                    </div>
                    <span
                      className={`num text-[12px] font-bold shrink-0 w-[34px] text-right ${
                        full ? 'text-warning' : 'text-text-muted'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
