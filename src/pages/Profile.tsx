import {
  Building2, Phone, Server, Clock, Calendar,
  Box, AlertTriangle,
  Mail, User as UserIcon, Wifi, WifiOff, Link2, Shield,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { currentUser, myModuleUsages, type MyModuleUsage } from '../data/mock';
import { moduleIconMap } from '../assets/moduleIcons';

const getModuleIcon = (key: string) => <img src={moduleIconMap[key] || moduleIconMap.building} alt="" className="w-[48px] h-[48px] object-contain" />;

function statusColor(s: MyModuleUsage['status']) {
  if (s === '使用中')  return { bg: 'bg-[#E8FFEA]', text: 'text-[#00B42A]' };
  if (s === '即将到期') return { bg: 'bg-[#FFF7E8]', text: 'text-[#D4770B]' };
  return { bg: 'bg-[#F2F3F5]', text: 'text-[#86909C]' };
}

function progressPercent(m: MyModuleUsage) {
  return Math.min(100, Math.round((m.usedDays / m.totalDays) * 100));
}

function progressColor(m: MyModuleUsage) {
  if (m.status === '已过期') return '#C9CDD4';
  if (m.status === '即将到期') return '#F59E0B';
  return '#1C71D8';
}

export default function Profile() {
  const u = currentUser;
  const activeCount = myModuleUsages.filter(m => m.status === '使用中').length;
  const expiringCount = myModuleUsages.filter(m => m.status === '即将到期').length;
  const expiredCount = myModuleUsages.filter(m => m.status === '已过期').length;

  return (
    <div className="min-h-screen">
      <Header title="个人信息" subtitle="查看您的账户信息与模块使用情况" />

      <div className="p-6 flex flex-col gap-6">
        {/* Profile card */}
        <div className="bg-white rounded-lg overflow-hidden">
          {/* User header area */}
          <div className="px-6 pt-6 pb-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center overflow-hidden shadow-md shrink-0">
                  <UserIcon size={36} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[20px] font-bold text-[#1D2129]">{u.name}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded bg-[#E8F3FF] text-[14px] font-medium text-[#1C71D8]">
                      <Shield size={13} /> {u.role}
                    </span>
                  </div>
                  <p className="text-[14px] text-[#86909C] mt-1.5">ID：{u.userId}</p>
                  <div className="flex items-center gap-[6px] mt-1.5 text-[14px] text-[#86909C]">
                    <Link2 size={14} className="shrink-0" />
                    <span>关联企业：</span>
                    <span className="text-[#1D2129] font-medium">{u.associatedCompany}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info rows — two columns */}
          <div className="divide-y divide-[#F2F3F5]">
            {/* Row 1: Company + Register time */}
            <div className="px-6 py-4 grid grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-[42px] h-[42px] rounded-lg bg-[#E8F3FF] flex items-center justify-center shrink-0">
                  <Building2 size={20} className="text-[#1C71D8]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] text-[#86909C]">所属企业</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[14px] font-semibold text-[#1D2129]">{u.company}</p>
                    {u.companyVerified && (
                      <span className="inline-flex items-center gap-[3px] px-[6px] py-[1px] rounded border border-[#F77234] text-[14px] font-medium text-[#F77234] whitespace-nowrap">
                        <svg viewBox="0 0 14 14" width="13" height="13" fill="none"><path d="M7 1l1.5 2.1L11 2.5l-.2 2.6 2.2 1.4-1.7 2 .8 2.5-2.5.6L9 13.5 7 12l-2 1.5-.6-1.9-2.5-.6.8-2.5L1 6.5l2.2-1.4L3 2.5l2.5.6L7 1z" fill="#F77234"/><path d="M5.5 7l1.2 1.2L9 5.8" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        已认证
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-[42px] h-[42px] rounded-lg bg-[#FFF7E8] flex items-center justify-center shrink-0">
                  <Calendar size={20} className="text-[#F5A623]" />
                </div>
                <div>
                  <p className="text-[14px] text-[#86909C]">注册时间</p>
                  <p className="text-[14px] font-semibold text-[#1D2129] mt-1">{u.registerTime}</p>
                </div>
              </div>
            </div>

            {/* Row 2: Phone + Last login */}
            <div className="px-6 py-4 grid grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-[42px] h-[42px] rounded-lg bg-[#E8FFEA] flex items-center justify-center shrink-0">
                  <Phone size={20} className="text-[#00B42A]" />
                </div>
                <div>
                  <p className="text-[14px] text-[#86909C]">手机号</p>
                  <p className="text-[14px] font-semibold text-[#1D2129] mt-1">{u.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-[42px] h-[42px] rounded-lg bg-[#F0E8FF] flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-[#722ED1]" />
                </div>
                <div>
                  <p className="text-[14px] text-[#86909C]">最后登录</p>
                  <p className="text-[14px] font-semibold text-[#1D2129] mt-1">{u.lastLogin}</p>
                </div>
              </div>
            </div>

            {/* Row 3: Server IP + Email */}
            <div className="px-6 py-4 grid grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-[42px] h-[42px] rounded-lg bg-[#FFECE8] flex items-center justify-center shrink-0">
                  <Server size={20} className="text-[#F53F3F]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] text-[#86909C]">服务器IP</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[14px] font-semibold text-[#1D2129]">{u.serverIp}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-[1px] rounded-full text-[14px] font-medium ${u.serverConnected ? 'bg-[#E8FFEA] text-[#00B42A]' : 'bg-[#FFECE8] text-[#F53F3F]'}`}>
                      {u.serverConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                      {u.serverConnected ? '已连接' : '未连接'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-[42px] h-[42px] rounded-lg bg-[#E8F3FF] flex items-center justify-center shrink-0">
                  <Mail size={20} className="text-[#1C71D8]" />
                </div>
                <div>
                  <p className="text-[14px] text-[#86909C]">邮箱</p>
                  <p className="text-[14px] font-semibold text-[#1D2129] mt-1">{u.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module usage stats */}
        <div className="grid grid-cols-3 gap-5">
          <div className="bg-white rounded-lg px-5 py-4 flex items-center gap-4">
            <div className="w-[44px] h-[44px] rounded-lg bg-[#E8F3FF] flex items-center justify-center">
              <Box size={22} color="#1C71D8" />
            </div>
            <div>
              <p className="text-[24px] font-bold text-[#1D2129] leading-none">{activeCount}</p>
              <p className="text-[14px] text-[#86909C] mt-1">使用中模块</p>
            </div>
          </div>
          <div className="bg-white rounded-lg px-5 py-4 flex items-center gap-4">
            <div className="w-[44px] h-[44px] rounded-lg bg-[#FFF7E8] flex items-center justify-center">
              <AlertTriangle size={22} color="#D4770B" />
            </div>
            <div>
              <p className="text-[24px] font-bold text-[#1D2129] leading-none">{expiringCount}</p>
              <p className="text-[14px] text-[#86909C] mt-1">即将到期</p>
            </div>
          </div>
          <div className="bg-white rounded-lg px-5 py-4 flex items-center gap-4">
            <div className="w-[44px] h-[44px] rounded-lg bg-[#F2F3F5] flex items-center justify-center">
              <Clock size={22} color="#86909C" />
            </div>
            <div>
              <p className="text-[24px] font-bold text-[#1D2129] leading-none">{expiredCount}</p>
              <p className="text-[14px] text-[#86909C] mt-1">已过期</p>
            </div>
          </div>
        </div>

        {/* Module usage list — ring chart cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold text-[#1D2129]">我的模块使用情况</h2>
            <span className="text-[14px] text-[#86909C]">共 {myModuleUsages.length} 个模块</span>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
            {myModuleUsages.map((m) => {
              const sc = statusColor(m.status);
              const pct = progressPercent(m);
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
                      <circle
                        cx="48" cy="48" r={r} fill="none"
                        stroke={ringColor} strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        transform="rotate(-90 48 48)"
                        className="transition-all duration-700"
                      />
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
