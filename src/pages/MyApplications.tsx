import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown, ClipboardList, Clock, X } from 'lucide-react';
import Header from '../components/layout/Header';
import TabFilter from '../components/common/TabFilter';
import StatusBadge from '../components/common/StatusBadge';
import { moduleIconMap } from '../assets/moduleIcons';
import { moduleLabel } from '../domain/format';
import { deptOf, kindLabels, moduleOf, useApp } from '../store';
import type { Application, ApprovalStep } from '../domain/types';

const filters = ['全部', '进行中', '已完成', '已驳回'] as const;

function isLive(a: Application) {
  return !['已完成', '已驳回', '已撤销'].includes(a.status);
}

function StepRow({ step, index, last }: { step: ApprovalStep; index: number; last: boolean }) {
  const done = step.action === '通过';
  const rejected = step.action === '驳回';
  const dot = done ? 'bg-success-light' : rejected ? 'bg-danger-light' : 'bg-surface-hover';

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center shrink-0 text-white ${dot}`}>
          {done ? <Check size={13} strokeWidth={2.6} /> : rejected ? <X size={13} strokeWidth={2.6} /> : <span className="text-[12px] font-semibold text-text-muted">{index + 1}</span>}
        </div>
        {!last && <div className={`w-[2px] flex-1 min-h-[30px] my-1 rounded-full ${done ? 'bg-success-light' : 'bg-border'}`} />}
      </div>
      <div className="pb-4 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[14px] text-text">{step.label}</p>
          <StatusBadge status={step.action === '待审批' ? '待审批' : step.action === '通过' ? '已通过' : '已驳回'} />
        </div>
        <p className="text-[12px] text-text-muted mt-[3px]">
          {step.approverName ? `${step.approverName} · ${step.actedAt}` : '等待处理'}
        </p>
        {step.comment && (
          <p className="text-[13px] text-text-secondary mt-2 px-3 py-2 bg-surface-secondary rounded-sm leading-relaxed">
            {step.comment}
          </p>
        )}
      </div>
    </div>
  );
}

export default function MyApplications() {
  const navigate = useNavigate();
  const { state, me, dispatch } = useApp();

  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState<string | null>(null);

  const mine = state.applications
    .filter((a) => a.applicantId === me.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const sel = filters[tab];
  const list = mine.filter((a) => {
    if (sel === '全部') return true;
    if (sel === '进行中') return isLive(a);
    if (sel === '已完成') return a.status === '已完成';
    return a.status === '已驳回' || a.status === '已撤销';
  });

  const tabs = filters.map((f) => ({
    label: f === '全部' ? `全部（${mine.length}）` : `${f}（${
      f === '进行中' ? mine.filter(isLive).length
        : f === '已完成' ? mine.filter((a) => a.status === '已完成').length
        : mine.filter((a) => a.status === '已驳回' || a.status === '已撤销').length
    }）`,
  }));

  return (
    <div>
      <Header
        title="我的申请"
        subtitle={`共 ${mine.length} 条申请记录 · ${mine.filter(isLive).length} 条正在流转`}
        actions={
          <button onClick={() => navigate('/modules')}
            className="btn-outline h-[38px] px-5 text-[13.5px] font-semibold cursor-pointer">
            新建申请
          </button>
        }
      />

      <div className="px-7 pb-7 flex flex-col gap-4">
        <div className="panel px-5 py-3">
          <TabFilter tabs={tabs} activeIndex={tab} onChange={setTab} />
        </div>

        <div className="flex flex-col gap-3">
          {list.map((app) => {
            const mod = moduleOf(state, app.moduleId);
            const dept = deptOf(state, app.deptId);
            const expanded = open === app.id;
            // Only withdrawable while nobody has acted yet.
            const withdrawable = app.status === '待部门审批';
            const order = app.orderId ? state.orders.find((o) => o.id === app.orderId) : undefined;

            return (
              <div key={app.id} className="panel overflow-hidden">
                <div className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-surface-secondary transition-colors"
                  onClick={() => setOpen(expanded ? null : app.id)}>
                  <img src={moduleIconMap[mod?.icon ?? 'building'] || moduleIconMap.building} alt=""
                    className="w-[40px] h-[40px] object-contain shrink-0" />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-medium text-text truncate">
                        {mod ? moduleLabel(mod) : '未知模块'}
                      </p>
                      <span className="text-[12px] px-[6px] py-[1px] rounded-sm bg-surface-hover text-text-muted shrink-0">
                        {kindLabels[app.kind]}
                      </span>
                    </div>
                    <p className="text-[13px] text-text-muted mt-[4px] truncate">
                      {app.code} · {app.seats} 个席位 · {dept?.name} · {app.projectName} · {app.createdAt}
                    </p>
                  </div>

                  <StatusBadge status={app.status} />
                  <ChevronDown size={15} className={`text-text-muted shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>

                {expanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-divider">
                    <div className="grid grid-cols-3 gap-6 pt-4">
                      <div className="col-span-2">
                        <p className="text-[14px] font-medium text-text mb-2">申请理由</p>
                        <p className="text-[13px] text-text-secondary leading-relaxed px-3 py-[10px] bg-surface-secondary rounded-sm">
                          {app.reason}
                        </p>

                        {app.status === '待采购' && (
                          <div className="mt-4 px-4 py-3 rounded-sm bg-primary-bg">
                            <p className="text-[13px] text-primary leading-relaxed">
                              审批已全部通过，等待企业管理员在「订单与账单」中下单采购。到账后席位将自动分配给你。
                            </p>
                          </div>
                        )}

                        {order && (
                          <div className="mt-4 border border-border rounded-sm px-4 py-3">
                            <p className="text-[13px] text-text-muted">关联订单</p>
                            <p className="text-[14px] text-text mt-1">
                              {order.orderNo} · ¥{order.amount.toLocaleString()} · {order.status}
                            </p>
                          </div>
                        )}

                        {withdrawable && (
                          <button onClick={() => dispatch({ type: 'WITHDRAW_APPLICATION', applicationId: app.id })}
                            className="mt-4 h-[32px] px-4 rounded-full text-[13px] font-semibold text-danger bg-danger-bg hover:brightness-95 transition-all cursor-pointer">
                            撤销申请
                          </button>
                        )}
                      </div>

                      <div>
                        <p className="text-[14px] font-medium text-text mb-3">审批进度</p>
                        {app.steps.map((s, i) => (
                          <StepRow key={i} step={s} index={i} last={i === app.steps.length - 1} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {list.length === 0 && (
          <div className="panel py-16 flex flex-col items-center">
            {sel === '全部' ? (
              <>
                <div className="w-[44px] h-[44px] rounded-full bg-surface-hover flex items-center justify-center mb-3">
                  <ClipboardList size={20} className="text-text-placeholder" />
                </div>
                <p className="text-[13px] text-text-muted mb-5">你还没有提交过授权申请</p>
                <button onClick={() => navigate('/modules')}
                  className="btn-primary h-[38px] px-5 text-[13.5px] font-semibold cursor-pointer">
                  去模块中心申请
                </button>
              </>
            ) : (
              <>
                <div className="w-[44px] h-[44px] rounded-full bg-surface-hover flex items-center justify-center mb-3">
                  <Clock size={20} className="text-text-placeholder" />
                </div>
                <p className="text-[13px] text-text-muted">没有{sel}的申请</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
