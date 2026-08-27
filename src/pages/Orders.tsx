import { useState } from 'react';
import {
  BadgeCheck, CreditCard, Receipt, ShoppingCart, Wallet,
} from 'lucide-react';
import Header from '../components/layout/Header';
import MetricCard, { type Metric } from '../components/common/MetricCard';
import TabFilter from '../components/common/TabFilter';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { can } from '../domain/permissions';
import {
  deptOf, memberOf, moduleOf, orgOf, useApp, visibleOrders,
} from '../store';
import type { Application, Order, PayMethod } from '../domain/types';

const filters = ['全部', '待支付', '待厂商确认', '退款中', '已完成', '已取消'] as const;

export default function Orders() {
  const { state, me, dispatch } = useApp();

  const isVendor = me.role === 'VENDOR_OPS';
  const canManage = can(me.role, 'order:manage');
  const canConfirm = can(me.role, 'order:confirm');

  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [placing, setPlacing] = useState<Application | null>(null);
  const [seats, setSeats] = useState(1);
  const [payMethod, setPayMethod] = useState<PayMethod>('在线支付');
  const [paying, setPaying] = useState<Order | null>(null);
  const [confirming, setConfirming] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState<Order | null>(null);
  const [refunding, setRefunding] = useState<Order | null>(null);

  const orders = visibleOrders(state, me);

  // Approved purchase requests that still need an order.
  const toPurchase = state.applications.filter(
    (a) => a.status === '待采购' && a.orgId === me.orgId,
  );

  const sel = filters[tab];
  const list = orders.filter((o) => {
    if (sel !== '全部' && o.status !== sel) return false;
    if (!search) return true;
    const mod = moduleOf(state, o.moduleId);
    const org = orgOf(state, o.orgId);
    return o.orderNo.includes(search) || (mod?.name.includes(search) ?? false) || (org?.shortName.includes(search) ?? false);
  });

  const paidAmount = orders.filter((o) => o.status === '已完成').reduce((s, o) => s + o.amount, 0);
  const unpaidAmount = orders.filter((o) => o.status === '待支付').reduce((s, o) => s + o.amount, 0);
  const pendingConfirm = orders.filter((o) => o.status === '待厂商确认');

  const stats: Metric[] = [
    { icon: Receipt, value: orders.length, label: isVendor ? '平台订单总数' : '订单总数', hint: '含全部状态的订单', tone: 'accent' },
    { icon: Wallet, value: `¥${paidAmount.toLocaleString()}`, label: isVendor ? '累计成交额' : '累计支出', hint: '已完成订单合计', tone: 'positive' },
    { icon: CreditCard, value: `¥${unpaidAmount.toLocaleString()}`, label: '待支付金额', hint: unpaidAmount ? '支付后席位方可扩容' : '暂无待支付订单', tone: unpaidAmount ? 'attention' : 'neutral' },
    { icon: BadgeCheck, value: pendingConfirm.length, label: isVendor ? '待确认到账' : '等待厂商确认', hint: '厂商确认后自动建池', tone: pendingConfirm.length ? 'attention' : 'neutral' },
  ];

  return (
    <div>
      <Header
        title={isVendor ? '订单与到账' : '订单与账单'}
        subtitle={
          isVendor
            ? `全平台订单 · ${pendingConfirm.length} 笔等待确认到账`
            : `${orders.length} 笔订单 · 待支付 ¥${unpaidAmount.toLocaleString()}`
        }
      />

      <div className="px-7 pb-7 flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-5 stagger">
          {stats.map((s, i) => (
            <MetricCard key={i} metric={s} />
          ))}
        </div>

        {/* Purchase queue: approved requests waiting to become orders */}
        {canManage && toPurchase.length > 0 && (
          <div className="panel">
            <div className="px-5 pt-5 pb-3.5">
              <p className="text-[13.5px] font-bold text-text tracking-[-0.01em]">待下单采购（{toPurchase.length}）</p>
              <p className="text-[13px] text-text-muted mt-[3px]">
                审批已通过，下单并完成支付后席位会自动发放给申请人
              </p>
            </div>
            <div className="divide-y divide-divider">
              {toPurchase.map((app) => {
                const mod = moduleOf(state, app.moduleId);
                const applicant = memberOf(state, app.applicantId);
                const dept = deptOf(state, app.deptId);
                return (
                  <div key={app.id} className="px-5 py-4 flex items-center gap-4">
                    <ShoppingCart size={18} className="text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] text-text">
                        {mod?.name}（{mod?.edition}） · {app.seats} 个席位
                      </p>
                      <p className="text-[13px] text-text-muted mt-[3px]">
                        {app.code} · {applicant?.name} · {dept?.name} · {app.projectName}
                      </p>
                    </div>
                    <span className="text-[15px] font-bold text-orange shrink-0">
                      ¥{((mod?.unitPrice ?? 0) * app.seats).toLocaleString()}
                    </span>
                    <button onClick={() => { setPlacing(app); setSeats(app.seats); setPayMethod('在线支付'); }}
                      className="h-[32px] px-4  text-[13px] font-medium btn-primary text-white cursor-pointer shrink-0">
                      立即下单
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="panel px-5 py-3 flex items-center justify-between gap-4">
          <TabFilter tabs={filters.map((f) => ({ label: f }))} activeIndex={tab} onChange={setTab} />
          <div className="w-[240px]">
            <SearchBar placeholder={isVendor ? '搜索订单号、模块或企业...' : '搜索订单号或模块...'} value={search} onChange={setSearch} />
          </div>
        </div>

        <div className="panel overflow-hidden">
          <table className="data-table w-full">
            <thead>
              <tr className="border-b border-hairline">
                {[
                  '订单号', isVendor ? '所属企业' : '模块', isVendor ? '模块' : '席位数',
                  '金额', '支付方式', '下单人', '下单时间', '状态', '操作',
                ].map((h) => (
                  <th key={h} className="text-left text-[13px] font-normal text-text-muted px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((o, i) => {
                const mod = moduleOf(state, o.moduleId);
                const org = orgOf(state, o.orgId);
                const buyer = memberOf(state, o.createdById);
                return (
                  <tr key={o.id} className="hover:bg-surface-secondary transition-colors"
                    style={{ borderTop: i ? '1px solid var(--color-divider)' : 'none' }}>
                    <td className="px-5 py-[14px]">
                      <p className="text-[14px] text-text">{o.orderNo}</p>
                      {o.renewPoolId && <p className="text-[12px] text-primary mt-[2px]">续费订单</p>}
                      {o.invoiceNo && <p className="text-[12px] text-text-muted mt-[2px]">{o.invoiceNo}</p>}
                    </td>
                    {isVendor ? (
                      <>
                        <td className="px-5 py-[14px] text-[14px] text-text-secondary">{org?.shortName ?? '—'}</td>
                        <td className="px-5 py-[14px] text-[14px] text-text-secondary">
                          {mod?.name}
                          <span className="text-text-muted"> · {o.seats} 席</span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-[14px]">
                          <p className="text-[14px] text-text-secondary">{mod?.name}</p>
                          <p className="text-[12px] text-text-muted mt-[2px]">{mod?.edition}</p>
                        </td>
                        <td className="px-5 py-[14px] text-[14px] text-text text-center">{o.seats}</td>
                      </>
                    )}
                    <td className="px-5 py-[14px] text-[14px] font-medium text-text whitespace-nowrap">
                      ¥{o.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-[14px] text-[14px] text-text-secondary whitespace-nowrap">{o.payMethod}</td>
                    <td className="px-5 py-[14px] text-[14px] text-text-secondary whitespace-nowrap">{buyer?.name ?? '—'}</td>
                    <td className="px-5 py-[14px] text-[13px] text-text-muted whitespace-nowrap">{o.createdAt}</td>
                    <td className="px-5 py-[14px]"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-[14px]">
                      <div className="flex items-center gap-2">
                        {canManage && o.status === '待支付' && (
                          <>
                            <button onClick={() => setPaying(o)}
                              className="h-[30px] px-3  text-[13px] font-medium btn-primary text-white cursor-pointer whitespace-nowrap">
                              支付
                            </button>
                            <button onClick={() => setCancelling(o)}
                              className="btn-soft h-[32px] px-3.5 text-[13px] font-semibold cursor-pointer">
                              取消
                            </button>
                          </>
                        )}
                        {canManage && o.status === '待厂商确认' && (
                          <button onClick={() => setCancelling(o)}
                            className="btn-soft h-[32px] px-3.5 text-[13px] font-semibold cursor-pointer whitespace-nowrap">
                            申请退款
                          </button>
                        )}
                        {canConfirm && o.status === '待厂商确认' && (
                          <button onClick={() => setConfirming(o)}
                            className="h-[32px] px-3.5 rounded-full text-[13px] font-semibold text-white bg-success hover:brightness-110 transition-all cursor-pointer whitespace-nowrap">
                            确认到账
                          </button>
                        )}
                        {canConfirm && o.status === '退款中' && (
                          <button onClick={() => setRefunding(o)}
                            className="h-[32px] px-3.5 rounded-full text-[13px] font-semibold text-white bg-warning hover:brightness-110 transition-all cursor-pointer whitespace-nowrap">
                            确认退款
                          </button>
                        )}
                        {!canManage && !canConfirm && <span className="text-[13px] text-text-placeholder">—</span>}
                        {canManage && o.status === '退款中' && (
                          <span className="text-[13px] text-text-muted whitespace-nowrap">等待厂商退款</span>
                        )}
                        {(o.status === '已完成' || o.status === '已取消') && (
                          <span className="text-[13px] text-text-placeholder">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {list.length === 0 && (
            <div className="py-16 text-center">
              <Receipt size={44} className="mx-auto mb-4 text-text-placeholder" />
              <p className="text-[15px] text-text-muted">没有{sel === '全部' ? '' : sel}订单</p>
            </div>
          )}
        </div>
      </div>

      {/* Place an order for an approved request */}
      <Modal open={Boolean(placing)} onClose={() => setPlacing(null)} title="创建采购订单" width={520}>
        {placing && (() => {
          const mod = moduleOf(state, placing.moduleId)!;
          const applicant = memberOf(state, placing.applicantId);
          const amount = mod.unitPrice * seats;
          return (
            <div className="flex flex-col gap-4">
              <div className="border border-border rounded-sm divide-y divide-divider">
                {[
                  { label: '关联申请', value: `${placing.code} · ${applicant?.name}` },
                  { label: '采购模块', value: `${mod.name}（${mod.edition}）` },
                  { label: '席位单价', value: `¥${mod.unitPrice.toLocaleString()}/席位/年` },
                  { label: '授权期限', value: `${mod.duration} 天` },
                ].map((r) => (
                  <div key={r.label} className="flex px-4 py-[10px] text-[14px]">
                    <span className="w-[90px] shrink-0 text-text-muted">{r.label}</span>
                    <span className="text-text">{r.value}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[14px] text-text-secondary mb-2">采购席位数</label>
                <input type="number" min={1} max={99} value={seats}
                  onChange={(e) => setSeats(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                  className="w-[130px] h-[36px] px-3 text-[14px] field focus:border-primary focus:outline-none" />
                <p className="text-[12px] text-text-placeholder mt-2">
                  申请人请求 {placing.seats} 个。可多采购以留出余量，后续可直接分配给其他成员。
                </p>
              </div>

              <div>
                <label className="block text-[14px] text-text-secondary mb-2">支付方式</label>
                <div className="flex items-center gap-2">
                  {(['在线支付', '对公转账'] as PayMethod[]).map((p) => (
                    <button key={p} onClick={() => setPayMethod(p)}
                      className={`h-[34px] px-4 rounded-full text-[13px] font-semibold transition-colors cursor-pointer ${
                        payMethod === p ? 'bg-primary-bg text-primary' : 'bg-surface-hover text-text-secondary hover:bg-border'
                      }`}>
                      {p}
                    </button>
                  ))}
                </div>
                <p className="text-[12px] text-text-placeholder mt-2">
                  {payMethod === '在线支付'
                    ? '支付成功后席位立即到账并自动分配给申请人'
                    : '提交转账凭证后需厂商确认到账，席位才会发放'}
                </p>
              </div>

              <div className="px-4 py-3 rounded-sm bg-surface-secondary flex items-center justify-between">
                <span className="text-[14px] text-text-secondary">订单金额</span>
                <span className="text-[20px] font-bold text-orange">¥{amount.toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => {
                  dispatch({ type: 'CREATE_ORDER', moduleId: placing.moduleId, seats, payMethod, applicationId: placing.id });
                  setPlacing(null);
                }}
                  className="h-[36px] px-5  text-[14px] font-medium btn-primary text-white cursor-pointer">
                  生成订单
                </button>
                <button onClick={() => setPlacing(null)}
                  className="btn-soft h-[38px] px-5 text-[14px] font-semibold cursor-pointer">
                  取消
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Pay */}
      <Modal open={Boolean(paying)} onClose={() => setPaying(null)} title="支付订单" width={480}>
        {paying && (() => {
          const mod = moduleOf(state, paying.moduleId);
          return (
            <div className="flex flex-col gap-4">
              <div className="text-center py-4">
                <p className="text-[13px] text-text-muted">应付金额</p>
                <p className="text-[32px] font-bold text-orange mt-2">¥{paying.amount.toLocaleString()}</p>
                <p className="text-[13px] text-text-muted mt-2">
                  {mod?.name} · {paying.seats} 个席位 · {paying.payMethod}
                </p>
              </div>

              <div className={`px-4 py-3 rounded-sm ${paying.payMethod === '在线支付' ? 'bg-success-bg' : 'bg-primary-bg'}`}>
                <p className={`text-[13px] leading-relaxed ${paying.payMethod === '在线支付' ? 'text-success' : 'text-primary'}`}>
                  {paying.payMethod === '在线支付'
                    ? `支付成功后，${paying.seats} 个席位立即计入企业席位池${paying.applicationId ? '，并自动分配给申请人' : ''}。`
                    : '提交转账凭证后订单转为「待厂商确认」，厂商核对到账后席位才会发放。'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => { dispatch({ type: 'PAY_ORDER', orderId: paying.id }); setPaying(null); }}
                  className="h-[36px] px-5  text-[14px] font-medium btn-primary text-white cursor-pointer">
                  {paying.payMethod === '在线支付' ? '确认支付' : '提交转账凭证'}
                </button>
                <button onClick={() => setPaying(null)}
                  className="btn-soft h-[38px] px-5 text-[14px] font-semibold cursor-pointer">
                  取消
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Vendor confirms receipt */}
      <Modal open={Boolean(confirming)} onClose={() => setConfirming(null)} title="确认到账" width={480}>
        {confirming && (() => {
          const mod = moduleOf(state, confirming.moduleId);
          const org = orgOf(state, confirming.orgId);
          return (
            <div className="flex flex-col gap-4">
              <div className="border border-border rounded-sm divide-y divide-divider">
                {[
                  { label: '订单号', value: confirming.orderNo },
                  { label: '客户企业', value: org?.name ?? '—' },
                  { label: '采购内容', value: `${mod?.name} · ${confirming.seats} 个席位` },
                  { label: '金额', value: `¥${confirming.amount.toLocaleString()}` },
                  { label: '付款时间', value: confirming.paidAt ?? '—' },
                ].map((r) => (
                  <div key={r.label} className="flex px-4 py-[10px] text-[14px]">
                    <span className="w-[80px] shrink-0 text-text-muted">{r.label}</span>
                    <span className="text-text">{r.value}</span>
                  </div>
                ))}
              </div>

              <div className="px-4 py-3 rounded-sm bg-success-bg">
                <p className="text-[13px] text-success leading-relaxed">
                  确认后 {confirming.seats} 个席位立即发放至 {org?.shortName}，并开具发票。此操作会记入平台审计日志。
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => { dispatch({ type: 'CONFIRM_ORDER', orderId: confirming.id }); setConfirming(null); }}
                  className="h-[38px] px-5 rounded-full text-[14px] font-semibold bg-success text-white hover:brightness-110 transition-all cursor-pointer">
                  确认已到账
                </button>
                <button onClick={() => setConfirming(null)}
                  className="btn-soft h-[38px] px-5 text-[14px] font-semibold cursor-pointer">
                  取消
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Cancel. Money already wired cannot just be dropped, so an unpaid order
          closes on the spot while a paid one opens a refund the vendor settles. */}
      <Modal
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        title={cancelling?.status === '待厂商确认' ? '申请退款' : '取消订单'}
        width={440}
      >
        {cancelling && (
          <div className="flex flex-col gap-4">
            <div className="px-4 py-3 rounded-sm bg-warning-bg">
              <p className="text-[13px] text-warning leading-relaxed">
                {cancelling.status === '待厂商确认'
                  ? `${cancelling.orderNo}（¥${cancelling.amount.toLocaleString()}）的款项已支付，取消需由厂商核对后退款。提交后订单转为「退款中」，厂商确认退款后关闭。`
                  : `取消 ${cancelling.orderNo}（¥${cancelling.amount.toLocaleString()}）后，关联的申请将退回「待采购」，申请人不会获得席位。如需重新采购请再次下单。`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => { dispatch({ type: 'CANCEL_ORDER', orderId: cancelling.id }); setCancelling(null); }}
                className="h-[38px] px-5 rounded-full text-[14px] font-semibold bg-danger text-white hover:brightness-110 transition-all cursor-pointer">
                {cancelling.status === '待厂商确认' ? '提交退款申请' : '确认取消'}
              </button>
              <button onClick={() => setCancelling(null)}
                className="btn-soft h-[38px] px-5 text-[14px] font-semibold cursor-pointer">
                返回
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Refund settlement, vendor side */}
      <Modal open={Boolean(refunding)} onClose={() => setRefunding(null)} title="确认退款" width={440}>
        {refunding && (
          <div className="flex flex-col gap-4">
            <div className="px-4 py-3 rounded-sm bg-warning-bg">
              <p className="text-[13px] text-warning leading-relaxed">
                确认已向 {orgOf(state, refunding.orgId)?.shortName ?? '该企业'} 退回 ¥{refunding.amount.toLocaleString()}
                （{refunding.orderNo}）。订单将关闭，关联申请退回「待采购」，席位不发放。此操作记入平台审计日志。
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => { dispatch({ type: 'CONFIRM_REFUND', orderId: refunding.id }); setRefunding(null); }}
                className="h-[38px] px-5 rounded-full text-[14px] font-semibold bg-warning text-white hover:brightness-110 transition-all cursor-pointer">
                确认已退款
              </button>
              <button onClick={() => setRefunding(null)}
                className="btn-soft h-[38px] px-5 text-[14px] font-semibold cursor-pointer">
                返回
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
