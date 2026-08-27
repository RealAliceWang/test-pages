import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Clock, KeyRound, Layers,
  Sparkles, UserCheck, Users as UsersIcon,
} from 'lucide-react';
import Header from '../components/layout/Header';
import StatusBadge from '../components/common/StatusBadge';
import { moduleDetails } from '../data/mock';
import { moduleIconMap } from '../assets/moduleIcons';
import { can } from '../domain/permissions';
import {
  allocatedSeats,
  assignmentsOfMember,
  daysBetween,
  decideKind,
  isExpired,
  kindHint,
  kindLabels,
  moduleOf,
  poolOf,
  spareSeats,
  useApp,
} from '../store';

const sectionLabels = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'];

export default function ModuleDetail() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { state, me, myOrg } = useApp();

  const mod = moduleId ? moduleOf(state, moduleId) : undefined;
  const detail = moduleId ? moduleDetails[moduleId] : undefined;

  if (!mod) {
    return (
      <div>
        <Header title="模块详情" subtitle="查看模块功能介绍与企业授权状态" />
        <div className="p-6 flex flex-col items-center justify-center py-24">
          <Layers size={48} className="mx-auto mb-4 text-text-placeholder" />
          <p className="text-[16px] text-text-muted mb-2">未找到该模块</p>
          <p className="text-[14px] text-text-placeholder mb-6">请检查模块编号是否正确</p>
          <button
            onClick={() => navigate('/modules')}
            className="h-[36px] px-4  text-[14px] font-semibold btn-primary text-white cursor-pointer"
          >
            返回模块中心
          </button>
        </div>
      </div>
    );
  }

  const pool = poolOf(state, me.orgId, mod.id);
  const allocated = pool ? allocatedSeats(state, pool.id) : 0;
  const spare = pool ? spareSeats(state, pool) : 0;
  const poolExpired = pool ? isExpired(state, pool) : false;
  const poolRemain = pool ? daysBetween(state.now, pool.expireDate) : 0;
  const poolStatus = !pool ? '未开通' : poolExpired ? '已过期' : spare > 0 ? '席位充足' : '席位已满';

  const mySeat = assignmentsOfMember(state, me.id).find((a) => a.moduleId === mod.id);
  const held = Boolean(mySeat) && mySeat?.status === '生效中' && !poolExpired;

  // Vendor operators browse the catalog but never consume seats themselves.
  const canApply = can(me.role, 'application:create');
  const kind = decideKind(state, me.orgId, mod.id, 1);
  const hint = kindHint(state, me.orgId, mod.id);

  const cta = held ? (
    <button
      disabled
      className="btn-soft h-[38px] px-5 text-[13.5px] font-semibold text-text-muted inline-flex items-center gap-1.5 cursor-not-allowed"
    >
      <UserCheck size={15} /> 已持有席位
    </button>
  ) : canApply ? (
    <button
      onClick={() => navigate(`/apply/${mod.id}`)}
      className="btn-primary h-[38px] px-5 text-[13.5px] font-semibold inline-flex items-center gap-1 cursor-pointer"
    >
      {mySeat ? '申请续期' : '申请授权'} <ChevronRight size={15} strokeWidth={2.5} />
    </button>
  ) : null;

  return (
    <div>
      <Header title="模块详情" subtitle="查看模块功能介绍与企业授权状态" />

      <div className="px-7 pb-7 flex flex-col gap-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[14px] text-text-muted">
          <button onClick={() => navigate('/modules')} className="hover:text-primary transition-colors cursor-pointer">
            模块中心
          </button>
          <ChevronRight size={14} />
          <span className="text-text font-medium">{mod.name}</span>
        </nav>

        {/* Module header */}
        <div className="panel overflow-hidden">
          <div className="px-5 py-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-[64px] h-[64px] rounded-md bg-surface-secondary flex items-center justify-center shrink-0">
                  <img
                    src={moduleIconMap[mod.icon] || moduleIconMap.building}
                    alt=""
                    className="w-[44px] h-[44px] object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-[13.5px] font-bold text-text tracking-[-0.01em]">{mod.name}</h2>
                    <StatusBadge status={mod.edition} tone={mod.edition === '商业版' ? 'warning' : 'info'} />
                    {!mod.listed && <StatusBadge status="已下架" />}
                  </div>
                  <p className="text-[14px] text-text-muted mb-2">
                    {mod.code} · {mod.category}
                  </p>
                  <p className="text-[14px] text-text-secondary leading-[22px] max-w-[640px]">
                    {detail?.fullDescription || mod.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0 ml-6">
                {mod.edition === '商业版' && (
                  <div className="text-right">
                    <span className="text-[20px] font-bold text-orange">¥{mod.unitPrice.toLocaleString()}</span>
                    <span className="text-[12px] text-text-muted">/席位/年</span>
                  </div>
                )}
                {cta}
                {!held && canApply && (
                  <p className="text-[12px] text-text-muted text-right max-w-[240px] leading-[18px]">
                    {kindLabels[kind]} · {hint}
                  </p>
                )}
                {!canApply && (
                  <p className="text-[12px] text-text-muted text-right max-w-[240px] leading-[18px]">
                    厂商侧账号不参与企业席位申请
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-divider text-[14px] text-text-muted">
              <span className="inline-flex items-center gap-1">
                <Clock size={13} /> {mod.duration} 天/席位
              </span>
              <span className="inline-flex items-center gap-1">
                <UsersIcon size={13} /> {mod.nodes} 节点
              </span>
              {detail && (
                <>
                  <span className="inline-flex items-center gap-1">
                    <Sparkles size={13} /> {detail.version}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <BookOpen size={13} /> {detail.updateDate}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Seat pool of the signed-in organization */}
        <div className="panel px-5 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-[32px] h-[32px] rounded-full bg-primary-bg flex items-center justify-center">
              <KeyRound size={14} className="text-primary" />
            </div>
            <h3 className="text-[13.5px] font-bold text-text tracking-[-0.01em]">企业授权状态</h3>
            {canApply && (
              <>
                <span className="text-[13px] text-text-muted">{myOrg.shortName}</span>
                <span className="ml-auto">
                  <StatusBadge status={poolStatus} />
                </span>
              </>
            )}
          </div>

          {!canApply ? (
            <div className="rounded-md bg-surface-secondary px-4 py-6 text-center">
              <p className="text-[14px] text-text-secondary">厂商侧账号不隶属客户企业，无席位池</p>
              <p className="text-[13px] text-text-muted mt-1.5">各企业的开通与用量情况请前往厂商后台查看</p>
            </div>
          ) : pool ? (
            <>
              <div className="grid grid-cols-4 gap-4">
                <div className="panel-inset px-4 py-3">
                  <p className="text-[13px] text-text-muted">已分配席位</p>
                  <p className="text-[20px] font-bold text-text mt-1 leading-none">
                    {allocated}
                    <span className="text-[13px] font-normal text-text-muted"> / {pool.total}</span>
                  </p>
                  {/* Shared meter, so allocation reads the same here as in the
                      catalogue and the seat pool page. */}
                  <div className="meter mt-2.5">
                    <span
                      style={{
                        width: `${Math.min(100, Math.round((allocated / pool.total) * 100))}%`,
                        background: spare > 0 ? 'var(--color-signal)' : 'var(--color-warning-light)',
                      }}
                    />
                  </div>
                </div>
                <div className="panel-inset px-4 py-3">
                  <p className="text-[13px] text-text-muted">剩余空闲席位</p>
                  <p
                    className={`text-[20px] font-bold mt-1 leading-none ${spare > 0 ? 'text-success' : 'text-warning'}`}
                  >
                    {spare}
                    <span className="text-[13px] font-normal text-text-muted"> 席</span>
                  </p>
                  <p className="text-[12px] text-text-muted mt-2.5">
                    {spare > 0 ? '可直接分配，无需采购' : '需扩容后才能新增分配'}
                  </p>
                </div>
                <div className="panel-inset px-4 py-3">
                  <p className="text-[13px] text-text-muted">到期日期</p>
                  <p className="text-[15px] font-medium text-text mt-1.5">{pool.expireDate}</p>
                  <p className={`text-[12px] mt-2 ${poolExpired ? 'text-danger' : 'text-text-muted'}`}>
                    {poolExpired ? '席位池已过期' : `剩余 ${poolRemain} 天`}
                  </p>
                </div>
                <div className="panel-inset px-4 py-3">
                  <p className="text-[13px] text-text-muted">授权来源</p>
                  <p className="text-[15px] font-medium text-text mt-1.5">{pool.source}</p>
                  <p className="text-[12px] text-text-muted mt-2">{pool.startDate} 起生效</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-divider flex items-center gap-2">
                <UserCheck size={14} className="text-text-muted shrink-0" />
                <span className="text-[13px] text-text-secondary">我的席位</span>
                {mySeat ? (
                  <>
                    <StatusBadge status={poolExpired ? '已过期' : mySeat.status} />
                    <span className="text-[13px] text-text-muted">
                      {mySeat.assignedAt} 起持有，已使用 {mySeat.usedDays} 天
                    </span>
                  </>
                ) : (
                  <span className="text-[13px] text-text-muted">
                    未持有该模块席位{spare > 0 ? '，本企业池内仍有空闲席位' : ''}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-md bg-surface-secondary px-4 py-6 text-center">
              <p className="text-[14px] text-text-secondary">本企业尚未开通该模块</p>
              <p className="text-[13px] text-text-muted mt-1.5">
                {mod.edition === '商业版'
                  ? '商业版需由企业采购席位后统一分配'
                  : '免费版可由企业向厂商申请席位额度后分配'}
              </p>
            </div>
          )}
        </div>

        {/* Highlights */}
        {detail && detail.highlights.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Highlights are peers, so they share one tone; rotating hues here
                only made the page look decorated rather than designed. */}
            {detail.highlights.map((h, i) => (
              <div key={i} className="panel px-5 py-4 flex items-center gap-3">
                <span className="w-[36px] h-[36px] rounded-full bg-primary-bg flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} className="text-primary" strokeWidth={2.2} />
                </span>
                <span className="text-[14px] font-bold text-text">{h}</span>
              </div>
            ))}
          </div>
        )}

        {/* Detail sections */}
        {detail &&
          detail.sections.map((section, idx) => {
            return (
              <div key={idx} className="panel overflow-hidden">
                <div className="px-6 py-6">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="num inline-flex items-center justify-center w-[30px] h-[30px] rounded-full bg-ink text-[12px] font-bold text-white">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="eyebrow leading-none">
                        PART {sectionLabels[idx] || idx + 1}
                      </p>
                      <h3 className="text-[16px] font-bold text-text mt-1.5 tracking-[-0.02em]">{section.title}</h3>
                    </div>
                  </div>

                  <p className="text-[14px] text-text-secondary leading-[23px] mb-4">{section.content}</p>

                  {section.features && section.features.length > 0 && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {section.features.map((f, fi) => (
                        <div key={fi} className="flex items-center gap-2.5 px-4 py-3 rounded-sm bg-surface-secondary">
                          <CheckCircle2 size={14} className="text-primary shrink-0" strokeWidth={2.2} />
                          <span className="text-[14px] text-text leading-[20px]">{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        {/* Standards */}
        {detail && detail.standards && detail.standards.length > 0 && (
          <div className="panel px-5 py-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-[32px] h-[32px] rounded-full bg-primary-bg flex items-center justify-center">
                <BookOpen size={14} className="text-primary" />
              </div>
              <h3 className="text-[13.5px] font-bold text-text tracking-[-0.01em]">支持的规范标准</h3>
              <span className="ml-auto text-[14px] text-text-muted">共 {detail.standards.length} 项</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {detail.standards.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5 px-4 py-2.5 rounded-sm bg-surface-secondary">
                  <span className="inline-block w-[6px] h-[6px] rounded-full bg-primary shrink-0 mt-[7px]" />
                  <span className="text-[14px] text-text-secondary leading-[20px]">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback when the catalog entry has no long-form content yet */}
        {!detail && (
          <div className="panel py-16 text-center">
            <BookOpen size={48} className="mx-auto mb-4 text-text-placeholder" />
            <p className="text-[16px] text-text-muted mb-2">暂无详细介绍</p>
            <p className="text-[14px] text-text-placeholder">该模块的详细功能说明正在完善中，敬请期待</p>
          </div>
        )}

        {/* Bottom action bar */}
        <div className="panel px-5 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/modules')}
            className="h-[34px] px-4 text-[14px] font-semibold text-text-secondary bg-surface-hover rounded-full inline-flex items-center gap-[6px] hover:brightness-95 transition-all cursor-pointer"
          >
            <ChevronLeft size={14} /> 返回模块中心
          </button>
          <div className="flex items-center gap-3">
            {!held && canApply && <span className="text-[13px] text-text-muted">{hint}</span>}
            {cta}
          </div>
        </div>
      </div>
    </div>
  );
}
