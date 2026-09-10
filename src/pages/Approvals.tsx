import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check, CheckSquare, ChevronDown, Gift, Inbox, KeyRound, ShoppingCart, TriangleAlert, X,
  type LucideIcon,
} from 'lucide-react';
import Header from '../components/layout/Header';
import TabFilter from '../components/common/TabFilter';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { moduleIconMap } from '../assets/moduleIcons';
import {
  allocatedSeats, deptOf, eligibleSigners, grantedFreeSeats, inboxOf, isExpired, isSettled,
  isStandIn, kindLabels, memberOf, moduleOf, orgOf, pendingStep, poolOf, spareSeats,
  stepAfterApproval, useApp, visibleApplications,
} from '../store';
import { roleLabels, type Application } from '../domain/types';
import { moduleLabel } from '../domain/format';
import { METER_FILL, poolHealth } from '../domain/poolHealth';

interface MeterRowProps {
  icon: LucideIcon;
  label: string;
  /** Right-hand figure, already coloured by the caller's own rules. */
  value: ReactNode;
  /**
   * Omitted when there is nothing to draw. Several approval contexts have a
   * figure but no denominator — an un-opened module, a lapsed pool — and a
   * ratio that cannot be drawn must not leave an empty track behind.
   */
  ratio?: { used: number; total: number };
}

/** One "label — figure — bar" row inside an approval card's evidence block. */
function MeterRow({ icon: Icon, label, value, ratio }: MeterRowProps) {
  const drawable = ratio && ratio.total > 0;
  const pct = drawable ? Math.min(100, Math.round((ratio.used / ratio.total) * 100)) : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-[13px]">
        <span className="inline-flex items-center gap-[6px] text-text-muted shrink-0">
          <Icon size={13} /> {label}
        </span>
        {value}
      </div>
      {drawable && (
        <div className="meter mt-[9px]">
          <span style={{ width: `${pct}%`, background: METER_FILL[poolHealth(pct)] }} />
        </div>
      )}
    </div>
  );
}

