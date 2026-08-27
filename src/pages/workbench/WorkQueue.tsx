import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Inbox } from 'lucide-react';
import TabFilter from '../../components/common/TabFilter';
import {
  allocatedSeats, deptOf, kindLabels, memberOf, moduleOf, pendingStep, isStandIn, useApp,
} from '../../store';
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

  return (
    <div className="flex flex-col gap-7 px-6 py-6">
      {/* ---- Queue ---- */}
      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[17px] font-extrabold text-text tracking-[-0.02em]">
            {ownView ? '我的申请' : '待我处理'}
          </h2>
          <button
            onClick={() => navigate(target)}
            className="text-[12px] font-semibold text-text-placeholder hover:text-text transition-colors cursor-pointer shrink-0"
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

            return (
              <button
                key={app.id}
                onClick={() => navigate(target)}
                className="w-full text-left flex gap-3 rounded-md px-3 py-3 transition-colors hover:bg-surface-secondary cursor-pointer"
              >
                {/* Filled tick for closed items, hollow ring for open ones —
                    the checklist read the reference uses. */}
                <span
                  className={`mt-[2px] w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center ${
                    done ? 'bg-primary text-white' : 'border-[1.5px] border-text-muted'
                  }`}
                >
                  {done && <Check size={11} strokeWidth={3} />}
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[13.5px] font-semibold leading-[19px] ${
                      done ? 'text-text-muted' : 'text-text'
                    }`}
                  >
                    {mod?.name}
                    {mod?.edition === '商业版' && (
                      <span className="font-normal text-text-muted">（商业版）</span>
                    )}
                  </p>
                  <p className="text-[11.5px] text-text-secondary mt-[3px] truncate">
                    {kindLabels[app.kind]} · {app.seats} 席位 ·{' '}
                    {ownView ? app.createdAt : `${applicant?.name} · ${dept?.name}`}
                  </p>

                  {(standIn || !done) && (
                    <span
                      className={`inline-block mt-2 text-[11px] font-bold rounded-full px-2.5 py-[3px] ${
                        standIn ? 'bg-warning-bg text-warning' : 'chip-signal'
                      }`}
                    >
                      {standIn ? '代部门审批' : app.status}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {list.length === 0 && (
            <div className="py-10 text-center">
              <span className="w-[46px] h-[46px] rounded-full bg-surface-secondary flex items-center justify-center mx-auto mb-3">
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
          <h2 className="text-[17px] font-extrabold text-text tracking-[-0.02em]">席位目标</h2>
          <p className="text-[12px] text-text-muted mt-1.5 leading-relaxed">
            席位利用率越高，续费时的单位成本越低
          </p>

          <div className="mt-4 flex flex-col gap-4">
            {pools.slice(0, 5).map((pool) => {
              const mod = moduleOf(state, pool.moduleId);
              const used = allocatedSeats(state, pool.id);
              const pct = pool.total ? Math.round((used / pool.total) * 100) : 0;
              return (
                <button
                  key={pool.id}
                  onClick={() => navigate('/seats')}
                  className="w-full text-left cursor-pointer group"
                >
                  <p className="text-[13px] font-semibold text-text truncate group-hover:text-primary transition-colors">
                    {mod?.name}
                  </p>
                  <div className="flex items-center gap-2.5 mt-2">
                    <div className="meter flex-1">
                      <span
                        style={{
                          width: `${pct}%`,
                          background:
                            pct >= 100 ? 'var(--color-warning-light)' : 'var(--color-signal)',
                        }}
                      />
                    </div>
                    <span className="num text-[12px] font-bold text-text-muted shrink-0 w-[34px] text-right">
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
