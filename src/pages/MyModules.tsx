import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Box, AlertTriangle, Clock, ChevronRight, RefreshCw,
} from 'lucide-react';
import Header from '../components/layout/Header';
import type { UserRole } from '../components/layout/Layout';
import TabFilter from '../components/common/TabFilter';
import { myModuleUsages, type MyModuleUsage } from '../data/mock';
import { moduleIconMap } from '../assets/moduleIcons';

const getModuleIcon = (key: string) => <img src={moduleIconMap[key] || moduleIconMap.building} alt="" className="w-[48px] h-[48px] object-contain" />;

function statusStyle(s: MyModuleUsage['status']) {
  if (s === '使用中')  return { bg: 'bg-[#E8FFEA]', text: 'text-[#00B42A]' };
  if (s === '即将到期') return { bg: 'bg-[#FFF7E8]', text: 'text-[#D4770B]' };
  return { bg: 'bg-[#F2F3F5]', text: 'text-[#86909C]' };
}

function progressColor(m: MyModuleUsage) {
  if (m.status === '已过期') return '#C9CDD4';
  if (m.status === '即将到期') return '#F59E0B';
  return '#1C71D8';
}

type StatusFilter = '全部' | '使用中' | '即将到期' | '已过期';
const statusFilters: StatusFilter[] = ['全部', '使用中', '即将到期', '已过期'];

