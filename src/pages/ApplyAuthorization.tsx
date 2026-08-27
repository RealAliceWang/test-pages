import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Building2, Check, CheckCircle2, ChevronRight, FileText, Info, KeyRound, Users,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { moduleIconMap } from '../assets/moduleIcons';
import {
  allocatedSeats, decideKind, isExpired, kindLabels, poolOf, spareSeats,
  stepsFor, useApp,
} from '../store';
import { roleLabels, type Role } from '../domain/types';
import { moduleLabel } from '../domain/format';

const steps = ['填写申请', '确认提交', '提交成功'];

/** Ceiling for a single request, whether self-service or a manager's batch. */
const MAX_SEATS = 20;

/**
 * Single source of truth for how a chain step's role reads in prose, used
 * both for "what happens next" copy and for "switch to this identity" copy
 * so the two never drift apart.
 */
const roleChainCopy: Record<Role, { approval: string; identity: string }> = {
  DEPT_ADMIN: { approval: '部门管理员审批', identity: '部门管理员' },
  ORG_ADMIN: { approval: '企业管理员审批', identity: '企业管理员' },
  VENDOR_OPS: { approval: '厂商额度审批', identity: '厂商运营' },
  MEMBER: { approval: '待处理', identity: '普通成员' },
};

export default function ApplyAuthorization() {
  const { moduleId = '' } = useParams();
  const navigate = useNavigate();
  const { state, me, myOrg, myDept, dispatch } = useApp();

  const mod = state.catalog.find((m) => m.id === moduleId);
  const pool = poolOf(state, me.orgId, moduleId);

  const [step, setStep] = useState(0);
  const [seats, setSeats] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [reason, setReason] = useState('');
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  if (!mod) {
    return (
      <div>
        <Header title="申请授权" subtitle="模块不存在" />
        <div className="p-6">
          <div className="panel py-16 text-center">
            <p className="text-[15px] text-text-muted">未找到该模块</p>
            <button onClick={() => navigate('/modules')}
              className="mt-4 h-[38px] px-5 rounded-full text-[13.5px] font-semibold text-primary bg-primary-bg cursor-pointer">
              返回模块中心
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Seat managers can request a batch for their team; members ask for themselves.
  const canRequestBatch = me.role === 'DEPT_ADMIN' || me.role === 'ORG_ADMIN';
  const kind = decideKind(state, me.orgId, moduleId, seats);
  // The chain skips the levels this applicant would otherwise sign themselves.
  const chain = stepsFor(kind, me.role);
  const chainText = chain.map((s) => s.label).join(' → ');
  const spare = pool && !isExpired(state, pool) ? spareSeats(state, pool) : 0;
  const amount = kind === 'PURCHASE' ? mod.unitPrice * seats : 0;

  const branchCopy: Record<typeof kind, { title: string; detail: string; tone: string; bg: string }> = {
    SEAT: {
      title: '席位分配 · 无需付费',
      detail: `企业已持有该模块 ${pool?.total ?? 0} 个席位，当前空闲 ${spare} 个。经${chainText}后从池内直接分配，不产生费用。`,
      tone: 'text-success',
      bg: 'bg-success-bg',
    },
    PURCHASE: {
      title: '采购扩容 · 需付费',
      detail: `该商业版模块${pool ? '席位已全部占用' : '尚未开通'}，需采购扩容。经${chainText}后生成订单，支付并到账后席位自动发放给你。`,
      tone: 'text-orange',
      bg: 'bg-orange-bg',
    },
    QUOTA: {
      title: '免费额度扩容 · 需厂商审批',
      detail: `该免费模块${pool ? '席位已用尽' : '尚未开通'}，需向厂商申请增加免费额度。经${chainText}后席位立即发放。`,
      tone: 'text-primary',
      bg: 'bg-primary-bg',
    },
  };
  const branch = branchCopy[kind];

  // Nothing left to approve means the applicant already holds every power the
  // chain would have asked for. Point them at the direct action instead of
  // letting them file a request only they could sign off.
  if (chain.length === 0) {
    const direct = kind === 'SEAT'
      ? { label: '前往席位池分配', to: '/seats', hint: '企业已持有该模块的空闲席位，你可以直接把席位分配给成员。' }
      : { label: '前往订单与账单下单', to: '/orders', hint: '该模块需付费扩容，你可以直接创建采购订单。' };
    return (
      <div>
        <Header title="申请授权" subtitle={`${moduleLabel(mod)} · ${mod.code}`} />
        <div className="p-6">
          <div className="panel px-10 py-12 max-w-[560px] mx-auto text-center">
            <div className="w-[46px] h-[46px] rounded-full bg-primary-bg text-primary flex items-center justify-center mx-auto">
              <KeyRound size={22} />
            </div>
            <p className="text-[16px] font-bold text-text mt-4">你无需提交申请</p>
            <p className="text-[13.5px] text-text-secondary mt-2 leading-relaxed">
              作为{roleLabels[me.role]}，你本身就是企业内的最终审批人。审批自己提交的申请等于没有审批，
              因此这类需求请直接执行。{direct.hint}
            </p>
            <div className="flex items-center justify-center gap-3 mt-7">
              <button onClick={() => navigate(direct.to)}
                className="btn-primary h-[38px] px-6 text-[13.5px] font-semibold cursor-pointer">
                {direct.label}
              </button>
              <button onClick={() => navigate(`/module/${moduleId}`)}
                className="btn-soft h-[38px] px-5 text-[13.5px] font-semibold cursor-pointer">
                返回模块详情
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canSubmit = reason.trim().length >= 5 && seats >= 1;

  const submit = () => {
    dispatch({ type: 'SUBMIT_APPLICATION', moduleId, seats, reason: reason.trim(), projectName: projectName.trim() });
    // The reducer prefixes new applications, so the newest one is ours.
    setSubmittedCode('pending');
    setStep(2);
  };

  const newest = state.applications.find((a) => a.applicantId === me.id);

  return (
    <div>
      <Header title="申请授权" subtitle={`${moduleLabel(mod)} · ${mod.code}`} />

      <div className="px-7 pb-7 flex flex-col gap-4">
        {step < 2 && (
          <button onClick={() => (step === 0 ? navigate(`/module/${moduleId}`) : setStep(0))}
            className="self-start h-[34px] px-3.5 -mt-1 rounded-full text-[14px] text-text-secondary inline-flex items-center gap-1 hover:bg-surface-hover transition-colors cursor-pointer">
            <ArrowLeft size={14} /> {step === 0 ? '返回模块详情' : '上一步'}
          </button>
        )}

        {/* Stepper */}
        <div className="panel px-6 py-5">
          <div className="flex items-center">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-[10px]">
                  <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0 transition-colors ${
                    i < step ? 'bg-success text-white' : i === step ? 'bg-ink text-white' : 'bg-surface-hover text-text-placeholder'
                  }`}>
                    {i < step ? <Check size={15} strokeWidth={2.6} /> : i + 1}
                  </div>
                  <span className={`text-[14px] whitespace-nowrap ${
                    i === step ? 'text-text font-semibold' : i < step ? 'text-success' : 'text-text-placeholder'
                  }`}>
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-[2px] mx-4 rounded-full ${i < step ? 'bg-success-light' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {step === 0 && (
          <div className="grid grid-cols-3 gap-4 items-start">
            <div className="col-span-2 flex flex-col gap-4">
              {/* Which branch this request will take */}
              <div className="panel p-6">
                <div className={`rounded-sm px-4 py-[14px] ${branch.bg} flex items-start gap-3`}>
                  <Info size={17} className={`${branch.tone} shrink-0 mt-[2px]`} />
                  <div>
                    <p className={`text-[14px] font-medium ${branch.tone}`}>{branch.title}</p>
                    <p className="text-[13px] text-text-secondary mt-[5px] leading-relaxed">{branch.detail}</p>
                  </div>
                </div>

                <p className="text-[15px] font-bold text-text mt-6 mb-4">申请信息</p>

                <div className="flex flex-col gap-[18px]">
                  <div>
                    <label className="block text-[13px] font-medium text-text-secondary mb-2">
                      申请席位数 {canRequestBatch
                        ? <span className="text-text-placeholder">（可为团队批量申请，最多 {MAX_SEATS} 个）</span>
                        : <span className="text-text-placeholder">（普通成员仅可为本人申请 1 个）</span>}
                    </label>
                    <div className="flex items-center gap-3">
                      <input type="number" min={1} max={MAX_SEATS} value={seats}
                        disabled={!canRequestBatch}
                        onChange={(e) => setSeats(Math.max(1, Math.min(MAX_SEATS, Number(e.target.value) || 1)))}
                        className="w-[120px] h-[36px] px-3 text-[14px] field disabled:bg-surface-hover disabled:text-text-muted" />
                      {amount > 0 && (
                        <span className="text-[14px] text-text-secondary">
                          预估金额 <span className="text-[16px] font-bold text-orange">¥{amount.toLocaleString()}</span>
                          <span className="text-[13px] text-text-muted"> （¥{mod.unitPrice.toLocaleString()} × {seats}）</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-text-secondary mb-2">关联项目</label>
                    <input type="text" value={projectName} placeholder="例如：苏州园区研发楼"
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full h-[36px] px-3 text-[14px] field placeholder:text-text-placeholder" />
                    <p className="text-[12px] text-text-placeholder mt-[6px]">填写项目名便于管理员按项目归集成本，非必填</p>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-text-secondary mb-2">
                      申请理由 <span className="text-danger">*</span>
                    </label>
                    <textarea value={reason} rows={4} placeholder="说明业务场景与必要性，便于管理员判断，至少 5 个字"
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-[10px] text-[14px] field placeholder:text-text-placeholder resize-none leading-relaxed" />
                    <p className={`text-[12px] mt-[6px] ${
                      reason.trim().length > 0 && reason.trim().length < 5 ? 'text-warning' : 'text-text-muted'
                    }`}>{reason.trim().length} / 至少 5 个字（建议 20 字以上）</p>
                  </div>
                </div>

                <button disabled={!canSubmit} onClick={() => setStep(1)}
                  className={`mt-6 h-[38px] px-6 rounded-full text-[13.5px] font-semibold inline-flex items-center gap-1 transition-colors ${
                    canSubmit ? 'btn-primary text-white cursor-pointer' : 'bg-surface-hover text-text-placeholder cursor-not-allowed'
                  }`}>
                  下一步 <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="panel p-5">
                <div className="flex items-start gap-3">
                  <img src={moduleIconMap[mod.icon] || moduleIconMap.building} alt="" className="w-[44px] h-[44px] object-contain shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-text truncate">{mod.name}</p>
                    <p className="text-[13px] text-text-muted mt-[2px]">{mod.code} · {mod.edition}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-divider flex flex-col gap-[10px] text-[13px]">
                  <div className="flex justify-between"><span className="text-text-muted">授权期限</span><span className="text-text">{mod.duration} 天</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">计算节点</span><span className="text-text">{mod.nodes} 节点</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">席位单价</span><span className="text-text">{mod.unitPrice > 0 ? `¥${mod.unitPrice.toLocaleString()}/年` : '免费'}</span></div>
                </div>
              </div>

              <div className="panel p-5">
                <p className="text-[14px] font-bold text-text mb-3 flex items-center gap-2">
                  <KeyRound size={15} className="text-primary" /> 企业席位现状
                </p>
                {pool && !isExpired(state, pool) ? (
                  <div className="flex flex-col gap-[10px] text-[13px]">
                    <div className="flex justify-between"><span className="text-text-muted">持有席位</span><span className="text-text">{pool.total} 个</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">已分配</span><span className="text-text">{allocatedSeats(state, pool.id)} 个</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">空闲</span><span className={spare > 0 ? 'text-success' : 'text-orange'}>{spare} 个</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">到期日</span><span className="text-text">{pool.expireDate}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">来源</span><span className="text-text">{pool.source}</span></div>
                  </div>
                ) : (
                  <p className="text-[13px] text-text-muted leading-relaxed">
                    {myOrg.shortName} 尚未开通该模块，本次申请将触发{kindLabels[kind]}流程。
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-3 gap-4 items-start">
            <div className="col-span-2 panel p-6">
              <p className="text-[15px] font-bold text-text mb-4">确认申请信息</p>

              <div className="border border-border rounded-sm divide-y divide-divider">
                {[
                  { label: '申请模块', value: `${moduleLabel(mod)} · ${mod.code}` },
                  { label: '申请类型', value: `${kindLabels[kind]}${amount > 0 ? ` · 预估 ¥${amount.toLocaleString()}` : ' · 无费用'}` },
                  { label: '席位数量', value: `${seats} 个` },
                  { label: '关联项目', value: projectName.trim() || '—' },
                  { label: '申请人', value: `${me.name} · ${me.title} · ${roleLabels[me.role]}` },
                  { label: '所属部门', value: myDept?.name ?? '—' },
                  { label: '所属企业', value: myOrg.name },
                ].map((r) => (
                  <div key={r.label} className="flex px-4 py-[11px] text-[14px]">
                    <span className="w-[110px] shrink-0 text-text-muted">{r.label}</span>
                    <span className="text-text">{r.value}</span>
                  </div>
                ))}
                <div className="flex px-4 py-[11px] text-[14px]">
                  <span className="w-[110px] shrink-0 text-text-muted">申请理由</span>
                  <span className="text-text leading-relaxed">{reason.trim()}</span>
                </div>
              </div>

              <div className="mt-5 rounded-sm bg-surface-secondary px-4 py-[14px]">
                <p className="text-[13px] text-text-secondary leading-relaxed">
                  提交后申请将进入审批流。你可在「我的申请」中查看进度，未进入下一环节前可自行撤销。
                </p>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button onClick={submit}
                  className="btn-primary h-[38px] px-6 text-[13.5px] font-semibold cursor-pointer">
                  确认提交
                </button>
                <button onClick={() => setStep(0)}
                  className="btn-soft h-[38px] px-5 text-[13.5px] font-semibold cursor-pointer">
                  返回修改
                </button>
              </div>
            </div>

            <div className="panel p-5">
              <p className="text-[14px] font-bold text-text mb-4">审批链预览</p>
              {me.role === 'DEPT_ADMIN' && (
                <p className="text-[13px] text-text-secondary bg-surface-secondary rounded-sm px-3 py-2 mb-4 leading-relaxed">
                  你是本部门管理员，本人提交的申请不由自己审批，已跳过部门审批直接上报企业管理员。
                </p>
              )}
              <div className="flex flex-col">
                {chain.map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-[24px] h-[24px] rounded-full bg-surface-hover text-text-muted flex items-center justify-center text-[12px] shrink-0">
                        {i + 1}
                      </div>
                      {/* The connector must also bridge into the spliced purchase
                          node below, or the line visually breaks at the last
                          approval step of a PURCHASE chain. */}
                      {(i < chain.length - 1 || kind === 'PURCHASE') && (
                        <div className="w-[2px] flex-1 min-h-[26px] bg-border my-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-[14px] text-text">{s.label}</p>
                      <p className="text-[12px] text-text-muted mt-[3px]">
                        {s.role === 'DEPT_ADMIN' ? '由本部门管理员审批' : s.role === 'ORG_ADMIN' ? '由企业管理员审批' : '由厂商运营核定额度'}
                      </p>
                    </div>
                  </div>
                ))}
                {kind === 'PURCHASE' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-[24px] h-[24px] rounded-full bg-orange-bg text-orange flex items-center justify-center text-[12px] shrink-0">
                        {chain.length + 1}
                      </div>
                    </div>
                    <div>
                      <p className="text-[14px] text-text">采购与支付</p>
                      <p className="text-[12px] text-text-muted mt-[3px]">企业管理员下单支付，到账后席位自动发放</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="panel px-6 py-12">
            <div className="max-w-[560px] mx-auto text-center">
              <div className="w-[64px] h-[64px] rounded-full bg-success-bg flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={30} className="text-success" />
              </div>
              <p className="text-[20px] font-bold text-text">申请已提交</p>
              <p className="text-[14px] text-text-muted mt-3 leading-relaxed">
                单号 <span className="text-text font-medium">{newest?.code ?? submittedCode}</span>，
                当前状态「{newest?.status ?? '待部门审批'}」。审批结果会通知到你。
              </p>

              <div className="mt-7 border border-border rounded-sm divide-y divide-divider text-left">
                {[
                  { icon: FileText, label: '申请模块', value: moduleLabel(mod) },
                  { icon: KeyRound, label: '申请类型', value: `${kindLabels[kind]} · ${seats} 个席位` },
                  { icon: Users, label: '下一环节', value: roleChainCopy[chain[0].role].approval },
                  { icon: Building2, label: '所属企业', value: myOrg.name },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-3 px-4 py-[12px]">
                    <r.icon size={15} className="text-text-muted shrink-0" />
                    <span className="w-[80px] shrink-0 text-[13px] text-text-muted">{r.label}</span>
                    <span className="text-[14px] text-text">{r.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-3 mt-7">
                <button onClick={() => navigate('/applications')}
                  className="btn-primary h-[38px] px-6 text-[13.5px] font-semibold cursor-pointer">
                  查看申请进度
                </button>
                <button onClick={() => navigate('/modules')}
                  className="btn-soft h-[38px] px-5 text-[13.5px] font-semibold cursor-pointer">
                  返回模块中心
                </button>
              </div>

              <p className="text-[12px] text-text-placeholder mt-6 leading-relaxed">
                提示：切换到「{roleChainCopy[chain[0].role].identity}」身份可在审批中心处理这条申请，完整走通闭环。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