export default function Approvals() {
  const navigate = useNavigate();
  const { state, me, dispatch } = useApp();

  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [acting, setActing] = useState<{ app: Application; approve: boolean } | null>(null);
  const [comment, setComment] = useState('');

  // Which cards have their approval trail unfolded. Keyed by application so the
  // choice survives tab switches and re-filtering, which a per-card local state
  // would lose every time the list re-renders under a new search.
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  // A row arrived here via the workbench's "待我处理" queue, carrying which
  // application to land on — /approvals is otherwise just an undifferentiated
  // list, and re-finding one item in it by eye does not scale.
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get('focus');
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const inbox = inboxOf(state, me);
  const inboxIds = new Set(inbox.map((a) => a.id));
  const all = visibleApplications(state, me);
  const handled = all.filter((a) => !inboxIds.has(a.id));

  useEffect(() => {
    if (!focusId) return;
    // The target may sit in either tab depending on whether it is still
    // awaiting this identity's decision — switch to whichever one holds it.
    if (!inboxIds.has(focusId)) setTab(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId]);

  useEffect(() => {
    if (!focusId) return;
    const el = rowRefs.current[focusId];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightId(focusId);
    const timer = setTimeout(() => setHighlightId(null), 2000);
    return () => clearTimeout(timer);
    // Re-runs once the tab switch above (if any) has committed and the
    // target row actually exists in the DOM.
  }, [focusId, tab]);

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
              className="btn-primary h-[32px] px-4 text-[13px] font-semibold cursor-pointer shrink-0">
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

        {/* Two per row. Cards carry enough evidence to be decided without
            opening anything, so the win from a second column is real screen
            reach rather than density for its own sake. */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {list.map((app) => {
            const mod = moduleOf(state, app.moduleId);
            const applicant = memberOf(state, app.applicantId);
            const dept = deptOf(state, app.deptId);
            const org = orgOf(state, app.orgId);
            const pool = poolOf(state, app.orgId, app.moduleId);
            const lapsed = pool ? isExpired(state, pool) : false;
            // A lapsed pool holds seats nobody can use, so it must not be
            // counted as capacity — only a live pool has a usable denominator.
            const live = pool && !lapsed ? pool : undefined;
            const used = live ? allocatedSeats(state, live.id) : 0;
            const spare = live ? spareSeats(state, live) : 0;
            // Free-edition seats are capped per organisation rather than per
            // module, so a 免费额度扩容 request has a denominator even when the
            // module itself has no pool yet — and it is the figure the vendor
            // actually rules on.
            const freeQuota = org?.freeSeatQuota ?? 0;
            const freeUsed = grantedFreeSeats(state, app.orgId);
            // A settled request keeps its unsigned steps for the trail's sake,
            // so ask the status first — otherwise a withdrawn card still
            // advertises「代部门审批」for a step nobody will ever sign.
            const step = isSettled(app) ? undefined : pendingStep(app);
            const isMine = inboxIds.has(app.id);
            const amount = mod && app.kind === 'PURCHASE' ? mod.unitPrice * app.seats : 0;
            // The one part of a card whose height is genuinely unbounded: each
            // recorded step carries a free-text comment. Everything else above
            // is fixed-shape, which is why the fold targets this alone.
            const history = app.steps.filter((s) => s.action !== '待审批');
            const isOpen = expanded.has(app.id);

            return (
              <div
                key={app.id}
                ref={(el) => { rowRefs.current[app.id] = el; }}
                id={`approval-${app.id}`}
                className="panel p-5 flex flex-col transition-colors duration-700"
                style={highlightId === app.id ? { backgroundColor: 'var(--color-primary-bg)' } : undefined}
              >
                {/* The body absorbs the slack so the action footer stays pinned
                    to the bottom edge. Grid rows stretch every card to the
                    tallest one in the row, and buttons floating mid-card would
                    read as content that failed to load. */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <img src={moduleIconMap[mod?.icon ?? 'building'] || moduleIconMap.building} alt=""
                      className="w-[44px] h-[44px] object-contain shrink-0" />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13.5px] font-bold text-text tracking-[-0.01em]">
                          {mod ? moduleLabel(mod) : '—'}
                        </p>
                        {mod && <StatusBadge status={mod.edition} />}
                        <span className="text-[12px] px-[6px] py-[1px] rounded-sm bg-surface-hover text-text-muted">
                          {kindLabels[app.kind]}
                        </span>
                        <StatusBadge status={app.status} />
                        {step && isStandIn(me, step) && (
                          <span className="text-[12px] font-medium text-warning bg-warning-bg rounded-full px-2 py-0.5">代部门审批</span>
                        )}
                      </div>

                      <p className="text-[13px] text-text-muted mt-[6px]">
                        {app.code} · 申请 {app.seats} 个席位 · {app.createdAt}
                        {me.role === 'VENDOR_OPS' && org && ` · ${org.shortName}`}
                      </p>
                    </div>
                  </div>

                  {/* Below the head every block spans the full card width — half
                      a row cannot spare an icon-width gutter. Applicant meta
                      wraps rather than truncates: who is asking and for which
                      project is decision input, not decoration. */}
                  <div className="flex items-center gap-x-3 gap-y-1 mt-3 flex-wrap">
                    <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-white text-[12px] shrink-0"
                      style={{ background: applicant?.avatarColor ?? 'var(--color-text-placeholder)' }}>
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

                  {/* Everything the decision rests on, as one block, so the
                      approver never leaves the card to price a decision. Two
                      different ceilings apply and a request can sit under
                      both: the module's own pool, and — for free editions —
                      the organisation-wide quota the vendor grants. A full
                      module pool is the *reason* an escalating request exists,
                      so the free-quota row is what says whether it can be met.

                      The old width cap is gone with the two-column layout: it
                      existed to stop a meter spanning a page-wide card like an
                      alert stripe, and half a row is already narrow enough. */}
                  <div className="mt-3 px-4 py-[13px] bg-surface-secondary rounded-sm flex flex-col gap-[13px]">
                    <MeterRow
                      icon={KeyRound}
                      label="目标池余量"
                      ratio={live ? { used, total: live.total } : undefined}
                      value={live ? (
                        <span className={`font-semibold tabular-nums ${spare === 0 ? 'text-warning' : 'text-text'}`}>
                          {used} / {live.total}
                          <span className="font-medium ml-1">{spare === 0 ? '已满' : `空闲 ${spare}`}</span>
                        </span>
                      ) : lapsed && pool ? (
                        <span className="font-semibold text-warning">席位已于 {pool.expireDate} 到期</span>
                      ) : (
                        <span className="text-text-muted">企业尚未开通该模块</span>
                      )}
                    />

                    {/* Only free-edition requests draw on the granted quota;
                        a paid purchase is bounded by budget, which this
                        system does not model — so it gets no second bar. */}
                    {app.kind === 'QUOTA' && (
                      <MeterRow
                        icon={Gift}
                        label="企业免费额度"
                        ratio={{ used: freeUsed, total: freeQuota }}
                        value={
                          <span className="font-semibold tabular-nums text-text">
                            {freeUsed} / {freeQuota}
                            <span className="font-medium ml-1">
                              还可申领 {Math.max(0, freeQuota - freeUsed)}
                            </span>
                          </span>
                        }
                      />
                    )}

                    {amount > 0 && (
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[13px] text-text-muted">扩容预估</span>
                        <span className="display-num text-[19px] text-text">¥ {amount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* The conclusion the numbers above lead to, stated before the
                      approver commits rather than after. A full meter is the
                      reason an escalating request exists, not a blocker, so the
                      two branches that escalate name that cause out loud —
                      otherwise「池已满」next to a live 通过 button reads as a
                      contradiction. Only claimed when a live pool proves it;
                      an un-opened module has no余量 to be out of. */}
                  <div className="mt-[10px] text-[13px]">
                    {app.kind === 'SEAT' && (
                      <span className="text-success">池内有余量，通过后立即分配，不产生费用</span>
                    )}
                    {app.kind === 'PURCHASE' && (
                      <span className="text-orange inline-flex items-center gap-[6px]">
                        <TriangleAlert size={13} />
                        {live && spare === 0 ? '池内无余量，通过后需下单付费扩容' : '通过后需下单付费扩容'}
                      </span>
                    )}
                    {app.kind === 'QUOTA' && (
                      <span className="text-primary">
                        {live && spare === 0 ? '池内无余量，通过后由厂商核定免费额度' : '通过后由厂商核定免费额度'}
                      </span>
                    )}
                  </div>
                </div>

                {/* The outcome itself is never hidden — the status badge in the
                    head already carries it. What folds is the trail: who signed,
                    when, and the comment they left, which is the only text on a
                    card with no length ceiling. */}
                {history.length > 0 && (
                  <div className="mt-3">
                    <button
                      onClick={() => toggleExpanded(app.id)}
                      aria-expanded={isOpen}
                      aria-controls={`history-${app.id}`}
                      className="inline-flex items-center gap-1 text-[12.5px] font-medium text-text-muted hover:text-primary transition-colors cursor-pointer"
                    >
                      <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      {isOpen ? '收起审批记录' : `审批记录（${history.length}）`}
                    </button>

                    {isOpen && (
                      <div id={`history-${app.id}`} className="mt-2 flex flex-col gap-1">
                        {history.map((s, i) => (
                          <p key={i} className="text-[12px] text-text-muted flex items-start gap-[6px]">
                            {s.action === '通过'
                              ? <Check size={14} className="text-success shrink-0 mt-[2px]" />
                              : <X size={14} className="text-danger shrink-0 mt-[2px]" />}
                            <span>
                              {s.label}：
                              <span className={`font-medium ${s.action === '通过' ? 'text-success' : 'text-danger'}`}>
                                {s.action}
                              </span>
                              {` · ${s.approverName} · ${s.actedAt}`}
                              {s.comment && ` · ${s.comment}`}
                            </span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions sit on the card's bottom edge, behind a rule, so the
                    two cards in a row present their controls on one line. */}
                {isMine && step && (
                  <div className="mt-4 pt-4 border-t border-hairline flex items-center gap-2">
                    <button onClick={() => { setActing({ app, approve: true }); setComment(''); }}
                      className="btn-outline flex-1 h-[36px] text-[13px] font-semibold cursor-pointer">
                      通过
                    </button>
                    <button onClick={() => { setActing({ app, approve: false }); setComment(''); }}
                      className="flex-1 h-[36px] rounded-full text-[13px] font-semibold text-danger bg-danger-bg hover:brightness-95 transition-all cursor-pointer">
                      驳回
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {list.length === 0 && (
          <div className="panel py-16 text-center">
            {tab === 0 ? (
              <>
                <span className="w-[44px] h-[44px] rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-4">
                  <CheckSquare size={20} className="text-text-muted" />
                </span>
                <p className="text-[13px] text-text-muted">当前没有待你处理的申请</p>
                <p className="text-[13px] text-text-placeholder mt-2">
                  可切换身份为「普通成员」提交一条申请，再切回来处理
                </p>
              </>
            ) : (
              <>
                <span className="w-[44px] h-[44px] rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-4">
                  <Inbox size={20} className="text-text-muted" />
                </span>
                <p className="text-[13px] text-text-muted">暂无已处理记录</p>
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
                { label: '申请模块', value: (() => { const m = moduleOf(state, acting.app.moduleId); return m ? moduleLabel(m) : '—'; })() },
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
                <p className="text-[12px] text-text-secondary mt-2 leading-relaxed">
                  {deptAdminOnDuty
                    ? `这是部门层级的审批，${deptAdminOnDuty.name}也可处理；你的通过将记为代部门审批。`
                    : '该部门暂无可用的部门管理员，你正代为审批。'}
                  {acting.app.kind !== 'SEAT' && !nextAfter && '按同一人不重复签批的规则，企业审批不再单独走一遍，审批记录会如实标注。'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-2">
                审批意见 {!acting.approve && <span className="text-danger">*</span>}
              </label>
              <textarea value={comment} rows={3}
                placeholder={acting.approve ? '可填写补充说明（选填）' : '请说明驳回原因，便于申请人调整'}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-[10px] text-[14px] field placeholder:text-text-placeholder resize-none leading-relaxed" />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setActing(null)}
                className="btn-soft h-[38px] px-5 text-[13.5px] font-semibold cursor-pointer">
                取消
              </button>
              <button onClick={submit}
                disabled={!acting.approve && comment.trim().length === 0}
                className={`h-[38px] px-5 rounded-full text-[13.5px] font-semibold transition-colors ${
                  !acting.approve && comment.trim().length === 0
                    ? 'bg-surface-hover text-text-placeholder cursor-not-allowed'
                    : acting.approve
                      ? 'btn-primary cursor-pointer'
                      : 'bg-danger text-white hover:brightness-95 cursor-pointer'
                }`}>
                确认{acting.approve ? '通过' : '驳回'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
