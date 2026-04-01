import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Bell, Mail, CheckCircle, Clock, Save, RotateCcw } from 'lucide-react';
import Header from '../components/layout/Header';
import type { UserRole } from '../components/layout/Layout';
import Toggle from '../components/common/Toggle';
import { defaultNotificationSettings } from '../data/mock';

const iconCfg: Record<string, { el: React.ReactNode; bg: string }> = {
  mail:           { el: <Mail size={18} color="#1C71D8" />,        bg: 'bg-[#E8F3FF]' },
  bell:           { el: <Bell size={18} color="#D4770B" />,        bg: 'bg-[#FFF3E8]' },
  'check-circle': { el: <CheckCircle size={18} color="#00B42A" />, bg: 'bg-[#E8FFEA]' },
  clock:          { el: <Clock size={18} color="#7B61FF" />,       bg: 'bg-[#F0EDFF]' },
};

export default function SystemSettings() {
  const { role, setRole } = useOutletContext<{ role: UserRole; setRole: (r: UserRole) => void }>();
  const [settings, setSettings] = useState(defaultNotificationSettings.map((s) => ({ ...s })));
  const [days, setDays] = useState(7);
  const [saved, setSaved] = useState(false);

  const toggle = (id: string, v: boolean) => { setSettings((p) => p.map((s) => s.id === id ? { ...s, enabled: v } : s)); setSaved(false); };
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const reset = () => { setSettings(defaultNotificationSettings.map((s) => ({ ...s }))); setDays(7); setSaved(false); };

  return (
    <div className="min-h-screen">
      <Header title="通知设置" subtitle="管理系统通知方式和提醒规则" role={role} onRoleChange={setRole} />
      <div className="p-6">
        <div className="max-w-[1000px] mx-auto">
          <div className="bg-white rounded overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#F2F3F5]" style={{ background: 'linear-gradient(90deg, #E8F3FF 0%, #fff 60%)' }}>
              <div className="flex items-center gap-3">
                <div className="w-[40px] h-[40px] rounded-[10px] bg-[#D6EBFF] flex items-center justify-center">
                  <Bell size={20} color="#1C71D8" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-[#1D2129]">通知设置</h2>
                  <p className="text-[14px] text-[#86909C]">配置系统通知方式和规则</p>
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="px-6">
              {settings.map((s, i) => {
                const ic = iconCfg[s.icon] || iconCfg.bell;
                return (
                  <div key={s.id} className="flex items-center justify-between py-[18px]" style={{ borderTop: i ? '1px solid #F2F3F5' : 'none' }}>
                    <div className="flex items-center gap-3">
                      <div className={`w-[36px] h-[36px] rounded ${ic.bg} flex items-center justify-center shrink-0`}>{ic.el}</div>
                      <div>
                        <p className="text-[14px] font-semibold text-[#1D2129]">{s.label}</p>
                        <p className="text-[14px] text-[#86909C]">{s.description}</p>
                      </div>
                    </div>
                    <Toggle enabled={s.enabled} onChange={(v) => toggle(s.id, v)} />
                  </div>
                );
              })}
            </div>

            {/* Days input */}
            <div className="px-6 py-5 border-t border-[#F2F3F5]">
              <label className="block text-[14px] font-semibold text-[#1D2129] mb-2">到期提前提醒天数</label>
              <input
                type="number" value={days} min={1} max={90}
                onChange={(e) => { setDays(Number(e.target.value)); setSaved(false); }}
                className="w-full h-[36px] px-3 text-[14px] border border-[#E5E6EB] rounded-[4px] outline-none focus:border-[#1C71D8] focus:shadow-[0_0_0_2px_rgba(28,113,216,0.1)] transition-all"
              />
            </div>

            {/* Actions */}
            <div className="px-6 py-5 border-t border-[#F2F3F5] flex items-center gap-3">
              <button
                onClick={save}
                className="flex-1 h-[38px] rounded text-[14px] font-semibold text-white inline-flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #1C71D8 0%, #3584E4 100%)' }}
              >
                <Save size={15} /> {saved ? '已保存' : '保存设置'}
              </button>
              <button onClick={reset} className="h-[38px] px-5 rounded text-[14px] font-medium text-[#4E5969] bg-[#F2F3F5] inline-flex items-center gap-2 hover:bg-[#E5E6EB] transition-colors">
                <RotateCcw size={15} /> 重置
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
