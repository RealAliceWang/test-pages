import { useState, type FormEvent } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Clock, Users as UsersIcon, ChevronRight, Activity, Box, CreditCard, Sparkles,
} from 'lucide-react';
import Header from '../components/layout/Header';
import type { UserRole } from '../components/layout/Layout';
import TabFilter from '../components/common/TabFilter';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import { modules, moduleCategories, type Module } from '../data/mock';
import { moduleIconMap } from '../assets/moduleIcons';

const getIcon = (key: string) => <img src={moduleIconMap[key] || moduleIconMap.building} alt="" className="w-[48px] h-[48px] object-contain" />;
const icons: Record<string, { el: React.ReactNode; bg: string }> = Object.fromEntries(
  Object.keys(moduleIconMap).map(k => [k, { el: getIcon(k), bg: 'bg-transparent' }])
);

const inputCls = "w-full h-[40px] px-3 text-[14px] text-[#1D2129] bg-[#F7F8FA] border border-[#E5E6EB] rounded-lg outline-none placeholder:text-[#C9CDD4] focus:border-[#1C71D8] focus:bg-white transition-all";
const textareaCls = "w-full px-3 py-2.5 text-[14px] text-[#1D2129] bg-[#F7F8FA] border border-[#E5E6EB] rounded-lg outline-none placeholder:text-[#C9CDD4] focus:border-[#1C71D8] focus:bg-white transition-all resize-none";
const labelCls = "block text-[14px] font-semibold text-[#1D2129] mb-1.5";

type PriceFilter = '全部' | '免费' | '付费';
const priceFilters: PriceFilter[] = ['全部', '免费', '付费'];

