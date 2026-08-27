import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Inbox, KeyRound, ShoppingCart, TriangleAlert } from 'lucide-react';
import Header from '../components/layout/Header';
import TabFilter from '../components/common/TabFilter';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { moduleIconMap } from '../assets/moduleIcons';
import {
  allocatedSeats, deptOf, eligibleSigners, inboxOf, isExpired, isStandIn, kindLabels,
  memberOf, moduleOf, orgOf, pendingStep, poolOf, spareSeats, stepAfterApproval, useApp,
  visibleApplications,
} from '../store';
import { roleLabels, type Application } from '../domain/types';

export default function Approvals() {
  const navigate = useNavigate();
  const { state, me, dispatch } = useApp();

  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [acting, setActing] = useState<{ app: Application; approve: boolean } | null>(null);
  const [comment, setComment] = useState('');

  const inbox = inboxOf(state, me);
  const inboxIds = new Set(inbox.map((a) => a.id));
  const all = visibleApplications(state, me);
  const handled = all.filter((a) => !inboxIds.has(a.id));

  const scopeLabel =
    me.role === 'VENDOR_OPS' ? '全平台的免费额度申请'
      : me.role === 'ORG_ADMIN' ? '全企业申请'
      : `${deptOf(state, me.deptId)?.name ?? '本部门'}的申请`;

  const tabs = [
    { label: `待我处理（${inbox.length}）` },
    { label: `已处理（${handled.length}）` },
  ];

  const source = tab === 0 ? inbox : handled;
  const list = source.filter((a) => {
    if (!search) return true;
    const mod = moduleOf(state, a.moduleId);
    const applicant = memberOf(state, a.applicantId);
    return (
      a.code.includes(search) ||
      (mod?.name.includes(search) ?? false) ||
      (applicant?.name.includes(search) ?? false) ||
      a.projectName.includes(search)
    );
  });

  const submit = () => {
    if (!acting) return;
    dispatch({
      type: 'DECIDE_APPLICATION',
      applicationId: acting.app.id,
      approve: acting.approve,
      comment: comment.trim(),
    });
    setActing(null);
    setComment('');
  };

  const pendingPurchase = state.applications.filter(
    (a) => a.orgId === me.orgId && a.status === '待采购',
  );

  const actingStep = acting ? pendingStep(acting.app) : undefined;
  const actingStandIn = Boolean(actingStep && isStandIn(me, actingStep));
  const nextAfter = acting ? stepAfterApproval(state, acting.app, me) : undefined;
  // Whether the department could have handled this itself changes what standing
  // in actually means, so the confirmation must not guess.
  const deptAdminOnDuty =
    acting && actingStep
      ? eligibleSigners(state, acting.app, actingStep).find((m) => m.role === 'DEPT_ADMIN')
      : undefined;

  return (
    <div>
      <Header
        title="审批中心"
        subtitle={`数据范围：${scopeLabel} · ${inbox.length} 条待处理`}
      />

      <div className="px-7 pb-7 flex flex-col gap-4">
        {/* Approved purchases need an order before seats can arrive */}
        {me.role === 'ORG_ADMIN' && pendingPurchase.length > 0 && (
          <div className="panel px-5 py-4 flex items-center gap-3 border-l-[3px] border-l-primary">
            <ShoppingCart size={18} className="text-primary shrink-0" />
            <p className="text-[14px] text-text-secondary flex-1">
              有 <span className="text-text font-medium">{pendingPurchase.length}</span> 条申请已审批通过、等待下单采购，
              席位需在支付到账后才能发放。
            </p>
            <button onClick={() => navigate('/orders')}
              className="h-[32px] px-4  text-[13px] font-medium btn-primary text-white cursor-pointer shrink-0">
              去下单
            </button>
          </div>
        )}

        <div className="panel px-5 py-3 flex items-center justify-between gap-4">
          <TabFilter tabs={tabs} activeIndex={tab} onChange={setTab} />
          <div className="w-[260px]">
            <SearchBar placeholder="搜索单号、模块、申请人或项目..." value={search} onChange={setSearch} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {list.map((app) => {
            const mod = moduleOf(state, app.moduleId);
            const applicant = memberOf(state, app.applicantId);
            const dept = deptOf(state, app.deptId);
            const org = orgOf(state, app.orgId);
            const pool = poolOf(state, app.orgId, app.moduleId);
            const spare = pool && !isExpired(state, pool) ? spareSeats(state, pool) : 0;
            const step = pendingStep(app);
            const isMine = inboxIds.has(app.id);
            const amount = mod && mod.unitPrice > 0 ? mod.unitPrice * app.seats : 0;

            return (
              <div key={app.id} className="panel p-5">
                <div className="flex items-start gap-4">
                  <img src={moduleIconMap[mod?.icon ?? 'building'] || moduleIconMap.building} alt=""
                    className="w-[44px] h-[44px] object-contain shrink-0" />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13.5px] font-bold text-text tracking-[-0.01em]">
                        {mod?.name}
                        {mod?.edition === '商业版' && <span className="text-text-muted font-normal">（商业版）</span>}
                      </p>
                      <span className="text-[12px] px-[6px] py-[1px] rounded-sm bg-surface-hover text-text-muted">
                        {kindLabels[app.kind]}
                      </span>
                      <StatusBadge status={app.status} />
                      {step && isStandIn(me, step) && (
                        <span className="text-[12px] px-[6px] py-[1px] rounded-sm bg-warning-bg text-warning font-medium">
                          代部门审批
                        </span>
                      )}
                      {amount > 0 && (
                        <span className="text-[13px] text-orange">预估 ¥{amount.toLocaleString()}</span>
                      )}
                    </div>

                    <p className="text-[13px] text-text-muted mt-[6px]">
                      {app.code} · 申请 {app.seats} 个席位 · {app.createdAt}
                      {me.role === 'VENDOR_OPS' && org && ` · ${org.shortName}`}
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                      <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-white text-[12px] shrink-0"
                        style={{ background: applicant?.avatarColor ?? '#CBD5E1' }}>
                        {applicant?.name.charAt(0) ?? '—'}
                      </div>
                      <p className="text-[13px] text-text-secondary">
                        {applicant?.name} · {applicant?.title} · {dept?.name}
                        {applicant && ` · ${roleLabels[applicant.role]}`}
                      </p>
                      <span className="text-[13px] text-text-muted">关联项目：{app.projectName}</span>
                    </div>

                    <p className="text-[13px] text-text-secondary mt-3 px-3 py-[10px] bg-surface-secondary rounded-sm leading-relaxed">
                      {app.reason}
                    </p>

                    {/* Context the approver actually needs to decide */}
                    <div className="flex items-center gap-5 mt-3 text-[13px]">
                      <span className="inline-flex items-center gap-[6px] text-text-muted">
                        <KeyRound size={13} />
                        {pool && !isExpired(state, pool)
                          ? `企业席位 ${allocatedSeats(state, pool.id)}/${pool.total}，空闲 ${spare}`
                          : '企业尚未开通该模块'}
                      </span>
                      {app.kind === 'SEAT' && (
                        <span className="text-success">池内有余量，通过后立即分配，不产生费用</span>
                      )}
                      {app.kind === 'PURCHASE' && (
                        <span className="text-orange inline-flex items-center gap-[6px]">
                          <TriangleAlert size={13} /> 通过后需下单付费扩容
                        </span>
                      )}
                      {app.kind === 'QUOTA' && (
                        <span className="text-primary">通过后由厂商核定免费额度</span>
                      )}
                    </div>

                    {/* Already-recorded decisions */}
                    {app.steps.some((s) => s.action !== '待审批') && (
                      <div className="mt-3 flex flex-col gap-1">
                        {app.steps
                          .filter((s) => s.action !== '待审批')
                          .map((s, i) => (
                            <p key={i} className="text-[12px] text-text-muted">
                              {s.label}：{s.action} · {s.approverName} · {s.actedAt}
                              {s.comment && ` · ${s.comment}`}
                            </p>
                          ))}
                      </div>
                    )}
                  </div>

                  {isMine && step && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => { setActing({ app, approve: true }); setComment(''); }}
                        className="h-[34px] px-5  text-[14px] font-medium btn-primary text-white cursor-pointer">
                        通过
                      </button>
                      <button onClick={() => { setActing({ app, approve: false }); setComment(''); }}
                        className="h-[36px] px-5 rounded-full text-[14px] font-semibold text-danger bg-danger-bg hover:brightness-95 transition-all cursor-pointer">
                        驳回
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {list.length === 0 && (
          <div className="panel py-16 text-center">
            {tab === 0 ? (
              <>
                <CheckSquare size={44} className="mx-auto mb-4 text-text-placeholder" />
                <p className="text-[15px] text-text-muted">当前没有待你处理的申请</p>
                <p className="text-[13px] text-text-placeholder mt-2">
                  可切换身份为「普通成员」提交一条申请，再切回来处理
                </p>
              </>
            ) : (
              <>
                <Inbox size={44} className="mx-auto mb-4 text-text-placeholder" />
                <p className="text-[15px] text-text-muted">暂无已处理记录</p>
              </>
            )}
          </div>
        )}
      </div>

      <Modal
        open={Boolean(acting)}
        onClose={() => setActing(null)}
        title={acting?.approve ? '确认通过' : '确认驳回'}
        width={520}
      >
        {acting && (
          <div className="flex flex-col gap-4">
            <div className="border border-border rounded-sm divide-y divide-divider">
              {[
                { label: '申请单号', value: acting.app.code },
                { label: '申请模块', value: `${moduleOf(state, acting.app.moduleId)?.name} · ${moduleOf(state, acting.app.moduleId)?.edition}` },
                { label: '申请人', value: memberOf(state, acting.app.applicantId)?.name ?? '—' },
                { label: '席位数量', value: `${acting.app.seats} 个` },
                { label: '申请类型', value: kindLabels[acting.app.kind] },
              ].map((r) => (
                <div key={r.label} className="flex px-4 py-[10px] text-[14px]">
                  <span className="w-[80px] shrink-0 text-text-muted">{r.label}</span>
                  <span className="text-text">{r.value}</span>
                </div>
              ))}
            </div>

            {/* Spell out what happens on confirm. Asking the store where the
                request lands next keeps this honest when a stand-in approval
                also settles the level above. */}
            <div className={`px-4 py-3 rounded-sm ${acting.approve ? 'bg-primary-bg' : 'bg-danger-bg'}`}>
              <p className={`text-[13px] leading-relaxed ${acting.approve ? 'text-primary' : 'text-danger'}`}>
                {!acting.approve
                  ? '驳回后流程终止，申请人可修改理由后重新提交。'
                  : nextAfter
                    ? nextAfter.role === 'ORG_ADMIN'
                      ? '通过后将上报企业管理员进行二级审批。'
                      : '通过后将上报厂商核定免费额度。'
                    : acting.app.kind === 'SEAT'
                      ? '通过后将立即从企业席位池分配 1 个席位给申请人，不产生费用。'
                      : acting.app.kind === 'PURCHASE'
                        ? '通过后转入采购流程，需下单支付，到账后席位自动发放。'
                        : '通过后立即为该企业增加免费席位额度，并自动分配给申请人。'}
              </p>
              {actingStandIn && (
                <p className="text-[12.5px] text-text-secondary mt-2 leading-relaxed">
                  {deptAdminOnDuty
                    ? `这是部门层级的审批，${deptAdminOnDuty.name}也可处理；你的通过将记为代部门审批。`
                    : '该部门暂无可用的部门管理员，你正代为审批。'}
                  {acting.app.kind !== 'SEAT' && !nextAfter && '按同一人不重复签批的规则，企业审批不再单独走一遍，审批记录会如实标注。'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[14px] text-text-secondary mb-2">
                审批意见 {!acting.approve && <span className="text-danger">*</span>}
              </label>
              <textarea value={comment} rows={3}
                placeholder={acting.approve ? '可填写补充说明（选填）' : '请说明驳回原因，便于申请人调整'}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-[10px] text-[14px] field placeholder:text-text-placeholder focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all resize-none leading-relaxed" />
            </div>

            <div className="flex items-center gap-3">
              <button onClick={submit}
                disabled={!acting.approve && comment.trim().length === 0}
                className={`h-[36px] px-5 rounded-full text-[14px] font-semibold transition-colors ${
                  !acting.approve && comment.trim().length === 0
                    ? 'bg-surface-hover text-text-placeholder cursor-not-allowed'
                    : acting.approve
                      ? 'btn-primary text-white cursor-pointer'
                      : 'bg-danger text-white hover:brightness-95 cursor-pointer'
                }`}>
                确认{acting.approve ? '通过' : '驳回'}
              </button>
              <button onClick={() => setActing(null)}
                className="btn-soft h-[38px] px-5 text-[14px] font-semibold cursor-pointer">
                取消
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
