import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, FileCheck, FileClock, FileX, Eye, Download, Calendar, ShoppingCart, CreditCard, Inbox } from 'lucide-react';
import Header from '../components/layout/Header';
import type { UserRole } from '../components/layout/Layout';
import TabFilter from '../components/common/TabFilter';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { applicationRecords, purchaseOrders, currentUser, type ApplicationRecord, type ApplicationStatus, type PurchaseOrder, type PurchaseOrderStatus } from '../data/mock';

type RecordType = 'trial' | 'purchase';

function EmptyTable({ message }: { message: string }) {
  return (
    <div className="py-16 text-center">
      <Inbox size={48} className="mx-auto mb-4 text-text-placeholder" />
      <p className="text-[16px] text-text-muted mb-1">{message}</p>
      <p className="text-[14px] text-text-placeholder">试试调整筛选条件或搜索关键词</p>
    </div>
  );
}

export default function OrderRecords() {
  const { role, setRole } = useOutletContext<{ role: UserRole; setRole: (r: UserRole) => void }>();
  const [recordType, setRecordType] = useState<RecordType>('trial');
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<ApplicationRecord | null>(null);
  const [purchaseDetail, setPurchaseDetail] = useState<PurchaseOrder | null>(null);

  const myTrialRecords = role === 'admin' ? applicationRecords : applicationRecords.filter(r => r.applicant === currentUser.name);
  const myPurchaseOrders = role === 'admin' ? purchaseOrders : purchaseOrders.filter(r => r.buyer === currentUser.name);

  const trialFilters: (ApplicationStatus | '全部')[] = ['全部', '待审核', '审核中', '已通过', '已拒绝'];
  const trialSel = trialFilters[tab];
  const trialList = myTrialRecords.filter((r) => {
    if (trialSel !== '全部' && r.status !== trialSel) return false;
    if (search && !r.code.toLowerCase().includes(search.toLowerCase()) && !r.moduleName.includes(search) && !r.applicant.includes(search)) return false;
    return true;
  });
  const trialCnt = (s: ApplicationStatus) => myTrialRecords.filter((r) => r.status === s).length;

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
      <div className="p-6 flex flex-col gap-4">
        {/* Type switch */}
        <div className="flex items-center gap-3">
          <button onClick={() => handleTypeSwitch('trial')}
            className={`h-[40px] px-5 rounded-sm text-[14px] font-medium inline-flex items-center gap-2 cursor-pointer transition-all ${
              recordType === 'trial' ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:border-text-placeholder'
            }`}>
            <FileText size={16} /> 试用申请
            <span className={`px-1.5 py-[1px] rounded text-[12px] font-semibold ${recordType === 'trial' ? 'bg-white/20 text-white' : 'bg-surface-hover text-text-muted'}`}>
              {myTrialRecords.length}
            </span>
          </button>
          <button onClick={() => handleTypeSwitch('purchase')}
            className={`h-[40px] px-5 rounded-sm text-[14px] font-medium inline-flex items-center gap-2 cursor-pointer transition-all ${
              recordType === 'purchase' ? 'bg-orange text-white' : 'bg-surface text-text-secondary border border-border hover:border-text-placeholder'
            }`}>
            <ShoppingCart size={16} /> 购买订单
            <span className={`px-1.5 py-[1px] rounded text-[12px] font-semibold ${recordType === 'purchase' ? 'bg-white/20 text-white' : 'bg-surface-hover text-text-muted'}`}>
              {myPurchaseOrders.length}
            </span>
          </button>
        </div>

        {/* Stats — responsive grid */}
        {recordType === 'trial' ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {([
              { icon: <FileClock size={22} />, value: trialCnt('待审核'), label: '待审核', accent: '#D97706', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.18)', iconBg: 'rgba(251,191,36,0.12)', dot: 'rgba(251,191,36,0.10)' },
              { icon: <FileText size={22} />, value: trialCnt('审核中'), label: '审核中', accent: '#2563EB', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.18)', iconBg: 'rgba(59,130,246,0.12)', dot: 'rgba(59,130,246,0.10)' },
              { icon: <FileCheck size={22} />, value: trialCnt('已通过'), label: '已通过', accent: '#16A34A', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.18)', iconBg: 'rgba(34,197,94,0.12)', dot: 'rgba(34,197,94,0.10)' },
              { icon: <FileX size={22} />, value: trialCnt('已拒绝'), label: '已拒绝', accent: '#DC2626', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.18)', iconBg: 'rgba(239,68,68,0.12)', dot: 'rgba(239,68,68,0.10)' },
            ]).map((c, i) => (
              <div key={i} className="relative rounded-lg px-5 py-5 overflow-hidden"
                style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="absolute -top-4 -right-4 w-[72px] h-[72px] rounded-full" style={{ background: c.dot }} />
                <div className="absolute bottom-2 right-8 w-[32px] h-[32px] rounded-full" style={{ background: c.dot }} />
                <div className="relative flex items-center gap-4">
                  <div className="w-[44px] h-[44px] rounded-lg flex items-center justify-center shrink-0" style={{ background: c.iconBg, color: c.accent }}>{c.icon}</div>
                  <div>
                    <p className="text-[26px] font-bold leading-none tabular-nums" style={{ color: c.accent }}>{c.value}</p>
                    <p className="text-[14px] mt-1.5 text-text-muted">{c.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {([
              { icon: <CreditCard size={22} />, value: purchaseCnt('待支付'), label: '待支付', accent: '#D97706', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.18)', iconBg: 'rgba(251,191,36,0.12)', dot: 'rgba(251,191,36,0.10)' },
              { icon: <FileText size={22} />, value: purchaseCnt('已支付'), label: '已支付', accent: '#2563EB', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.18)', iconBg: 'rgba(59,130,246,0.12)', dot: 'rgba(59,130,246,0.10)' },
              { icon: <FileCheck size={22} />, value: purchaseCnt('已完成'), label: '已完成', accent: '#16A34A', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.18)', iconBg: 'rgba(34,197,94,0.12)', dot: 'rgba(34,197,94,0.10)' },
              { icon: <FileX size={22} />, value: purchaseCnt('已取消'), label: '已取消', accent: '#DC2626', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.18)', iconBg: 'rgba(239,68,68,0.12)', dot: 'rgba(239,68,68,0.10)' },
            ]).map((c, i) => (
              <div key={i} className="relative rounded-lg px-5 py-5 overflow-hidden"
                style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="absolute -top-4 -right-4 w-[72px] h-[72px] rounded-full" style={{ background: c.dot }} />
                <div className="absolute bottom-2 right-8 w-[32px] h-[32px] rounded-full" style={{ background: c.dot }} />
                <div className="relative flex items-center gap-4">
                  <div className="w-[44px] h-[44px] rounded-lg flex items-center justify-center shrink-0" style={{ background: c.iconBg, color: c.accent }}>{c.icon}</div>
                  <div>
                    <p className="text-[26px] font-bold leading-none tabular-nums" style={{ color: c.accent }}>{c.value}</p>
                    <p className="text-[14px] mt-1.5 text-text-muted">{c.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters + search */}
        <div className="bg-surface rounded-md px-5 py-3 flex items-center justify-between">
          {recordType === 'trial' ? (
            <TabFilter tabs={trialFilters.map((s) => ({ label: s === '全部' ? '全部状态' : s, count: s === '全部' ? myTrialRecords.length : trialCnt(s as ApplicationStatus) }))} activeIndex={tab} onChange={setTab} />
          ) : (
            <TabFilter tabs={purchaseFilters.map((s) => ({ label: s === '全部' ? '全部状态' : s, count: s === '全部' ? myPurchaseOrders.length : purchaseCnt(s as PurchaseOrderStatus) }))} activeIndex={tab} onChange={setTab} />
          )}
          <div className="flex items-center gap-3">
            <div className="w-[180px]"><SearchBar placeholder="搜索记录..." value={search} onChange={setSearch} /></div>
            <button className="h-[32px] px-3 text-[14px] font-medium text-text-secondary bg-surface-hover rounded-sm cursor-pointer inline-flex items-center gap-[6px] hover:bg-border transition-colors">
              <Download size={14} /> 导出
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface rounded-md overflow-hidden">
          {recordType === 'trial' ? (
            trialList.length === 0 ? <EmptyTable message="暂无试用申请记录" /> : (
              <table className="w-full">
                <thead><tr className="border-b border-border">
                  {['申请编号', '模块信息', '申请人', '申请时间', '状态', '操作'].map((h) => (
                    <th key={h} className="text-left text-[14px] font-medium text-text-muted px-5 py-3" scope="col">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {trialList.map((r, i) => (
                    <tr key={r.id} className="hover:bg-surface-secondary transition-colors" style={{ borderTop: i ? '1px solid var(--color-divider)' : 'none' }}>
                      <td className="px-5 py-[14px] text-[14px] font-semibold text-text">{r.code}</td>
                      <td className="px-5 py-[14px]"><p className="text-[14px] font-semibold text-text">{r.moduleName}</p><p className="text-[14px] text-text-secondary mt-px">{r.moduleCode}</p></td>
                      <td className="px-5 py-[14px]"><p className="text-[14px] text-text">{r.applicant}</p><p className="text-[14px] text-text-secondary mt-px">{r.department}</p></td>
                      <td className="px-5 py-[14px] text-[14px] text-text-muted whitespace-nowrap"><span className="inline-flex items-center gap-1"><Calendar size={13} className="text-text-placeholder" />{r.applyTime}</span></td>
                      <td className="px-5 py-[14px]"><StatusBadge status={r.status} /></td>
                      <td className="px-5 py-[14px]"><button onClick={() => setDetail(r)} className="inline-flex items-center gap-1 text-[14px] text-text-muted cursor-pointer hover:text-primary transition-colors"><Eye size={14} /> 查看</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            purchaseList.length === 0 ? <EmptyTable message="暂无购买订单记录" /> : (
              <table className="w-full">
                <thead><tr className="border-b border-border">
                  {['订单编号', '模块信息', '金额', '支付方式', '下单时间', '状态', '操作'].map((h) => (
                    <th key={h} className="text-left text-[14px] font-medium text-text-muted px-5 py-3" scope="col">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {purchaseList.map((r, i) => (
                    <tr key={r.id} className="hover:bg-surface-secondary transition-colors" style={{ borderTop: i ? '1px solid var(--color-divider)' : 'none' }}>
                      <td className="px-5 py-[14px] text-[14px] font-semibold text-text font-mono tabular-nums">{r.orderNo}</td>
                      <td className="px-5 py-[14px]"><p className="text-[14px] font-semibold text-text">{r.moduleName}</p><p className="text-[14px] text-text-secondary mt-px">{r.moduleCode}</p></td>
                      <td className="px-5 py-[14px] text-[14px] font-bold text-orange tabular-nums">¥{r.amount.toLocaleString()}</td>
                      <td className="px-5 py-[14px] text-[14px] text-text">{r.payMethod}</td>
                      <td className="px-5 py-[14px] text-[14px] text-text-muted whitespace-nowrap"><span className="inline-flex items-center gap-1"><Calendar size={13} className="text-text-placeholder" />{r.orderTime}</span></td>
                      <td className="px-5 py-[14px]"><StatusBadge status={r.status} /></td>
                      <td className="px-5 py-[14px]"><button onClick={() => setPurchaseDetail(r)} className="inline-flex items-center gap-1 text-[14px] text-text-muted cursor-pointer hover:text-primary transition-colors"><Eye size={14} /> 查看</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>

      {/* Trial detail modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="申请详情">
        {detail && (
          <div className="flex flex-col gap-4 text-[14px]">
            <div className="grid grid-cols-2 gap-x-5 gap-y-3">
              {([['申请编号', detail.code], ['状态', <StatusBadge key="s" status={detail.status} />], ['模块名称', detail.moduleName], ['模块编号', detail.moduleCode], ['申请人', detail.applicant], ['部门', detail.department]] as [string, React.ReactNode][]).map(([l, v], i) => (
                <div key={i}><p className="text-text-placeholder text-[14px] mb-1">{l}</p><div className="text-text font-medium">{v}</div></div>
              ))}
              <div className="col-span-2"><p className="text-text-placeholder text-[14px] mb-1">申请时间</p><p className="text-text font-medium">{detail.applyTime}</p></div>
            </div>
            <div className="flex justify-end pt-1">
              <button onClick={() => setDetail(null)} className="h-[36px] px-4 text-[14px] font-medium text-white bg-primary rounded-sm cursor-pointer hover:bg-primary-dark transition-colors">关闭</button>
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
                ['支付金额', <span key="a" className="text-orange font-bold">¥{purchaseDetail.amount.toLocaleString()}</span>],
                ['支付方式', purchaseDetail.payMethod],
                ['购买人', purchaseDetail.buyer],
                ['部门', purchaseDetail.department],
              ] as [string, React.ReactNode][]).map(([l, v], i) => (
                <div key={i}><p className="text-text-placeholder text-[14px] mb-1">{l}</p><div className="text-text font-medium">{v}</div></div>
              ))}
              <div className="col-span-2"><p className="text-text-placeholder text-[14px] mb-1">下单时间</p><p className="text-text font-medium">{purchaseDetail.orderTime}</p></div>
            </div>
            <div className="flex justify-end pt-1">
              <button onClick={() => setPurchaseDetail(null)} className="h-[36px] px-4 text-[14px] font-medium text-white bg-primary rounded-sm cursor-pointer hover:bg-primary-dark transition-colors">关闭</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
