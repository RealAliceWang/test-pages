import { useState, type FormEvent } from 'react';
import {
  Clock, Users as UsersIcon, ChevronRight, Activity, Box,
} from 'lucide-react';
import Header from '../components/layout/Header';
import StatCard from '../components/common/StatCard';
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

const inputCls = "w-full h-[40px] px-3 text-[14px] text-[#1D2129] bg-[#F7F8FA] border border-[#E5E6EB] rounded outline-none placeholder:text-[#C9CDD4] focus:border-[#1C71D8] focus:bg-white transition-all";
const textareaCls = "w-full px-3 py-2.5 text-[14px] text-[#1D2129] bg-[#F7F8FA] border border-[#E5E6EB] rounded outline-none placeholder:text-[#C9CDD4] focus:border-[#1C71D8] focus:bg-white transition-all resize-none";
const labelCls = "block text-[14px] font-semibold text-[#1D2129] mb-1.5";

export default function ModuleManagement() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [applyModule, setApplyModule] = useState<Module | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  const freeModules = modules.filter((m) => !m.price);
  const cat = moduleCategories[tab];
  const list = freeModules.filter((m) => {
    if (cat !== '全部模块' && m.category !== cat) return false;
    if (search && !m.name.includes(search) && !m.code.includes(search)) return false;
    return true;
  });

  const cnt = (s: string) => freeModules.filter((m) => m.status === s).length;
  const status = (m: Module) => applied.has(m.id) ? '审核中' as const : m.status;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!applyModule) return;
    setApplied((p) => new Set(p).add(applyModule.id));
    setApplyModule(null);
  };

  const ic = applyModule ? (icons[applyModule.icon] || icons.cube) : icons.cube;

  return (
    <div className="min-h-screen">
      <Header title="免费模块" subtitle="申请和管理您的模块权限" />

      <div className="p-6 flex flex-col gap-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-5">
          <StatCard icon={<Box size={22} color="#1C71D8" />} iconBg="bg-[#E8F3FF]" value={cnt('可申请')} label="可用模块" />
          <StatCard icon={<Activity size={22} color="#00B42A" />} iconBg="bg-[#E8FFEA]" value={cnt('已开通')} label="已开通" />
          <StatCard icon={<Clock size={22} color="#F53F3F" />} iconBg="bg-[#FFECE8]" value={cnt('审核中')} label="审核中" />
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <TabFilter tabs={moduleCategories.map((c) => ({ label: c }))} activeIndex={tab} onChange={setTab} />
          <div className="w-[200px]"><SearchBar placeholder="搜索模块名称或编号..." value={search} onChange={setSearch} /></div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {list.map((m) => {
            const s = status(m);
            const mIc = icons[m.icon] || icons.cube;
            return (
              <div key={m.id} className="bg-white rounded flex flex-col">
                {/* Content area */}
                <div className="px-5 pt-5 pb-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-[48px] h-[48px] rounded-lg ${mIc.bg} flex items-center justify-center shrink-0`}>{mIc.el}</div>
                      <div>
                        <p className="text-[14px] font-bold text-[#1D2129] leading-snug">{m.name}</p>
                        <p className="text-[14px] text-[#4E5969] mt-[2px]">{m.code}</p>
                      </div>
                    </div>
                    <StatusBadge status={s} />
                  </div>
                  <p className="text-[14px] text-[#4E5969] leading-[20px] flex-1 line-clamp-2">{m.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-5 text-[14px] text-[#6B7785]">
                      <span className="inline-flex items-center gap-[4px]"><Clock size={12} /> {m.duration}天</span>
                      <span className="inline-flex items-center gap-[4px]"><UsersIcon size={12} /> {m.nodes}节点</span>
                    </div>
                    {m.price && (
                      <span className="text-[16px] font-bold text-[#F77234]">¥{m.price.toLocaleString()}<span className="text-[14px] font-normal text-[#86909C]">/年</span></span>
                    )}
                  </div>
                </div>
                {/* Button footer */}
                <div className="px-5 pb-5">
                  {s === '可申请' ? (
                    <button
                      onClick={() => setApplyModule(m)}
                      className="w-full h-[36px] rounded text-[14px] font-semibold text-white flex items-center justify-center gap-[2px] transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
                      style={{ background: m.price ? 'linear-gradient(135deg, #F77234 0%, #F99D1C 100%)' : 'linear-gradient(135deg, #1C71D8 0%, #3584E4 100%)' }}
                    >
                      {m.price ? '立即购买' : '立即申请'} <ChevronRight size={15} strokeWidth={2.5} className="text-white/70" />
                    </button>
                  ) : (
                    <div className="w-full h-[36px] rounded bg-[#F7F8FA] text-[14px] text-[#86909C] font-medium flex items-center justify-center">
                      {s === '已开通' ? '已开通' : '审核中'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Application form modal */}
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Module info bar */}
            <div className="grid grid-cols-3 gap-4 bg-[#F7F8FA] rounded p-4">
              <div>
                <p className="text-[14px] text-[#86909C] mb-1">模块编号</p>
                <p className="text-[14px] font-bold text-[#1D2129]">{applyModule.code}</p>
              </div>
              <div>
                <p className="text-[14px] text-[#86909C] mb-1">试用期限</p>
                <p className="text-[14px] font-bold text-[#1D2129]">{applyModule.duration} 天</p>
              </div>
              <div>
                <p className="text-[14px] text-[#86909C] mb-1">节点数量</p>
                <p className="text-[14px] font-bold text-[#1D2129]">{applyModule.nodes}</p>
              </div>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <div>
                <label className={labelCls}>申请人姓名 <span className="text-[#F53F3F]">*</span></label>
                <input required className={inputCls} placeholder="请输入姓名" />
              </div>
              <div>
                <label className={labelCls}>所属部门 <span className="text-[#F53F3F]">*</span></label>
                <input required className={inputCls} placeholder="请输入部门" />
              </div>
              <div>
                <label className={labelCls}>联系电话 <span className="text-[#F53F3F]">*</span></label>
                <input required className={inputCls} placeholder="请输入手机号" />
              </div>
              <div>
                <label className={labelCls}>电子邮箱 <span className="text-[#F53F3F]">*</span></label>
                <input required type="email" className={inputCls} placeholder="请输入邮箱" />
              </div>
            </div>

            <div>
              <label className={labelCls}>预计使用时长 <span className="text-[#F53F3F]">*</span></label>
              <input required className={inputCls} placeholder="例如：3个月、半年等" />
            </div>

            <div>
              <label className={labelCls}>使用场景 <span className="text-[#F53F3F]">*</span></label>
              <textarea required className={textareaCls} rows={3} placeholder="请描述您的具体使用场景和需求..." />
            </div>

            <div>
              <label className={labelCls}>申请理由 <span className="text-[#F53F3F]">*</span></label>
              <textarea required className={textareaCls} rows={3} placeholder="请说明申请该模块试用的原因..." />
            </div>

            {/* Tip */}
            <div className="bg-[#FFF7E8] border border-[#FFDCA1] rounded px-4 py-3 text-[14px] text-[#D4770B] leading-[20px]">
              <strong>温馨提示：</strong>提交申请后，我们将在1-2个工作日内完成审核，审核结果将通过邮件和短信通知您。
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setApplyModule(null)}
                className="h-[42px] rounded text-[14px] font-medium text-[#4E5969] bg-[#F2F3F5] hover:bg-[#E5E6EB] transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="h-[42px] rounded text-[14px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.99]"
                style={{ background: '#1C71D8' }}
              >
                提交申请
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
