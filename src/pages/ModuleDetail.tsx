import { useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Clock, Users as UsersIcon,
  CheckCircle2, BookOpen, Layers, Sparkles,
} from 'lucide-react';
import Header from '../components/layout/Header';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import { modules, moduleDetails, type Module, type ModuleDetailData } from '../data/mock';
import { moduleIconMap } from '../assets/moduleIcons';

const inputCls = "w-full h-[40px] px-3 text-[14px] text-[#1D2129] bg-[#F7F8FA] border border-[#E5E6EB] rounded-sm outline-none placeholder:text-[#C9CDD4] focus:border-[#1C71D8] focus:bg-white transition-all";
const textareaCls = "w-full px-3 py-2.5 text-[14px] text-[#1D2129] bg-[#F7F8FA] border border-[#E5E6EB] rounded-sm outline-none placeholder:text-[#C9CDD4] focus:border-[#1C71D8] focus:bg-white transition-all resize-none";
const labelCls = "block text-[14px] font-semibold text-[#1D2129] mb-1.5";

const sectionLabels = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'];
const sectionColors = ['#1C71D8', '#16A34A', '#7C3AED', '#EA580C', '#0891B2', '#DB2777'];

function getIcon(key: string) {
  return <img src={moduleIconMap[key] || moduleIconMap.building} alt="" className="w-[48px] h-[48px] object-contain" />;
}

