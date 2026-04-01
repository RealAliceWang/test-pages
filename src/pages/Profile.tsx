import { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Building2, Phone, Server, Clock, Calendar,
  Box, AlertTriangle, ChevronRight, Pencil, Check, X,
  Mail, Wifi, WifiOff, Link2, Briefcase, Save,
} from 'lucide-react';
import Header from '../components/layout/Header';
import type { UserRole } from '../components/layout/Layout';
import { currentUser, myModuleUsages } from '../data/mock';

const inputCls = "h-[32px] px-2.5 text-[14px] text-[#1D2129] bg-[#F7F8FA] border border-[#E5E6EB] rounded outline-none placeholder:text-[#C9CDD4] focus:border-[#1C71D8] focus:bg-white transition-all";

interface EditableFieldProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  editing: boolean;
  editValue: string;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onChange: (v: string) => void;
  type?: string;
}

function EditableField({ label, value, icon, iconBg, editing, editValue, onEdit, onCancel, onSave, onChange, type = 'text' }: EditableFieldProps) {
  return (
    <div className="flex items-center gap-4 group">
      <div className={`w-[42px] h-[42px] rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] text-[#86909C]">{label}</p>
        {editing ? (
          <div className="flex items-center gap-2 mt-1">
            <input type={type} value={editValue} onChange={(e) => onChange(e.target.value)} className={`${inputCls} flex-1`} autoFocus />
            <button onClick={onSave} className="w-[28px] h-[28px] rounded bg-[#1C71D8] flex items-center justify-center hover:bg-[#155BAB] transition-colors">
              <Check size={14} className="text-white" />
            </button>
            <button onClick={onCancel} className="w-[28px] h-[28px] rounded bg-[#F2F3F5] flex items-center justify-center hover:bg-[#E5E6EB] transition-colors">
              <X size={14} className="text-[#86909C]" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[14px] text-[#1D2129]">{value}</p>
            <button onClick={onEdit} className="w-[24px] h-[24px] rounded flex items-center justify-center hover:bg-[#E8F3FF] transition-all" title="编辑">
              <Pencil size={12} className="text-[#1C71D8]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface ReadonlyFieldProps {
  label: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  iconBg: string;
}

function ReadonlyField({ label, children, icon, iconBg }: ReadonlyFieldProps) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-[42px] h-[42px] rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[14px] text-[#86909C]">{label}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { role, setRole } = useOutletContext<{ role: UserRole; setRole: (r: UserRole) => void }>();
  const u = currentUser;
  const activeCount = myModuleUsages.filter(m => m.status === '使用中').length;
  const expiringCount = myModuleUsages.filter(m => m.status === '即将到期').length;
  const expiredCount = myModuleUsages.filter(m => m.status === '已过期').length;

  // Editable fields state
  const [name, setName] = useState(u.name);
  const [phone, setPhone] = useState(u.phone);
  const [email, setEmail] = useState(u.email);

  const [editingField, setEditingField] = useState<'name' | 'phone' | 'email' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saved, setSaved] = useState(false);

  const startEdit = (field: 'name' | 'phone' | 'email') => {
    setEditingField(field);
    setEditValue(field === 'name' ? name : field === 'phone' ? phone : email);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveEdit = () => {
    if (!editValue.trim()) return;
    if (editingField === 'name') setName(editValue);
    if (editingField === 'phone') setPhone(editValue);
    if (editingField === 'email') setEmail(editValue);
    setEditingField(null);
    setEditValue('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <Header title="个人信息" subtitle="查看您的账户信息与模块使用情况" role={role} onRoleChange={setRole} />

      <div className="p-6 flex flex-col gap-6">
        {/* Profile card */}
        <div className="bg-white rounded-lg overflow-hidden">
          {/* User header area */}
          <div className="px-6 pt-6 pb-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className="w-[72px] h-[72px] rounded-full overflow-hidden shadow-md shrink-0">
                  <img src="./avatar.jpg" alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    {editingField === 'name' ? (
                      <div className="flex items-center gap-2">
                        <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-[34px] px-3 text-[20px] font-bold text-[#1D2129] bg-[#F7F8FA] border border-[#1C71D8] rounded outline-none w-[160px]" autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                        />
                        <button onClick={saveEdit} className="w-[28px] h-[28px] rounded bg-[#1C71D8] flex items-center justify-center hover:bg-[#155BAB] transition-colors">
                          <Check size={14} className="text-white" />
                        </button>
                        <button onClick={cancelEdit} className="w-[28px] h-[28px] rounded bg-[#F2F3F5] flex items-center justify-center hover:bg-[#E5E6EB] transition-colors">
                          <X size={14} className="text-[#86909C]" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <span className="text-[20px] font-bold text-[#1D2129]">{name}</span>
                        <button onClick={() => startEdit('name')} className="w-[24px] h-[24px] rounded flex items-center justify-center hover:bg-[#E8F3FF] transition-all" title="编辑姓名">
                          <Pencil size={13} className="text-[#1C71D8]" />
                        </button>
                      </div>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded bg-[#E8F3FF] text-[14px] font-medium text-[#1C71D8]">
                      <Briefcase size={13} /> {u.role}
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

              {/* Save indicator */}
              {saved && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8FFEA] text-[#00B42A] text-[13px] font-medium animate-pulse">
                  <Save size={14} /> 已保存
                </div>
              )}
            </div>
          </div>

          {/* Info rows */}
          <div className="divide-y divide-[#F2F3F5]">
            {/* Row 1: Company (readonly) + Register time (readonly) */}
            <div className="px-6 py-4 grid grid-cols-2 gap-6">
              <ReadonlyField label="所属企业" icon={<Building2 size={20} className="text-[#1C71D8]" />} iconBg="bg-[#E8F3FF]">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] text-[#1D2129]">{u.company}</p>
                  {u.companyVerified && (
                    <span className="inline-flex items-center gap-[3px] px-[6px] py-[1px] rounded border border-[#F77234] text-[14px] font-medium text-[#F77234] whitespace-nowrap">
                      <svg viewBox="0 0 14 14" width="13" height="13" fill="none"><path d="M7 1l1.5 2.1L11 2.5l-.2 2.6 2.2 1.4-1.7 2 .8 2.5-2.5.6L9 13.5 7 12l-2 1.5-.6-1.9-2.5-.6.8-2.5L1 6.5l2.2-1.4L3 2.5l2.5.6L7 1z" fill="#F77234"/><path d="M5.5 7l1.2 1.2L9 5.8" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      已认证
                    </span>
                  )}
                </div>
              </ReadonlyField>
              <ReadonlyField label="注册时间" icon={<Calendar size={20} className="text-[#F5A623]" />} iconBg="bg-[#FFF7E8]">
                <p className="text-[14px] text-[#1D2129]">{u.registerTime}</p>
              </ReadonlyField>
            </div>

            {/* Row 2: Phone (editable) + Last login (readonly) */}
            <div className="px-6 py-4 grid grid-cols-2 gap-6">
              <EditableField
                label="手机号" value={phone} type="tel"
                icon={<Phone size={20} className="text-[#00B42A]" />} iconBg="bg-[#E8FFEA]"
                editing={editingField === 'phone'} editValue={editValue}
                onEdit={() => startEdit('phone')} onCancel={cancelEdit} onSave={saveEdit} onChange={setEditValue}
              />
              <ReadonlyField label="最后登录" icon={<Clock size={20} className="text-[#722ED1]" />} iconBg="bg-[#F0E8FF]">
                <p className="text-[14px] text-[#1D2129]">{u.lastLogin}</p>
              </ReadonlyField>
            </div>

            {/* Row 3: Server IP (readonly) + Email (editable) */}
            <div className="px-6 py-4 grid grid-cols-2 gap-6">
              <ReadonlyField label="服务器IP" icon={<Server size={20} className="text-[#F53F3F]" />} iconBg="bg-[#FFECE8]">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] text-[#1D2129]">{u.serverIp}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-[1px] rounded-full text-[14px] font-medium ${u.serverConnected ? 'bg-[#E8FFEA] text-[#00B42A]' : 'bg-[#FFECE8] text-[#F53F3F]'}`}>
                    {u.serverConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                    {u.serverConnected ? '已连接' : '未连接'}
                  </span>
                </div>
              </ReadonlyField>
              <EditableField
                label="邮箱" value={email} type="email"
                icon={<Mail size={20} className="text-[#1C71D8]" />} iconBg="bg-[#E8F3FF]"
                editing={editingField === 'email'} editValue={editValue}
                onEdit={() => startEdit('email')} onCancel={cancelEdit} onSave={saveEdit} onChange={setEditValue}
              />
            </div>
          </div>
        </div>

        {/* Module usage summary */}
        <div className="bg-white rounded-lg px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold text-[#1D2129]">模块概览</h2>
            <Link to="/my-modules" className="text-[14px] text-[#1C71D8] hover:underline inline-flex items-center gap-1">
              查看全部 <ChevronRight size={14} />
            </Link>
          </div>
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
        </div>
      </div>
    </div>
  );
}
