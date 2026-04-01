import { useState } from 'react';
import { FileText, FileCheck, FileClock, FileX, Eye, Download, Calendar } from 'lucide-react';
import Header from '../components/layout/Header';
import TabFilter from '../components/common/TabFilter';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { applicationRecords, type ApplicationRecord, type ApplicationStatus } from '../data/mock';

const filters: (ApplicationStatus | '全部')[] = ['全部', '待审核', '审核中', '已通过', '已拒绝'];

export default function ApplicationRecords() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<ApplicationRecord | null>(null);

  const sel = filters[tab];
  const list = applicationRecords.filter((r) => {
    if (sel !== '全部' && r.status !== sel) return false;
    if (search && !r.code.toLowerCase().includes(search.toLowerCase()) && !r.moduleName.includes(search) && !r.applicant.includes(search)) return false;
    return true;
  });

  const cnt = (s: ApplicationStatus) => applicationRecords.filter((r) => r.status === s).length;
  const tabs = filters.map((s) => ({ label: s === '全部' ? '全部状态' : s, count: s === '全部' ? applicationRecords.length : cnt(s as ApplicationStatus) }));

  return (
    <div className="min-h-screen">
      <Header title="申请记录" subtitle="查看和管理所有模块申请记录" />
      <div className="p-6 flex flex-col gap-5">
        <div className="grid grid-cols-4 gap-5">
          {([
            { icon: <FileClock size={24} className="text-white" />, value: cnt('待审核'), label: '待审核', gradient: 'linear-gradient(135deg, #F5A623 0%, #F7C948 100%)', pattern: 'radial-gradient(circle at 90% 10%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 10% 90%, rgba(255,255,255,0.1) 0%, transparent 40%)' },
            { icon: <FileText size={24} className="text-white" />, value: cnt('审核中'), label: '审核中', gradient: 'linear-gradient(135deg, #1C71D8 0%, #3584E4 100%)', pattern: 'radial-gradient(circle at 85% 15%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 15% 85%, rgba(255,255,255,0.1) 0%, transparent 40%)' },
            { icon: <FileCheck size={24} className="text-white" />, value: cnt('已通过'), label: '已通过', gradient: 'linear-gradient(135deg, #00B42A 0%, #34D058 100%)', pattern: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 40%)' },
            { icon: <FileX size={24} className="text-white" />, value: cnt('已拒绝'), label: '已拒绝', gradient: 'linear-gradient(135deg, #F53F3F 0%, #FF6B6B 100%)', pattern: 'radial-gradient(circle at 75% 25%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 25% 75%, rgba(255,255,255,0.1) 0%, transparent 40%)' },
          ] as const).map((c, i) => (
            <div key={i} className="relative rounded-lg px-5 py-5 overflow-hidden" style={{ background: c.gradient }}>
              <div className="absolute inset-0" style={{ backgroundImage: c.pattern }} />
              <div className="absolute top-3 right-3 w-[60px] h-[60px] rounded-full bg-white/10" />
              <div className="absolute -bottom-2 -right-2 w-[40px] h-[40px] rounded-full bg-white/[0.07]" />
              <div className="relative flex items-center gap-4">
                <div className="w-[48px] h-[48px] rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  {c.icon}
                </div>
                <div>
                  <p className="text-[28px] font-bold text-white leading-none">{c.value}</p>
                  <p className="text-[14px] text-white/80 mt-1.5">{c.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <TabFilter tabs={tabs} activeIndex={tab} onChange={setTab} />
          <div className="flex items-center gap-3">
            <div className="w-[180px]"><SearchBar placeholder="搜索申请记录..." value={search} onChange={setSearch} /></div>
            <button className="h-[32px] px-3 text-[14px] font-medium text-[#4E5969] bg-[#F2F3F5] rounded inline-flex items-center gap-[6px] hover:bg-[#E5E6EB] transition-colors">
              <Download size={13} /> 导出
            </button>
          </div>
        </div>

        <div className="bg-white rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E6EB]">
                {['申请编号', '模块信息', '申请人', '申请时间', '状态', '操作'].map((h) => (
                  <th key={h} className="text-left text-[14px] font-medium text-[#86909C] px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => (
                <tr key={r.id} className="hover:bg-[#F7F8FA] transition-colors" style={{ borderTop: i ? '1px solid #F2F3F5' : 'none' }}>
                  <td className="px-5 py-[14px] text-[14px] font-semibold text-[#1D2129]">{r.code}</td>
                  <td className="px-5 py-[14px]">
                    <p className="text-[14px] font-semibold text-[#1D2129]">{r.moduleName}</p>
                    <p className="text-[14px] text-[#4E5969] mt-px">{r.moduleCode}</p>
                  </td>
                  <td className="px-5 py-[14px]">
                    <p className="text-[14px] text-[#1D2129]">{r.applicant}</p>
                    <p className="text-[14px] text-[#4E5969] mt-px">{r.department}</p>
                  </td>
                  <td className="px-5 py-[14px] text-[14px] text-[#86909C] whitespace-nowrap">
                    <span className="inline-flex items-center gap-[5px]"><Calendar size={12} className="text-[#C9CDD4]" />{r.applyTime}</span>
                  </td>
                  <td className="px-5 py-[14px]"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-[14px]">
                    <button onClick={() => setDetail(r)} className="inline-flex items-center gap-1 text-[14px] text-[#86909C] hover:text-[#1C71D8] transition-colors">
                      <Eye size={14} /> 查看
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="申请详情">
        {detail && (
          <div className="flex flex-col gap-4 text-[14px]">
            <div className="grid grid-cols-2 gap-x-5 gap-y-3">
              {([['申请编号', detail.code], ['状态', <StatusBadge key="s" status={detail.status} />], ['模块名称', detail.moduleName], ['模块编号', detail.moduleCode], ['申请人', detail.applicant], ['部门', detail.department]] as [string, React.ReactNode][]).map(([l, v], i) => (
                <div key={i}><p className="text-[#C9CDD4] text-[14px] mb-1">{l}</p><div className="text-[#1D2129] font-medium">{v}</div></div>
              ))}
              <div className="col-span-2"><p className="text-[#C9CDD4] text-[14px] mb-1">申请时间</p><p className="text-[#1D2129] font-medium">{detail.applyTime}</p></div>
            </div>
            <div className="flex justify-end pt-1">
              <button onClick={() => setDetail(null)} className="h-[34px] px-4 text-[14px] font-medium text-white bg-[#1C71D8] rounded hover:bg-[#155BAB] transition-colors">关闭</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