export default function ModuleDetail() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const [applyOpen, setApplyOpen] = useState(false);
  const [applied, setApplied] = useState(false);

  const mod: Module | undefined = modules.find(m => m.id === moduleId);
  const detail: ModuleDetailData | undefined = moduleId ? moduleDetails[moduleId] : undefined;

  if (!mod) {
    return (
      <div className="min-h-screen">
        <Header title="模块详情" subtitle="查看模块功能介绍与技术规范" />
        <div className="p-6 flex flex-col items-center justify-center py-24">
          <Layers size={48} className="mx-auto mb-4 text-text-placeholder" />
          <p className="text-[16px] text-text-muted mb-2">未找到该模块</p>
          <p className="text-[14px] text-text-placeholder mb-6">请检查模块ID是否正确</p>
          <button onClick={() => navigate('/modules')}
            className="h-[36px] px-4 rounded-sm text-[14px] font-semibold text-white transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #1C71D8 0%, #3584E4 100%)' }}>
            返回模块中心
          </button>
        </div>
      </div>
    );
  }

  const isPaid = !!mod.price;
  const displayStatus = applied ? '审核中' : (isPaid ? (mod.status === '可申请' ? '可购买' : mod.status === '已开通' ? '已购买' : mod.status) : mod.status);
  const canAction = displayStatus === '可申请' || displayStatus === '可购买';

  const handleApplySubmit = (e: FormEvent) => {
    e.preventDefault();
    setApplied(true);
    setApplyOpen(false);
  };

  const handleAction = () => {
    if (isPaid) {
      navigate(`/purchase/${mod.id}`);
    } else {
      setApplyOpen(true);
    }
  };

  const iconNode = (
    <div className="w-[40px] h-[40px] rounded-md flex items-center justify-center shrink-0">
      {getIcon(mod.icon)}
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header title="模块详情" subtitle="查看模块功能介绍与技术规范" />

      <div className="p-6 flex flex-col gap-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[14px] text-[#86909C]">
          <button onClick={() => navigate('/modules')} className="hover:text-[#1C71D8] transition-colors cursor-pointer">
            模块中心
          </button>
          <ChevronRight size={14} />
          <span className="text-[#1D2129] font-medium">{mod.name}</span>
        </nav>

        {/* Module header card */}
        <div className="bg-white rounded-md overflow-hidden">
          <div className="px-5 py-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-[64px] h-[64px] rounded-md bg-[#F7F8FA] flex items-center justify-center shrink-0">
                  <img src={moduleIconMap[mod.icon] || moduleIconMap.building} alt="" className="w-[44px] h-[44px] object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-[16px] font-bold text-[#1D2129]">{mod.name}</h2>
                    <StatusBadge status={displayStatus} />
                  </div>
                  <p className="text-[14px] text-text-muted mb-2">{mod.code} · {mod.category}</p>
                  <p className="text-[14px] text-text-secondary leading-[22px] max-w-[640px]">
                    {detail?.fullDescription || mod.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 shrink-0 ml-6">
                {isPaid && (
                  <div className="text-right">
                    <span className="text-[16px] font-bold text-[#F77234]">¥{mod.price!.toLocaleString()}</span>
                    <span className="text-[12px] font-normal text-[#C9CDD4]">/年</span>
                  </div>
                )}
                {canAction && (
                  <button onClick={handleAction}
                    className="h-[36px] px-5 rounded-sm text-[14px] font-semibold text-white flex items-center gap-1 cursor-pointer transition-all hover:brightness-110"
                    style={{ background: isPaid ? 'linear-gradient(135deg, #F77234 0%, #F99D1C 100%)' : 'linear-gradient(135deg, #1C71D8 0%, #3584E4 100%)' }}>
                    {isPaid ? '立即购买' : '申请试用'} <ChevronRight size={15} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-[#F2F3F5]">
              <div className="flex items-center gap-4 text-[14px] text-text-muted">
                <span className="inline-flex items-center gap-1"><Clock size={13} /> {mod.duration}天</span>
                <span className="inline-flex items-center gap-1"><UsersIcon size={13} /> {mod.nodes}节点</span>
                {detail && (
                  <>
                    <span className="inline-flex items-center gap-1"><Sparkles size={13} /> {detail.version}</span>
                    <span className="inline-flex items-center gap-1"><BookOpen size={13} /> {detail.updateDate}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Highlights */}
        {detail && detail.highlights.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {detail.highlights.map((h, i) => {
              const colors = [
                { accent: '#2563EB', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.18)', iconBg: 'rgba(59,130,246,0.12)' },
                { accent: '#16A34A', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.18)', iconBg: 'rgba(34,197,94,0.12)' },
                { accent: '#EA580C', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.18)', iconBg: 'rgba(251,146,60,0.12)' },
                { accent: '#7C3AED', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.18)', iconBg: 'rgba(139,92,246,0.12)' },
              ];
              const c = colors[i % colors.length];
              return (
                <div key={i} className="relative rounded-lg px-5 py-4 overflow-hidden"
                  style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                  <div className="absolute -top-4 -right-4 w-[48px] h-[48px] rounded-full" style={{ background: c.bg }} />
                  <div className="relative flex items-center gap-3">
                    <div className="w-[36px] h-[36px] rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: c.iconBg, color: c.accent }}>
                      <CheckCircle2 size={18} />
                    </div>
                    <span className="text-[14px] font-bold text-[#1D2129]">{h}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detail sections */}
        {detail && detail.sections.map((section, idx) => {
          const color = sectionColors[idx % sectionColors.length];
          return (
            <div key={idx} className="bg-white rounded-md overflow-hidden">
              <div className="px-5 py-5">
                {/* Section header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center justify-center w-[28px] h-[28px] rounded-sm text-[12px] font-bold text-white"
                    style={{ background: color }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.15em] uppercase leading-none text-text-muted">
                      PART {sectionLabels[idx] || (idx + 1)}
                    </p>
                    <h3 className="text-[16px] font-bold text-[#1D2129] mt-1">{section.title}</h3>
                  </div>
                </div>

                <p className="text-[14px] text-text-secondary leading-[22px] mb-4">{section.content}</p>

                {section.features && section.features.length > 0 && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {section.features.map((f, fi) => (
                      <div key={fi} className="flex items-center gap-2.5 px-4 py-3 rounded-sm bg-[#F7F8FA]">
                        <CheckCircle2 size={14} style={{ color }} className="shrink-0" />
                        <span className="text-[14px] text-[#1D2129] leading-[20px]">{f}</span>
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
          <div className="bg-white rounded-md overflow-hidden">
            <div className="px-5 py-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-[28px] h-[28px] rounded-sm bg-[rgba(59,130,246,0.1)] flex items-center justify-center">
                  <BookOpen size={14} className="text-[#1C71D8]" />
                </div>
                <h3 className="text-[16px] font-bold text-[#1D2129]">支持的规范标准</h3>
                <span className="ml-auto text-[14px] text-text-muted">共 {detail.standards.length} 项</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {detail.standards.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5 px-4 py-2.5 rounded-sm bg-[#F7F8FA]">
                    <span className="inline-block w-[6px] h-[6px] rounded-full bg-[#1C71D8] shrink-0 mt-[7px]" />
                    <span className="text-[14px] text-text-secondary leading-[20px]">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fallback */}
        {!detail && (
          <div className="bg-white rounded-md py-16 text-center">
            <BookOpen size={48} className="mx-auto mb-4 text-text-placeholder" />
            <p className="text-[16px] text-text-muted mb-2">暂无详细介绍</p>
            <p className="text-[14px] text-text-placeholder">该模块的详细功能说明正在完善中，敬请期待</p>
          </div>
        )}

        {/* Bottom action bar */}
        <div className="bg-white rounded-md px-5 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/modules')}
            className="h-[32px] px-3 text-[14px] font-medium text-[#4E5969] bg-[#F2F3F5] rounded-sm inline-flex items-center gap-[6px] hover:bg-[#E5E6EB] transition-colors cursor-pointer">
            <ChevronLeft size={14} /> 返回模块中心
          </button>
          {canAction && (
            <button onClick={handleAction}
              className="h-[36px] px-5 rounded-sm text-[14px] font-semibold text-white flex items-center justify-center gap-1 cursor-pointer transition-all hover:brightness-110"
              style={{ background: isPaid ? 'linear-gradient(135deg, #F77234 0%, #F99D1C 100%)' : 'linear-gradient(135deg, #1C71D8 0%, #3584E4 100%)' }}>
              {isPaid ? '立即购买' : '申请试用'} <ChevronRight size={15} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Trial application modal */}
      <Modal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        width={560}
        header={
          <div className="flex items-center gap-3">
            {iconNode}
            <div>
              <h3 className="text-[16px] font-bold text-[#1D2129]">申请试用</h3>
              <p className="text-[14px] text-[#86909C]">{mod.name}</p>
            </div>
          </div>
        }
      >
        <form onSubmit={handleApplySubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-4 bg-[#F7F8FA] rounded-md p-4">
            <div><p className="text-[14px] text-[#86909C] mb-1">模块编号</p><p className="text-[14px] font-bold text-[#1D2129]">{mod.code}</p></div>
            <div><p className="text-[14px] text-[#86909C] mb-1">试用期限</p><p className="text-[14px] font-bold text-[#1D2129]">{mod.duration} 天</p></div>
            <div><p className="text-[14px] text-[#86909C] mb-1">节点数量</p><p className="text-[14px] font-bold text-[#1D2129]">{mod.nodes}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <div><label className={labelCls}>申请人姓名 <span className="text-[#F53F3F]">*</span></label><input required className={inputCls} placeholder="请输入姓名" /></div>
            <div><label className={labelCls}>所属部门 <span className="text-[#F53F3F]">*</span></label><input required className={inputCls} placeholder="请输入部门" /></div>
            <div><label className={labelCls}>联系电话 <span className="text-[#F53F3F]">*</span></label><input required className={inputCls} placeholder="请输入手机号" /></div>
            <div><label className={labelCls}>电子邮箱 <span className="text-[#F53F3F]">*</span></label><input required type="email" className={inputCls} placeholder="请输入邮箱" /></div>
          </div>
          <div><label className={labelCls}>使用场景 <span className="text-[#F53F3F]">*</span></label><textarea required className={textareaCls} rows={3} placeholder="请描述您的具体使用场景和需求..." /></div>
          <div><label className={labelCls}>申请理由 <span className="text-[#F53F3F]">*</span></label><textarea required className={textareaCls} rows={3} placeholder="请说明申请该模块试用的原因..." /></div>
          <div className="bg-[#FFF7E8] border border-[#FFDCA1] rounded-md px-4 py-3 text-[14px] text-[#D4770B] leading-[20px]">
            <strong>温馨提示：</strong>提交申请后，我们将在1-2个工作日内完成审核，审核结果将通过邮件和短信通知您。
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 pb-4">
            <button type="button" onClick={() => setApplyOpen(false)} className="h-[42px] rounded-sm text-[14px] font-medium text-[#4E5969] border border-[#C9CDD4] bg-white hover:border-[#86909C] transition-colors">取消</button>
            <button type="submit" className="h-[42px] rounded-sm text-[14px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.99]" style={{ background: '#1C71D8' }}>提交申请</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
