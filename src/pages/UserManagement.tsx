import { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, UserCheck, UserCog, UserX, MoreVertical } from 'lucide-react';
import Header from '../components/layout/Header';
import type { UserRole } from '../components/layout/Layout';
import TabFilter from '../components/common/TabFilter';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import { users, type UserStatus } from '../data/mock';

const filters: (UserStatus | '全部用户')[] = ['全部用户', '使用中', '待审核', '停用'];

export default function UserManagement() {
  const { role, setRole } = useOutletContext<{ role: UserRole; setRole: (r: UserRole) => void }>();
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
      <Header title="用户管理" subtitle="管理用户信息和角色分配" role={role} onRoleChange={setRole} />
      <div className="p-6 flex flex-col gap-5">
        <div className="grid grid-cols-4 gap-5">
          {([
            { icon: <Users size={22} className="text-white" />, value: users.length, label: '总用户数', gradient: 'linear-gradient(135deg, #1C71D8 0%, #3584E4 100%)' },
            { icon: <UserCheck size={22} className="text-white" />, value: cnt('使用中'), label: '使用中', gradient: 'linear-gradient(135deg, #00B42A 0%, #34D058 100%)' },
            { icon: <UserCog size={22} className="text-white" />, value: cnt('待审核'), label: '待审核', gradient: 'linear-gradient(135deg, #F77234 0%, #F99D1C 100%)' },
            { icon: <UserX size={22} className="text-white" />, value: cnt('停用'), label: '已停用', gradient: 'linear-gradient(135deg, #86909C 0%, #A8B2BD 100%)' },
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

        <div className="bg-white rounded-lg px-5 py-3 flex items-center justify-between">
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
                      <button onClick={() => setMenu(menu === u.id ? null : u.id)} className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-[#F2F3F5] transition-colors">
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