export default function MyModules() {
  const navigate = useNavigate();
  const { role, setRole } = useOutletContext<{ role: UserRole; setRole: (r: UserRole) => void }>();
  const [tab, setTab] = useState(0);

  const sel = statusFilters[tab];
  const list = myModuleUsages.filter((m) => sel === '全部' || m.status === sel);

  const activeCount = myModuleUsages.filter(m => m.status === '使用中').length;
  const expiringCount = myModuleUsages.filter(m => m.status === '即将到期').length;
  const expiredCount = myModuleUsages.filter(m => m.status === '已过期').length;

  const tabs = statusFilters.map((f) => ({
    label: f === '全部' ? '全部模块' : f,
    count: f === '全部' ? myModuleUsages.length : myModuleUsages.filter(m => m.status === f).length,
  }));

  return (
    <div className="min-h-screen">
      <Header title="我的模块" subtitle="管理已开通的模块，查看使用情况与到期时间" role={role} onRoleChange={setRole} />

      <div className="p-6 flex flex-col gap-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-5">
          {([
            { icon: <Box size={22} className="text-white" />, value: activeCount, label: '使用中', gradient: 'linear-gradient(135deg, #1C71D8 0%, #3584E4 100%)' },
            { icon: <AlertTriangle size={22} className="text-white" />, value: expiringCount, label: '即将到期', gradient: 'linear-gradient(135deg, #F5A623 0%, #F7C948 100%)' },
            { icon: <Clock size={22} className="text-white" />, value: expiredCount, label: '已过期', gradient: 'linear-gradient(135deg, #86909C 0%, #A8B2BD 100%)' },
          ]).map((s, i) => (
            <div key={i} className="relative rounded-lg px-5 py-5 overflow-hidden" style={{ background: s.gradient }}>
              <div className="absolute top-2 right-2 w-[56px] h-[56px] rounded-full bg-white/10" />
              <div className="absolute -bottom-3 -right-3 w-[36px] h-[36px] rounded-full bg-white/[0.07]" />
              <div className="relative flex items-center gap-4">
                <div className="w-[44px] h-[44px] rounded-lg bg-white/20 flex items-center justify-center shrink-0">{s.icon}</div>
                <div>
                  <p className="text-[26px] font-bold text-white leading-none">{s.value}</p>
                  <p className="text-[14px] text-white/75 mt-1.5">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="bg-white rounded-lg px-5 py-3 flex items-center justify-between">
          <TabFilter tabs={tabs} activeIndex={tab} onChange={setTab} />
          <button onClick={() => navigate('/modules')}
            className="h-[32px] px-3 text-[14px] font-medium text-[#1C71D8] bg-[#E8F3FF] rounded inline-flex items-center gap-[6px] hover:bg-[#D6E8FF] transition-colors">
            浏览更多模块 <ChevronRight size={14} />
          </button>
        </div>

        {/* Module cards */}
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
          {list.map((m) => {
            const sc = statusStyle(m.status);
            const pct = Math.min(100, Math.round((m.usedDays / m.totalDays) * 100));
            const remainDays = m.totalDays - m.usedDays;
            const ringColor = progressColor(m);
            const r = 40;
            const stroke = 8;
            const circumference = 2 * Math.PI * r;
            const dashOffset = circumference * (1 - pct / 100);

            return (
              <div key={m.moduleId} className="bg-white rounded-lg px-5 py-5 flex items-center gap-5">
                {/* Ring chart */}
                <div className="relative shrink-0" style={{ width: 96, height: 96 }}>
                  <svg width="96" height="96" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r={r} fill="none" stroke="#F2F3F5" strokeWidth={stroke} />
                    <circle cx="48" cy="48" r={r} fill="none" stroke={ringColor} strokeWidth={stroke}
                      strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset}
                      transform="rotate(-90 48 48)" className="transition-all duration-700" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[16px] font-bold text-[#1D2129] leading-none">{pct}%</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-[48px] h-[48px] rounded-lg flex items-center justify-center shrink-0">
                      {getModuleIcon(m.icon)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-[#1D2129] truncate">{m.moduleName}</p>
                      <p className="text-[14px] text-[#86909C]">{m.moduleCode}</p>
                    </div>
                    <span className={`ml-auto inline-block px-2 py-[2px] rounded text-[14px] font-medium shrink-0 ${sc.bg} ${sc.text}`}>
                      {m.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1 text-[14px]">
                    <span className="text-[#86909C]">已用/总天数</span>
                    <span className="text-[#1D2129] font-medium text-right">{m.usedDays} / {m.totalDays} 天</span>
                    <span className="text-[#86909C]">{m.status === '已过期' ? '状态' : '剩余天数'}</span>
                    <span className="font-medium text-right" style={{ color: ringColor }}>
                      {m.status === '已过期' ? '已过期' : `${remainDays} 天`}
                    </span>
                    <span className="text-[#86909C]">到期日期</span>
                    <span className="text-[#1D2129] font-medium text-right">{m.expireDate}</span>
                    <span className="text-[#86909C]">最后使用</span>
                    <span className="text-[#1D2129] font-medium text-right">{m.lastUsed}</span>
                  </div>
                  {/* Renewal button for expiring/expired */}
                  {(m.status === '即将到期' || m.status === '已过期') && (
                    <button onClick={() => navigate('/modules')}
                      className="mt-3 w-full h-[32px] rounded text-[13px] font-semibold text-white flex items-center justify-center gap-1 transition-all hover:brightness-110"
                      style={{ background: m.status === '已过期' ? 'linear-gradient(135deg, #F77234 0%, #F99D1C 100%)' : 'linear-gradient(135deg, #1C71D8 0%, #3584E4 100%)' }}>
                      <RefreshCw size={13} /> {m.status === '已过期' ? '重新购买' : '续费'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {list.length === 0 && (
          <div className="bg-white rounded-lg py-16 text-center">
            <Box size={48} className="mx-auto mb-4 text-[#C9CDD4]" />
            <p className="text-[16px] text-[#86909C] mb-3">暂无{sel === '全部' ? '' : sel}模块</p>
            <button onClick={() => navigate('/modules')}
              className="h-[36px] px-4 rounded text-[14px] font-medium text-[#1C71D8] bg-[#E8F3FF] hover:bg-[#D6E8FF] transition-colors inline-flex items-center gap-1">
              去模块中心看看 <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
