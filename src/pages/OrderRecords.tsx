import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, FileCheck, FileClock, FileX, Eye, Download, Calendar, ShoppingCart, CreditCard } from 'lucide-react';
import Header from '../components/layout/Header';
import type { UserRole } from '../components/layout/Layout';
import TabFilter from '../components/common/TabFilter';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { applicationRecords, purchaseOrders, currentUser, type ApplicationRecord, type ApplicationStatus, type PurchaseOrder, type PurchaseOrderStatus } from '../data/mock';

type RecordType = 'trial' | 'purchase';

export default function OrderRecords() {
  const { role, setRole } = useOutletContext<{ role: UserRole; setRole: (r: UserRole) => void }>();
  const [recordType, setRecordType] = useState<RecordType>('trial');
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<ApplicationRecord | null>(null);
  const [purchaseDetail, setPurchaseDetail] = useState<PurchaseOrder | null>(null);

  // Filter by role: user sees only own records, admin sees all
  const myTrialRecords = role === 'admin' ? applicationRecords : applicationRecords.filter(r => r.applicant === currentUser.name);
  const myPurchaseOrders = role === 'admin' ? purchaseOrders : purchaseOrders.filter(r => r.buyer === currentUser.name);

  // Trial application filters
  const trialFilters: (ApplicationStatus | '全部')[] = ['全部', '待审核', '审核中', '已通过', '已拒绝'];
  const trialSel = trialFilters[tab];
  const trialList = myTrialRecords.filter((r) => {
    if (trialSel !== '全部' && r.status !== trialSel) return false;
    if (search && !r.code.toLowerCase().includes(search.toLowerCase()) && !r.moduleName.includes(search) && !r.applicant.includes(search)) return false;
    return true;
  });
  const trialCnt = (s: ApplicationStatus) => myTrialRecords.filter((r) => r.status === s).length;

  // Purchase order filters
  const purchaseFilters: (PurchaseOrderStatus | '全部')[] = ['全部', '待支付', '已支付', '已完成', '已取消'];
  const purchaseSel = purchaseFilters[tab];
  const purchaseList = myPurchaseOrders.filter((r) => {
    if (purchaseSel !== '全部' && r.status !== purchaseSel) return false;
    if (search && !r.orderNo.toLowerCase().includes(search.toLowerCase()) && !r.moduleName.includes(search)) return false;
    return true;
  });
  const purchaseCnt = (s: PurchaseOrderStatus) => myPurchaseOrders.filter((r) => r.status === s).length;

  const handleTypeSwitch = (type: RecordType) => {
    setRecordType(type);
    setTab(0);
    setSearch('');
  };

  return (
    <div className="min-h-screen">
      <Header title="订单记录" subtitle="查看试用申请和购买订单的全部记录" role={role} onRoleChange={setRole} />
      <div className="p-6 flex flex-col gap-5">
        {/* Type switch */}
        <div className="flex items-center gap-3">
          <button onClick={() => handleTypeSwitch('trial')}
            className={`h-[40px] px-5 rounded-lg text-[14px] font-medium inline-flex items-center gap-2 transition-all ${
              recordType === 'trial' ? 'bg-[#1C71D8] text-white' : 'bg-white text-[#4E5969] border border-[#E5E6EB] hover:border-[#C9CDD4]'
            }`}>
            <FileText size={16} /> 试用申请
            <span className={`px-1.5 py-[1px] rounded text-[12px] font-semibold ${recordType === 'trial' ? 'bg-white/20 text-white' : 'bg-[#F2F3F5] text-[#86909C]'}`}>
              {myTrialRecords.length}
            </span>
          </button>
          <button onClick={() => handleTypeSwitch('purchase')}
            className={`h-[40px] px-5 rounded-lg text-[14px] font-medium inline-flex items-center gap-2 transition-all ${
              recordType === 'purchase' ? 'bg-[#F77234] text-white' : 'bg-white text-[#4E5969] border border-[#E5E6EB] hover:border-[#C9CDD4]'
            }`}>
            <ShoppingCart size={16} /> 购买订单
            <span className={`px-1.5 py-[1px] rounded text-[12px] font-semibold ${recordType === 'purchase' ? 'bg-white/20 text-white' : 'bg-[#F2F3F5] text-[#86909C]'}`}>
              {myPurchaseOrders.length}
            </span>
          </button>
        </div>

        {/* Stats */}
        {recordType === 'trial' ? (
          <div className="grid grid-cols-4 gap-5">
            {([
              { icon: <FileClock size={24} className="text-white" />, value: trialCnt('待审核'), label: '待审核', gradient: 'linear-gradient(135deg, #F5A623 0%, #F7C948 100%)' },
              { icon: <FileText size={24} className="text-white" />, value: trialCnt('审核中'), label: '审核中', gradient: 'linear-gradient(135deg, #1C71D8 0%, #3584E4 100%)' },
              { icon: <FileCheck size={24} className="text-white" />, value: trialCnt('已通过'), label: '已通过', gradient: 'linear-gradient(135deg, #00B42A 0%, #34D058 100%)' },
              { icon: <FileX size={24} className="text-white" />, value: trialCnt('已拒绝'), label: '已拒绝', gradient: 'linear-gradient(135deg, #F53F3F 0%, #FF6B6B 100%)' },
            ]).map((c, i) => (
              <div key={i} className="relative rounded-lg px-5 py-5 overflow-hidden" style={{ background: c.gradient }}>
                <div className="absolute top-3 right-3 w-[60px] h-[60px] rounded-full bg-white/10" />
                <div className="relative flex items-center gap-4">
                  <div className="w-[48px] h-[48px] rounded-lg bg-white/20 flex items-center justify-center shrink-0">{c.icon}</div>
                  <div><p className="text-[28px] font-bold text-white leading-none">{c.value}</p><p className="text-[14px] text-white/80 mt-1.5">{c.label}</p></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-5">
            {([
              { icon: <CreditCard size={24} className="text-white" />, value: purchaseCnt('待支付'), label: '待支付', gradient: 'linear-gradient(135deg, #F5A623 0%, #F7C948 100%)' },
              { icon: <FileText size={24} className="text-white" />, value: purchaseCnt('已支付'), label: '已支付', gradient: 'linear-gradient(135deg, #1C71D8 0%, #3584E4 100%)' },
              { icon: <FileCheck size={24} className="text-white" />, value: purchaseCnt('已完成'), label: '已完成', gradient: 'linear-gradient(135deg, #00B42A 0%, #34D058 100%)' },
              { icon: <FileX size={24} className="text-white" />, value: purchaseCnt('已取消'), label: '已取消', gradient: 'linear-gradient(135deg, #F53F3F 0%, #FF6B6B 100%)' },
            ]).map((c, i) => (
              <div key={i} className="relative rounded-lg px-5 py-5 overflow-hidden" style={{ background: c.gradient }}>
                <div className="absolute top-3 right-3 w-[60px] h-[60px] rounded-full bg-white/10" />
                <div className="relative flex items-center gap-4">
                  <div className="w-[48px] h-[48px] rounded-lg bg-white/20 flex items-center justify-center shrink-0">{c.icon}</div>
                  <div><p className="text-[28px] font-bold text-white leading-none">{c.value}</p><p className="text-[14px] text-white/80 mt-1.5">{c.label}</p></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters + search */}
        <div className="bg-white rounded-lg px-5 py-3 flex items-center justify-between">
          {recordType === 'trial' ? (
            <TabFilter tabs={trialFilters.map((s) => ({ label: s === '全部' ? '全部状态' : s, count: s === '全部' ? myTrialRecords.length : trialCnt(s as ApplicationStatus) }))} activeIndex={tab} onChange={setTab} />
          ) : (
            <TabFilter tabs={purchaseFilters.map((s) => ({ label: s === '全部' ? '全部状态' : s, count: s === '全部' ? myPurchaseOrders.length : purchaseCnt(s as PurchaseOrderStatus) }))} activeIndex={tab} onChange={setTab} />
          )}
          <div className="flex items-center gap-3">
            <div className="w-[180px]"><SearchBar placeholder="搜索记录..." value={search} onChange={setSearch} /></div>
            <button className="h-[32px] px-3 text-[14px] font-medium text-[#4E5969] bg-[#F2F3F5] rounded inline-flex items-center gap-[6px] hover:bg-[#E5E6EB] transition-colors">
              <Download size={13} /> 导出
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded overflow-hidden">
          {recordType === 'trial' ? (
            <table className="w-full">
              <thead><tr className="border-b border-[#E5E6EB]">
                {['申请编号', '模块信息', '申请人', '申请时间', '状态', '操作'].map((h) => (
                  <th key={h} className="text-left text-[14px] font-medium text-[#86909C] px-5 py-3">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {trialList.map((r, i) => (
                  <tr key={r.id} className="hover:bg-[#F7F8FA] transition-colors" style={{ borderTop: i ? '1px solid #F2F3F5' : 'none' }}>
                    <td className="px-5 py-[14px] text-[14px] font-semibold text-[#1D2129]">{r.code}</td>
                    <td className="px-5 py-[14px]"><p className="text-[14px] font-semibold text-[#1D2129]">{r.moduleName}</p><p className="text-[14px] text-[#4E5969] mt-px">{r.moduleCode}</p></td>
                    <td className="px-5 py-[14px]"><p className="text-[14px] text-[#1D2129]">{r.applicant}</p><p className="text-[14px] text-[#4E5969] mt-px">{r.department}</p></td>
                    <td className="px-5 py-[14px] text-[14px] text-[#86909C] whitespace-nowrap"><span className="inline-flex items-center gap-[5px]"><Calendar size={12} className="text-[#C9CDD4]" />{r.applyTime}</span></td>
                    <td className="px-5 py-[14px]"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-[14px]"><button onClick={() => setDetail(r)} className="inline-flex items-center gap-1 text-[14px] text-[#86909C] hover:text-[#1C71D8] transition-colors"><Eye size={14} /> 查看</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead><tr className="border-b border-[#E5E6EB]">
                {['订单编号', '模块信息', '金额', '支付方式', '下单时间', '状态', '操作'].map((h) => (
                  <th key={h} className="text-left text-[14px] font-medium text-[#86909C] px-5 py-3">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {purchaseList.map((r, i) => (
                  <tr key={r.id} className="hover:bg-[#F7F8FA] transition-colors" style={{ borderTop: i ? '1px solid #F2F3F5' : 'none' }}>
                    <td className="px-5 py-[14px] text-[14px] font-semibold text-[#1D2129] font-mono">{r.orderNo}</td>
                    <td className="px-5 py-[14px]"><p className="text-[14px] font-semibold text-[#1D2129]">{r.moduleName}</p><p className="text-[14px] text-[#4E5969] mt-px">{r.moduleCode}</p></td>
                    <td className="px-5 py-[14px] text-[14px] font-bold text-[#F77234]">¥{r.amount.toLocaleString()}</td>
                    <td className="px-5 py-[14px] text-[14px] text-[#1D2129]">{r.payMethod}</td>
                    <td className="px-5 py-[14px] text-[14px] text-[#86909C] whitespace-nowrap"><span className="inline-flex items-center gap-[5px]"><Calendar size={12} className="text-[#C9CDD4]" />{r.orderTime}</span></td>
                    <td className="px-5 py-[14px]"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-[14px]"><button onClick={() => setPurchaseDetail(r)} className="inline-flex items-center gap-1 text-[14px] text-[#86909C] hover:text-[#1C71D8] transition-colors"><Eye size={14} /> 查看</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Trial detail modal */}
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

      {/* Purchase detail modal */}
      <Modal open={!!purchaseDetail} onClose={() => setPurchaseDetail(null)} title="订单详情">
        {purchaseDetail && (
          <div className="flex flex-col gap-4 text-[14px]">
            <div className="grid grid-cols-2 gap-x-5 gap-y-3">
              {([
                ['订单编号', purchaseDetail.orderNo],
                ['状态', <StatusBadge key="s" status={purchaseDetail.status} />],
                ['模块名称', purchaseDetail.moduleName],
                ['模块编号', purchaseDetail.moduleCode],
                ['支付金额', <span key="a" className="text-[#F77234] font-bold">¥{purchaseDetail.amount.toLocaleString()}</span>],
                ['支付方式', purchaseDetail.payMethod],
                ['购买人', purchaseDetail.buyer],
                ['部门', purchaseDetail.department],
              ] as [string, React.ReactNode][]).map(([l, v], i) => (
                <div key={i}><p className="text-[#C9CDD4] text-[14px] mb-1">{l}</p><div className="text-[#1D2129] font-medium">{v}</div></div>
              ))}
              <div className="col-span-2"><p className="text-[#C9CDD4] text-[14px] mb-1">下单时间</p><p className="text-[#1D2129] font-medium">{purchaseDetail.orderTime}</p></div>
            </div>
            <div className="flex justify-end pt-1">
              <button onClick={() => setPurchaseDetail(null)} className="h-[34px] px-4 text-[14px] font-medium text-white bg-[#1C71D8] rounded hover:bg-[#155BAB] transition-colors">关闭</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
