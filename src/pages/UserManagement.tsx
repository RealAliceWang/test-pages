import { useState, useRef, useEffect } from 'react';
import { Users, UserCheck, UserCog, UserX, MoreVertical } from 'lucide-react';
import Header from '../components/layout/Header';
import StatCard from '../components/common/StatCard';
import TabFilter from '../components/common/TabFilter';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import { users, type UserStatus } from '../data/mock';

const filters: (UserStatus | '全部用户')[] = ['全部用户', '使用中', '待审核', '停用'];

export default function UserManagement() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [menu, setMenu] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenu(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const sel = filters[tab];
  const list = users.filter((u) => {
    if (sel !== '全部用户' && u.status !== sel) return false;
    if (search && !u.name.includes(search) && !u.email.includes(search) && !u.department.includes(search)) return false;
    return true;
  });

  const cnt = (s: UserStatus) => users.filter((u) => u.status === s).length;

  return (
    <div className="min-h-screen">
      <Header title="用户管理" subtitle="管理用户信息和角色分配" role="系统管理员" userName="管理员" />
      <div className="p-6 flex flex-col gap-5">
        <div className="grid grid-cols-4 gap-5">
          <StatCard icon={<Users size={22} color="#1C71D8" />} iconBg="bg-[#E8F3FF]" value={users.length} label="总用户数" />
          <StatCard icon={<UserCheck size={22} color="#00B42A" />} iconBg="bg-[#E8FFEA]" value={cnt('使用中')} label="使用中" />
          <StatCard icon={<UserCog size={22} color="#D4770B" />} iconBg="bg-[#FFF3E8]" value={cnt('待审核')} label="待审核" />
          <StatCard icon={<UserX size={22} color="#86909C" />} iconBg="bg-[#F2F3F5]" value={cnt('停用')} label="已停用" />
        </div>

        <div className="flex items-center justify-between">
          <TabFilter tabs={filters.map((s) => ({ label: s }))} activeIndex={tab} onChange={setTab} />
          <div className="w-[220px]"><SearchBar placeholder="搜索用户姓名、邮箱或部门..." value={search} onChange={setSearch} /></div>
        </div>

        <div ref={ref} className="bg-white rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E6EB]">
                {['用户信息', '部门', '联系方式', '模块数量', '状态', '注册时间', '关联企业', '操作'].map((h) => (
                  <th key={h} className="text-left text-[14px] font-normal text-[#86909C] px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((u, i) => (
                <tr key={u.id} className="hover:bg-[#F7F8FA] transition-colors" style={{ borderTop: i ? '1px solid #F2F3F5' : 'none' }}>
                  <td className="px-5 py-[14px]">
                    <div className="flex items-center gap-3">
                      <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-white text-[14px] font-normal shrink-0" style={{ background: u.avatarColor }}>
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[14px] font-normal text-[#1D2129]">{u.name}</p>
                        <p className="text-[14px] text-[#4E5969]">{u.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-[14px] text-[14px] text-[#4E5969]">{u.department}</td>
                  <td className="px-5 py-[14px]">
                    <p className="text-[14px] text-[#4E5969]">{u.email}</p>
                    <p className="text-[14px] text-[#4E5969] mt-px">{u.phone}</p>
                  </td>
                  <td className="px-5 py-[14px] text-[14px] text-[#1D2129] text-center">{u.moduleCount}</td>
                  <td className="px-5 py-[14px]"><StatusBadge status={u.status} /></td>
                  <td className="px-5 py-[14px] text-[14px] text-[#86909C] whitespace-nowrap">{u.registerTime}</td>
                  <td className="px-5 py-[14px] text-[14px] text-[#4E5969]">{u.company}</td>
                  <td className="px-5 py-[14px]">
                    <div className="relative">
                      <button onClick={() => setMenu(menu === u.id ? null : u.id)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F2F3F5] transition-colors">
                        <MoreVertical size={14} className="text-[#86909C]" />
                      </button>
                      {menu === u.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-[#E5E6EB] rounded z-20 py-1 min-w-[120px]" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                          <button className="block w-full text-left px-3 py-[7px] text-[14px] text-[#4E5969] hover:bg-[#F2F3F5] transition-colors" onClick={() => setMenu(null)}>查看详情</button>
                          <button className="block w-full text-left px-3 py-[7px] text-[14px] text-[#4E5969] hover:bg-[#F2F3F5] transition-colors" onClick={() => setMenu(null)}>编辑信息</button>
                          <button className="block w-full text-left px-3 py-[7px] text-[14px] text-[#F53F3F] hover:bg-[#FFECE8] transition-colors" onClick={() => setMenu(null)}>停用账户</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