export default function ModuleCenter() {
  const navigate = useNavigate();
  const { role, setRole } = useOutletContext<{ role: UserRole; setRole: (r: UserRole) => void }>();

  const [catTab, setCatTab] = useState(0);
  const [priceTab, setPriceTab] = useState<PriceFilter>('全部');
  const [search, setSearch] = useState('');
  const [applyModule, setApplyModule] = useState<Module | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  const cat = moduleCategories[catTab];
  const list = modules.filter((m) => {
    if (cat !== '全部模块' && m.category !== cat) return false;
    if (priceTab === '免费' && m.price) return false;
    if (priceTab === '付费' && !m.price) return false;
    if (search && !m.name.includes(search) && !m.code.includes(search)) return false;
    return true;
  });

  const freeCount = modules.filter(m => !m.price).length;
  const paidCount = modules.filter(m => m.price).length;
  const activeCount = modules.filter(m => m.status === '已开通').length;

  const displayStatus = (m: Module): string => {
    if (applied.has(m.id)) return '审核中';
    if (m.price) {
      if (m.status === '可申请') return '可购买';
      if (m.status === '已开通') return '已购买';
    }
    return m.status;
  };

  const handleApplySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!applyModule) return;
    setApplied((p) => new Set(p).add(applyModule.id));
    setApplyModule(null);
  };

  const handleModuleAction = (m: Module) => {
    if (m.price) {
      navigate(`/purchase/${m.id}`);
    } else {
      setApplyModule(m);
    }
  };

  const ic = applyModule ? (icons[applyModule.icon] || icons.building) : icons.building;

  const stats = [
    { icon: <Box size={22} />, value: modules.length, label: '模块总数', accent: '#2563EB', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.18)', iconBg: 'rgba(59,130,246,0.12)', dot: 'rgba(59,130,246,0.10)' },
    { icon: <Activity size={22} />, value: activeCount, label: '已开通', accent: '#16A34A', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.18)', iconBg: 'rgba(34,197,94,0.12)', dot: 'rgba(34,197,94,0.10)' },
    { icon: <CreditCard size={22} />, value: paidCount, label: '付费模块', accent: '#EA580C', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.18)', iconBg: 'rgba(251,146,60,0.12)', dot: 'rgba(251,146,60,0.10)' },
    { icon: <Sparkles size={22} />, value: freeCount, label: '免费模块', accent: '#7C3AED', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.18)', iconBg: 'rgba(139,92,246,0.12)', dot: 'rgba(139,92,246,0.10)' },
  ];

  return (
    <div className="min-h-screen">
      <Header title="模块中心" subtitle="浏览所有可用模块，申请试用或购买商业版" role={role} onRoleChange={setRole} />

      <div className="p-6 flex flex-col gap-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <div key={i} className="relative rounded-xl px-5 py-5 overflow-hidden backdrop-blur-sm"
              style={{ background: s.bg, border: `1px solid ${s.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="absolute -top-4 -right-4 w-[72px] h-[72px] rounded-full" style={{ background: s.dot }} />
              <div className="absolute bottom-2 right-8 w-[32px] h-[32px] rounded-full" style={{ background: s.dot }} />
              <div className="relative flex items-center gap-4">
                <div className="w-[44px] h-[44px] rounded-xl flex items-center justify-center shrink-0" style={{ background: s.iconBg, color: s.accent }}>{s.icon}</div>
                <div>
                  <p className="text-[26px] font-bold leading-none" style={{ color: s.accent }}>{s.value}</p>
                  <p className="text-[14px] mt-1.5 text-text-muted">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg px-5 py-3 flex items-center justify-between">
          <TabFilter tabs={moduleCategories.map((c) => ({ label: c }))} activeIndex={catTab} onChange={setCatTab} />
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#F2F3F5] rounded-[4px] p-[3px]">
              {priceFilters.map((f) => (
                <button key={f} onClick={() => setPriceTab(f)}
                  className={`h-[28px] px-3.5 rounded-[2px] text-[13px] font-medium transition-all ${
                    priceTab === f ? 'bg-white text-[#1D2129] shadow-sm' : 'text-[#86909C] hover:text-[#4E5969]'
                  }`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="w-[200px]"><SearchBar placeholder="搜索模块..." value={search} onChange={setSearch} /></div>
          </div>
        </div>

        {/* Cards */}
        {list.length === 0 && (
          <div className="bg-white rounded-[--radius-md] py-16 text-center">
            <Box size={48} className="mx-auto mb-4 text-text-placeholder" />
            <p className="text-[16px] text-text-muted mb-2">没有找到匹配的模块</p>
            <p className="text-[14px] text-text-placeholder">试试调整筛选条件或搜索关键词</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {list.map((m) => {
            const s = displayStatus(m);
            const mIc = icons[m.icon] || icons.building;
            const canAction = s === '可申请' || s === '可购买';
            const isPaid = !!m.price;
            return (
              <div key={m.id}
                className={`bg-white rounded-lg flex flex-col transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] ${
                  isPaid ? 'border border-[#FFF3E8]' : 'border border-transparent hover:border-[#E5E6EB]'
                }`}
              >

                <div className="px-5 pt-4 pb-3 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-[48px] h-[48px] rounded-lg ${mIc.bg} flex items-center justify-center shrink-0`}>{mIc.el}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-bold text-[#1D2129] leading-snug">{m.name}</p>
                          {isPaid ? (
                            <span className="px-1.5 py-[2px] text-[11px] font-semibold rounded-[2px] leading-none"
                              style={{ background: 'linear-gradient(135deg, #FFF3E8 0%, #FFE8D4 100%)', color: '#E8601A' }}>
                              商业版
                            </span>
                          ) : (
                            <span className="px-1.5 py-[2px] text-[11px] font-semibold bg-[#E8FFEA] text-[#00994D] rounded-[2px] leading-none">
                              免费
                            </span>
                          )}
                        </div>
                        <p className="text-[14px] text-text-muted mt-[3px]">{m.code}</p>
                      </div>
                    </div>
                    <StatusBadge status={s} />
                  </div>

                  <p className="text-[14px] text-text-secondary leading-[22px] flex-1 line-clamp-2">{m.description}</p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F2F3F5]">
                    <div className="flex items-center gap-4 text-[14px] text-text-muted">
                      <span className="inline-flex items-center gap-1"><Clock size={13} /> {m.duration}天</span>
                      <span className="inline-flex items-center gap-1"><UsersIcon size={13} /> {m.nodes}节点</span>
                    </div>
                    {isPaid && (
                      <span className="text-[16px] font-bold text-[#F77234]">
                        ¥{m.price!.toLocaleString()}<span className="text-[12px] font-normal text-[#C9CDD4]">/年</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-4">
                  {canAction ? (
                    <button
                      onClick={() => handleModuleAction(m)}
                      className="w-full h-[36px] rounded-[--radius-sm] text-[14px] font-semibold text-white flex items-center justify-center gap-1 cursor-pointer transition-all hover:brightness-110"
                      style={{ background: isPaid ? 'linear-gradient(135deg, #F77234 0%, #F99D1C 100%)' : 'linear-gradient(135deg, #1C71D8 0%, #3584E4 100%)' }}
                    >
                      {isPaid ? '立即购买' : '申请试用'} <ChevronRight size={15} strokeWidth={2.5} />
                    </button>
                  ) : (
                    <div className="w-full h-[36px] rounded-[--radius-sm] bg-surface-secondary text-[14px] text-text-muted font-medium flex items-center justify-center">
                      {s === '已开通' || s === '已购买' ? s : '审核中'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trial application modal */}
      <Modal
        open={!!applyModule}
        onClose={() => setApplyModule(null)}
        width={560}
        header={
          applyModule ? (
            <div className="flex items-center gap-3">
              <div className={`w-[40px] h-[40px] rounded-lg ${ic.bg} flex items-center justify-center shrink-0`}>{ic.el}</div>
              <div>
                <h3 className="text-[16px] font-bold text-[#1D2129]">申请试用</h3>
                <p className="text-[14px] text-[#86909C]">{applyModule.name}</p>
              </div>
            </div>
          ) : undefined
        }
      >
        {applyModule && (
          <form onSubmit={handleApplySubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-3 gap-4 bg-[#F7F8FA] rounded p-4">
              <div><p className="text-[14px] text-[#86909C] mb-1">模块编号</p><p className="text-[14px] font-bold text-[#1D2129]">{applyModule.code}</p></div>
              <div><p className="text-[14px] text-[#86909C] mb-1">试用期限</p><p className="text-[14px] font-bold text-[#1D2129]">{applyModule.duration} 天</p></div>
              <div><p className="text-[14px] text-[#86909C] mb-1">节点数量</p><p className="text-[14px] font-bold text-[#1D2129]">{applyModule.nodes}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <div><label className={labelCls}>申请人姓名 <span className="text-[#F53F3F]">*</span></label><input required className={inputCls} placeholder="请输入姓名" /></div>
              <div><label className={labelCls}>所属部门 <span className="text-[#F53F3F]">*</span></label><input required className={inputCls} placeholder="请输入部门" /></div>
              <div><label className={labelCls}>联系电话 <span className="text-[#F53F3F]">*</span></label><input required className={inputCls} placeholder="请输入手机号" /></div>
              <div><label className={labelCls}>电子邮箱 <span className="text-[#F53F3F]">*</span></label><input required type="email" className={inputCls} placeholder="请输入邮箱" /></div>
            </div>
            <div><label className={labelCls}>使用场景 <span className="text-[#F53F3F]">*</span></label><textarea required className={textareaCls} rows={3} placeholder="请描述您的具体使用场景和需求..." /></div>
            <div><label className={labelCls}>申请理由 <span className="text-[#F53F3F]">*</span></label><textarea required className={textareaCls} rows={3} placeholder="请说明申请该模块试用的原因..." /></div>
            <div className="bg-[#FFF7E8] border border-[#FFDCA1] rounded px-4 py-3 text-[14px] text-[#D4770B] leading-[20px]">
              <strong>温馨提示：</strong>提交申请后，我们将在1-2个工作日内完成审核，审核结果将通过邮件和短信通知您。
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button type="button" onClick={() => setApplyModule(null)} className="h-[42px] rounded-[2px] text-[14px] font-medium text-[#4E5969] border border-[#C9CDD4] bg-white hover:border-[#86909C] transition-colors">取消</button>
              <button type="submit" className="h-[42px] rounded-[2px] text-[14px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.99]" style={{ background: '#1C71D8' }}>提交申请</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
