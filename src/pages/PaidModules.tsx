import { useState, type FormEvent } from 'react';
import {
  Clock, Users as UsersIcon, ChevronRight, Activity, Box, CreditCard,
} from 'lucide-react';
import Header from '../components/layout/Header';
import StatCard from '../components/common/StatCard';
import TabFilter from '../components/common/TabFilter';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import { modules, paidModuleCategories, type Module } from '../data/mock';
import { moduleIconMap } from '../assets/moduleIcons';

const getIcon = (key: string) => <img src={moduleIconMap[key] || moduleIconMap.building} alt="" className="w-[48px] h-[48px] object-contain" />;
const icons: Record<string, { el: React.ReactNode; bg: string }> = Object.fromEntries(
  Object.keys(moduleIconMap).map(k => [k, { el: getIcon(k), bg: 'bg-transparent' }])
);

const inputCls = "w-full h-[40px] px-3 text-[14px] text-[#1D2129] bg-[#F7F8FA] border border-[#E5E6EB] rounded outline-none placeholder:text-[#C9CDD4] focus:border-[#1C71D8] focus:bg-white transition-all";
const textareaCls = "w-full px-3 py-2.5 text-[14px] text-[#1D2129] bg-[#F7F8FA] border border-[#E5E6EB] rounded outline-none placeholder:text-[#C9CDD4] focus:border-[#1C71D8] focus:bg-white transition-all resize-none";
const labelCls = "block text-[14px] font-semibold text-[#1D2129] mb-1.5";

export default function PaidModules() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [buyModule, setBuyModule] = useState<Module | null>(null);
  const [purchased, setPurchased] = useState<Set<string>>(new Set());

  const paidModules = modules.filter((m) => m.price);
  const cat = paidModuleCategories[tab];
  const list = paidModules.filter((m) => {
    if (cat !== '全部模块' && m.category !== cat) return false;
    if (search && !m.name.includes(search) && !m.code.includes(search)) return false;
    return true;
  });

  const cntRaw = (s: string) => paidModules.filter((m) => m.status === s).length;
  const paidStatus = (m: Module): string => {
    if (purchased.has(m.id)) return '已购买';
    if (m.status === '可申请') return '可购买';
    if (m.status === '已开通') return '已购买';
    return m.status;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!buyModule) return;
    setPurchased((p) => new Set(p).add(buyModule.id));
    setBuyModule(null);
  };

  const ic = buyModule ? (icons[buyModule.icon] || icons.building) : icons.building;

  return (
    <div className="min-h-screen">
      <Header title="付费模块" subtitle="购买高级模块，解锁更多专业功能" />

      <div className="p-6 flex flex-col gap-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-5">
          <StatCard icon={<CreditCard size={22} color="#F77234" />} iconBg="bg-[#FFF3E8]" value={paidModules.length} label="付费模块总数" />
          <StatCard icon={<Activity size={22} color="#00B42A" />} iconBg="bg-[#E8FFEA]" value={cntRaw('已开通')} label="已购买" />
          <StatCard icon={<Box size={22} color="#1C71D8" />} iconBg="bg-[#E8F3FF]" value={cntRaw('可申请')} label="可购买" />
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <TabFilter tabs={paidModuleCategories.map((c) => ({ label: c }))} activeIndex={tab} onChange={setTab} />
          <div className="w-[200px]"><SearchBar placeholder="搜索付费模块..." value={search} onChange={setSearch} /></div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {list.map((m) => {
            const s = paidStatus(m);
            const mIc = icons[m.icon] || icons.building;
            return (
              <div key={m.id} className="bg-white rounded flex flex-col">
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
                  <p className="text-[14px] text-[#4E5969] leading-[20px] flex-1">{m.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-5 text-[14px] text-[#6B7785]">
                      <span className="inline-flex items-center gap-[4px]"><Clock size={12} /> {m.duration}天</span>
                      <span className="inline-flex items-center gap-[4px]"><UsersIcon size={12} /> {m.nodes}节点</span>
                    </div>
                    <span className="text-[16px] font-bold text-[#F77234]">¥{m.price!.toLocaleString()}<span className="text-[14px] font-normal text-[#86909C]">/年</span></span>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  {s === '可购买' ? (
                    <button
                      onClick={() => setBuyModule(m)}
                      className="w-full h-[36px] rounded text-[14px] font-semibold text-white flex items-center justify-center gap-[2px] transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
                      style={{ background: 'linear-gradient(135deg, #F77234 0%, #F99D1C 100%)' }}
                    >
                      立即购买 <ChevronRight size={15} strokeWidth={2.5} className="text-white/70" />
                    </button>
                  ) : (
                    <div className="w-full h-[36px] rounded bg-[#F7F8FA] text-[14px] text-[#86909C] font-medium flex items-center justify-center">
                      {s === '已购买' ? '已购买' : '审核中'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Purchase modal */}
      <Modal
        open={!!buyModule}
        onClose={() => setBuyModule(null)}
        width={560}
        header={
          buyModule ? (
            <div className="flex items-center gap-3">
              <div className={`w-[40px] h-[40px] rounded-lg ${ic.bg} flex items-center justify-center shrink-0`}>{ic.el}</div>
              <div>
                <h3 className="text-[16px] font-bold text-[#1D2129]">购买模块</h3>
                <p className="text-[14px] text-[#86909C]">{buyModule.name}（商业版）</p>
              </div>
            </div>
          ) : undefined
        }
      >
        {buyModule && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-3 gap-4 bg-[#F7F8FA] rounded p-4">
              <div>
                <p className="text-[14px] text-[#86909C] mb-1">模块编号</p>
                <p className="text-[14px] font-bold text-[#1D2129]">{buyModule.code}</p>
              </div>
              <div>
                <p className="text-[14px] text-[#86909C] mb-1">授权期限</p>
                <p className="text-[14px] font-bold text-[#1D2129]">{buyModule.duration} 天</p>
              </div>
              <div>
                <p className="text-[14px] text-[#86909C] mb-1">费用</p>
                <p className="text-[16px] font-bold text-[#F77234]">¥{buyModule.price!.toLocaleString()}/年</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <div>
                <label className={labelCls}>购买人姓名 <span className="text-[#F53F3F]">*</span></label>
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
              <label className={labelCls}>购买理由 <span className="text-[#F53F3F]">*</span></label>
              <textarea required className={textareaCls} rows={3} placeholder="请说明购买该模块的业务需求..." />
            </div>

            <div className="bg-[#FFF7E8] border border-[#FFDCA1] rounded px-4 py-3 text-[14px] text-[#D4770B] leading-[20px]">
              <strong>付费说明：</strong>提交购买申请后，我们将在1个工作日内联系您确认订单，付款完成后即时开通模块权限。
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setBuyModule(null)}
                className="h-[42px] rounded text-[14px] font-medium text-[#4E5969] bg-[#F2F3F5] hover:bg-[#E5E6EB] transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="h-[42px] rounded text-[14px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.99]"
                style={{ background: 'linear-gradient(135deg, #F77234 0%, #F99D1C 100%)' }}
              >
                提交购买申请
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
