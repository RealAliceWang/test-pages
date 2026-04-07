import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Check, CreditCard, Building2, QrCode,
  Clock, Shield, FileText, Copy, CheckCircle2, ChevronRight,
  Download, AlertCircle, Wallet,
} from 'lucide-react';
import Header from '../components/layout/Header';

import { modules, currentUser, type Module } from '../data/mock';
import { moduleIconMap } from '../assets/moduleIcons';

type Step = 1 | 2 | 3;
type PayMethod = 'alipay' | 'wechat' | 'bank';

const stepLabels = ['填写信息', '确认支付', '购买成功'];

const inputCls = "w-full h-[40px] px-3 text-[14px] text-[#1D2129] bg-[#F7F8FA] border border-[#E5E6EB] rounded outline-none placeholder:text-[#C9CDD4] focus:border-[#1C71D8] focus:bg-white transition-all";
const textareaCls = "w-full px-3 py-2.5 text-[14px] text-[#1D2129] bg-[#F7F8FA] border border-[#E5E6EB] rounded outline-none placeholder:text-[#C9CDD4] focus:border-[#1C71D8] focus:bg-white transition-all resize-none";
const labelCls = "block text-[14px] font-semibold text-[#1D2129] mb-1.5";

function genOrderNo() {
  const d = new Date();
  const pad = (n: number, l = 2) => String(n).padStart(l, '0');
  return `ORD${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${Math.floor(Math.random() * 9000 + 1000)}`;
}

export default function PurchaseApplication() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const mod = modules.find((m) => m.id === moduleId) as Module | undefined;

  const [step, setStep] = useState<Step>(1);
  const [payMethod, setPayMethod] = useState<PayMethod>('alipay');
  const [orderNo] = useState(genOrderNo);
  const [countdown, setCountdown] = useState(900);
  const [copied, setCopied] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Form fields pre-filled from currentUser
  const [form, setForm] = useState({
    name: currentUser.name === '用户名' ? '' : currentUser.name,
    department: '',
    phone: currentUser.phone || '',
    email: currentUser.email || '',
    reason: '',
  });

  // Payment countdown (step 2)
  useEffect(() => {
    if (step !== 2) return;
    const t = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [step]);

  if (!mod) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-[#F53F3F]" />
          <p className="text-[16px] text-[#1D2129] font-semibold mb-2">模块不存在</p>
          <Link to="/paid-modules" className="text-[14px] text-[#1C71D8] hover:underline">返回付费模块列表</Link>
        </div>
      </div>
    );
  }

  const icon = moduleIconMap[mod.icon] || moduleIconMap.building;
  const price = mod.price ?? 0;
  const mmStr = `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`;

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStep1Submit = (e: FormEvent) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePayConfirm = () => {
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ─── Step Indicator ─── */
  const StepBar = () => (
    <div className="flex items-center justify-center gap-0 py-6">
      {stepLabels.map((label, i) => {
        const idx = (i + 1) as Step;
        const done = step > idx;
        const active = step === idx;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center w-[100px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-semibold transition-all ${
                done || (active && step === 3) ? 'bg-[#00B42A] text-white' : active ? 'bg-[#1C71D8] text-white' : 'bg-[#E5E6EB] text-[#86909C]'
              }`}>
                {done || (active && step === 3) ? <Check size={16} strokeWidth={3} /> : idx}
              </div>
              <span className={`mt-2 text-[13px] ${active && step === 3 ? 'text-[#00B42A] font-semibold' : active ? 'text-[#1D2129] font-semibold' : done ? 'text-[#00B42A]' : 'text-[#86909C]'}`}>{label}</span>
            </div>
            {i < 2 && (
              <div className={`w-[80px] h-[2px] mt-[-18px] ${step > idx || (step === 3 && idx === 3) ? 'bg-[#00B42A]' : step >= idx ? 'bg-[#00B42A]' : 'bg-[#E5E6EB]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  /* ─── Module Summary Card ─── */
  const ModuleSummary = ({ compact = false }: { compact?: boolean }) => (
    <div
      className={`relative rounded-xl overflow-hidden border border-[#b8d4f0] ${compact ? 'p-4' : 'p-5'}`}
      style={{
        background: 'linear-gradient(135deg, #e8f1fb 0%, #f0f6ff 50%, #e4eefb 100%)',
      }}
    >

      <div className="relative flex items-center gap-4">
        <div className="w-[52px] h-[52px] rounded-lg bg-[#1c71d8]/10 border border-[#1c71d8]/15 flex items-center justify-center">
          <img src={icon} alt="" className="w-[36px] h-[36px] object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-bold text-[#1D2129]">{mod.name}（商业版）</p>
            <span className="px-2 py-0.5 text-[12px] bg-[#1c71d8]/10 text-[#1c71d8] rounded font-medium">付费</span>
          </div>
          <p className="text-[13px] text-[#86909C] mt-0.5">{mod.description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[24px] font-bold text-[#F77234]">¥{price.toLocaleString()}<span className="text-[13px] font-normal text-[#86909C]">/年</span></p>
        </div>
      </div>
      {!compact && (
        <div className="relative grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#b8d4f0]/50">
          <div><p className="text-[12px] text-[#86909C]">模块编号</p><p className="text-[14px] font-semibold text-[#1D2129] mt-0.5">{mod.code}</p></div>
          <div><p className="text-[12px] text-[#86909C]">授权期限</p><p className="text-[14px] font-semibold text-[#1D2129] mt-0.5">{mod.duration} 天</p></div>
          <div><p className="text-[12px] text-[#86909C]">节点数量</p><p className="text-[14px] font-semibold text-[#1D2129] mt-0.5">{mod.nodes} 节点</p></div>
          <div><p className="text-[12px] text-[#86909C]">版本类型</p><p className="text-[14px] font-semibold text-[#1D2129] mt-0.5">商业版</p></div>
        </div>
      )}
    </div>
  );

  /* ─── STEP 1: Fill Information ─── */
  const renderStep1 = () => (
    <form onSubmit={handleStep1Submit} className="max-w-[1000px] mx-auto flex flex-col gap-6">
      <ModuleSummary />

      <div className="bg-white rounded-lg border border-[#E5E6EB] p-6">
        <h4 className="text-[15px] font-bold text-[#1D2129] mb-5 flex items-center gap-2">
          <FileText size={16} className="text-[#1C71D8]" />购买人信息
        </h4>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <div>
            <label className={labelCls}>姓名 <span className="text-[#F53F3F]">*</span></label>
            <input required className={inputCls} placeholder="请输入姓名" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>所属部门 <span className="text-[#F53F3F]">*</span></label>
            <input required className={inputCls} placeholder="请输入部门" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>联系电话 <span className="text-[#F53F3F]">*</span></label>
            <input required className={inputCls} placeholder="请输入手机号" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>电子邮箱 <span className="text-[#F53F3F]">*</span></label>
            <input required type="email" className={inputCls} placeholder="请输入邮箱" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelCls}>购买理由 <span className="text-[#F53F3F]">*</span></label>
          <textarea required className={textareaCls} rows={3} placeholder="请说明购买该模块的业务需求..." value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </div>
      </div>

      {/* Price breakdown */}
      <div className="bg-white rounded-lg border border-[#E5E6EB] p-6">
        <h4 className="text-[15px] font-bold text-[#1D2129] mb-4 flex items-center gap-2">
          <Wallet size={16} className="text-[#1C71D8]" />费用明细
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between text-[14px]"><span className="text-[#4E5969]">{mod.name}（商业版）× 1年</span><span className="text-[#1D2129]">¥{price.toLocaleString()}</span></div>
          <div className="flex justify-between text-[14px]"><span className="text-[#4E5969]">授权服务费</span><span className="text-[#1D2129]">¥0</span></div>
          <div className="flex justify-between text-[14px]"><span className="text-[#4E5969]">技术支持费</span><span className="text-[#00B42A]">免费</span></div>
          <div className="h-px bg-[#E5E6EB]" />
          <div className="flex justify-between items-baseline">
            <span className="text-[14px] font-semibold text-[#1D2129]">应付总额</span>
            <span className="text-[24px] font-bold text-[#F77234]">¥{price.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <input type="checkbox" id="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-[3px] accent-[#1C71D8]" />
        <label htmlFor="agree" className="text-[13px] text-[#86909C] leading-[20px] cursor-pointer select-none">
          我已阅读并同意 <span className="text-[#1C71D8]">《软件模块购买协议》</span> 和 <span className="text-[#1C71D8]">《服务条款》</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button type="button" onClick={() => navigate('/paid-modules')}
          className="h-[44px] rounded-lg text-[14px] font-medium text-[#4E5969] border border-[#C9CDD4] bg-white hover:border-[#86909C] hover:text-[#1D2129] transition-colors">
          返回列表
        </button>
        <button type="submit" disabled={!agreed}
          className="h-[44px] rounded-lg text-[14px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #F77234 0%, #F99D1C 100%)' }}>
          下一步：确认支付 <ChevronRight size={15} className="inline ml-0.5" />
        </button>
      </div>
    </form>
  );

  /* ─── STEP 2: Confirm Payment ─── */
  const renderStep2 = () => {
    const methods: { key: PayMethod; label: string; icon: React.ReactNode; desc: string }[] = [
      { key: 'alipay', label: '支付宝', icon: <QrCode size={20} className="text-[#1677FF]" />, desc: '扫码支付，实时到账' },
      { key: 'wechat', label: '微信支付', icon: <QrCode size={20} className="text-[#07C160]" />, desc: '扫码支付，实时到账' },
      { key: 'bank', label: '对公转账', icon: <Building2 size={20} className="text-[#1C71D8]" />, desc: '1-3个工作日到账确认' },
    ];

    return (
      <div className="max-w-[1000px] mx-auto flex flex-col gap-6">
        <ModuleSummary compact />

        {/* Order info */}
        <div className="bg-white rounded-lg border border-[#E5E6EB] p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[15px] font-bold text-[#1D2129] flex items-center gap-2">
              <FileText size={16} className="text-[#1C71D8]" />订单信息
            </h4>
            <div className="flex items-center gap-1.5 text-[13px] text-[#F77234]">
              <Clock size={14} />
              <span>支付剩余时间 <strong>{mmStr}</strong></span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-[14px]">
            <div className="flex gap-2"><span className="text-[#86909C] w-[70px] shrink-0">订单编号</span><span className="text-[#1D2129] font-mono">{orderNo}</span>
              <button onClick={() => handleCopy(orderNo)} className="text-[#1C71D8] hover:text-[#165DBC] transition-colors" title="复制">
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div className="flex gap-2"><span className="text-[#86909C] w-[70px] shrink-0">购买人</span><span className="text-[#1D2129]">{form.name}</span></div>
            <div className="flex gap-2"><span className="text-[#86909C] w-[70px] shrink-0">联系电话</span><span className="text-[#1D2129]">{form.phone}</span></div>
            <div className="flex gap-2"><span className="text-[#86909C] w-[70px] shrink-0">电子邮箱</span><span className="text-[#1D2129]">{form.email}</span></div>
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-lg border border-[#E5E6EB] p-6">
          <h4 className="text-[15px] font-bold text-[#1D2129] mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-[#1C71D8]" />选择支付方式
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {methods.map((m) => (
              <button key={m.key} type="button" onClick={() => setPayMethod(m.key)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  payMethod === m.key
                    ? 'border-[#1C71D8] bg-[#E8F3FF]'
                    : 'border-[#E5E6EB] hover:border-[#C9CDD4] bg-white'
                }`}>
                {payMethod === m.key && (
                  <span className="absolute top-1.5 right-1.5 w-[18px] h-[18px] bg-[#1C71D8] rounded-full flex items-center justify-center">
                    <Check size={11} strokeWidth={3} className="text-white" />
                  </span>
                )}
                {m.icon}
                <span className="text-[14px] font-semibold text-[#1D2129]">{m.label}</span>
                <span className="text-[12px] text-[#86909C]">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Payment details - different per method */}
        <div className="bg-white rounded-lg border border-[#E5E6EB] p-6">
          {payMethod === 'bank' ? (
            <>
              <h4 className="text-[15px] font-bold text-[#1D2129] mb-4 flex items-center gap-2">
                <Building2 size={16} className="text-[#1C71D8]" />对公转账信息
              </h4>
              <div className="bg-[#F7F8FA] rounded-lg p-4 space-y-3 text-[14px]">
                <div className="flex gap-2"><span className="text-[#86909C] w-[80px] shrink-0">收款单位</span><span className="text-[#1D2129] font-medium">上海同磊土木工程技术有限公司</span></div>
                <div className="flex gap-2"><span className="text-[#86909C] w-[80px] shrink-0">开户银行</span><span className="text-[#1D2129]">中国建设银行上海分行</span></div>
                <div className="flex gap-2">
                  <span className="text-[#86909C] w-[80px] shrink-0">银行账号</span>
                  <span className="text-[#1D2129] font-mono">3100 1510 0400 5025 2888</span>
                  <button onClick={() => handleCopy('31001510040050252888')} className="text-[#1C71D8] hover:text-[#165DBC] transition-colors">
                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="flex gap-2"><span className="text-[#86909C] w-[80px] shrink-0">转账备注</span><span className="text-[#1D2129] font-mono">{orderNo}</span></div>
              </div>
              <div className="mt-4 bg-[#FFF7E8] border border-[#FFDCA1] rounded px-4 py-3 text-[13px] text-[#D4770B] leading-[20px]">
                <strong>温馨提示：</strong>转账时请务必备注订单编号，以便我们快速确认付款。转账完成后将在1-3个工作日内开通授权。
              </div>
            </>
          ) : (
            <>
              <h4 className="text-[15px] font-bold text-[#1D2129] mb-4 flex items-center gap-2">
                <QrCode size={16} className="text-[#1C71D8]" />{payMethod === 'alipay' ? '支付宝' : '微信'}扫码支付
              </h4>
              <div className="flex flex-col items-center py-4">
                {/* Simulated QR code area */}
                <div className="w-[280px] h-[280px] bg-[#F7F8FA] border-2 border-dashed border-[#C9CDD4] rounded-lg flex flex-col items-center justify-center gap-4">
                  <QrCode size={96} className={payMethod === 'alipay' ? 'text-[#1677FF]' : 'text-[#07C160]'} />
                  <span className="text-[14px] text-[#86909C]">模拟二维码区域</span>
                </div>
                <p className="mt-4 text-[14px] text-[#4E5969]">
                  请使用{payMethod === 'alipay' ? '支付宝' : '微信'}扫描二维码完成支付
                </p>
                <p className="mt-1 text-[22px] font-bold text-[#F77234]">¥{price.toLocaleString()}</p>
              </div>
            </>
          )}
        </div>

        {/* Security notice */}
        <div className="flex items-center gap-3 bg-[#F0FFF0] border border-[#B7EB8F] rounded-lg px-4 py-3">
          <Shield size={18} className="text-[#00B42A] shrink-0" />
          <p className="text-[13px] text-[#4E5969] leading-[20px]">
            本平台采用SSL加密传输，支付信息全程加密保护。交易完成后您将收到邮件确认通知，授权将在支付确认后即时生效。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={() => setStep(1)}
            className="h-[44px] rounded-lg text-[14px] font-medium text-[#4E5969] border border-[#C9CDD4] bg-white hover:border-[#86909C] hover:text-[#1D2129] transition-colors">
            上一步
          </button>
          <button type="button" onClick={handlePayConfirm}
            className="h-[44px] rounded-lg text-[14px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.99]"
            style={{ background: 'linear-gradient(135deg, #F77234 0%, #F99D1C 100%)' }}>
            {payMethod === 'bank' ? '我已完成转账' : '模拟支付完成'}
          </button>
        </div>
      </div>
    );
  };

  /* ─── STEP 3: Success ─── */
  const renderStep3 = () => (
    <div className="max-w-[1000px] mx-auto flex flex-col gap-6">
      {/* Success banner */}
      <div className="bg-white rounded-lg border border-[#E5E6EB] p-8 text-center">
        <div className="w-[64px] h-[64px] mx-auto rounded-full bg-[#E8FFEA] flex items-center justify-center mb-4">
          <CheckCircle2 size={36} className="text-[#00B42A]" />
        </div>
        <h3 className="text-[20px] font-bold text-[#1D2129] mb-2">购买申请提交成功</h3>
        <p className="text-[14px] text-[#86909C] max-w-[400px] mx-auto leading-[22px]">
          {payMethod === 'bank'
            ? '您的订单已生成，请在3个工作日内完成对公转账。确认收款后将自动开通模块授权。'
            : '支付已完成，模块授权正在开通中，预计1分钟内生效。开通后将通过邮件通知您。'}
        </p>
      </div>

      {/* Order details */}
      <div className="bg-white rounded-lg border border-[#E5E6EB] p-6">
        <h4 className="text-[15px] font-bold text-[#1D2129] mb-4">订单详情</h4>
        <div className="grid grid-cols-2 gap-y-3 text-[14px]">
          <div className="flex gap-2"><span className="text-[#86909C] w-[80px] shrink-0">订单编号</span><span className="text-[#1D2129] font-mono font-semibold">{orderNo}</span></div>
          <div className="flex gap-2"><span className="text-[#86909C] w-[80px] shrink-0">订单状态</span>
            <span className={`inline-flex items-center gap-1 font-medium ${payMethod === 'bank' ? 'text-[#F77234]' : 'text-[#00B42A]'}`}>
              <span className={`w-[6px] h-[6px] rounded-full ${payMethod === 'bank' ? 'bg-[#F77234]' : 'bg-[#00B42A]'}`} />
              {payMethod === 'bank' ? '待确认收款' : '支付成功'}
            </span>
          </div>
          <div className="flex gap-2"><span className="text-[#86909C] w-[80px] shrink-0">购买模块</span><span className="text-[#1D2129]">{mod.name}（商业版）</span></div>
          <div className="flex gap-2"><span className="text-[#86909C] w-[80px] shrink-0">支付金额</span><span className="text-[#F77234] font-bold">¥{price.toLocaleString()}</span></div>
          <div className="flex gap-2"><span className="text-[#86909C] w-[80px] shrink-0">支付方式</span><span className="text-[#1D2129]">{{ alipay: '支付宝', wechat: '微信支付', bank: '对公转账' }[payMethod]}</span></div>
          <div className="flex gap-2"><span className="text-[#86909C] w-[80px] shrink-0">授权期限</span><span className="text-[#1D2129]">{mod.duration} 天</span></div>
          <div className="flex gap-2"><span className="text-[#86909C] w-[80px] shrink-0">购买人</span><span className="text-[#1D2129]">{form.name}</span></div>
          <div className="flex gap-2"><span className="text-[#86909C] w-[80px] shrink-0">提交时间</span><span className="text-[#1D2129]">{new Date().toLocaleString('zh-CN')}</span></div>
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-white rounded-lg border border-[#E5E6EB] p-6">
        <h4 className="text-[15px] font-bold text-[#1D2129] mb-4">后续流程</h4>
        <div className="space-y-4">
          {[
            { done: true, label: '提交购买申请', desc: '已完成' },
            { done: payMethod !== 'bank', label: '支付确认', desc: payMethod === 'bank' ? '等待对公转账确认（1-3个工作日）' : '支付已完成' },
            { done: false, label: '授权开通', desc: payMethod === 'bank' ? '收款确认后自动开通' : '系统自动处理中' },
            { done: false, label: '开始使用', desc: '授权生效后即可使用模块全部功能' },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                s.done ? 'bg-[#00B42A]' : 'bg-[#E5E6EB]'
              }`}>
                {s.done ? <Check size={13} strokeWidth={3} className="text-white" /> : <span className="text-[12px] text-[#86909C] font-semibold">{i + 1}</span>}
              </div>
              <div>
                <p className={`text-[14px] font-medium ${s.done ? 'text-[#00B42A]' : 'text-[#1D2129]'}`}>{s.label}</p>
                <p className="text-[13px] text-[#86909C] mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-4">
        <button type="button" onClick={() => handleCopy(`订单编号: ${orderNo}\n模块: ${mod.name}\n金额: ¥${price.toLocaleString()}`)}
          className="h-[44px] rounded-lg text-[14px] font-medium text-[#4E5969] border border-[#C9CDD4] bg-white hover:border-[#86909C] hover:text-[#1D2129] transition-colors flex items-center justify-center gap-1.5">
          <Download size={15} /> 复制订单信息
        </button>
        <Link to="/applications"
          className="h-[44px] rounded-lg text-[14px] font-medium text-[#1C71D8] border border-[#1C71D8] bg-white hover:bg-[#E8F3FF] transition-colors flex items-center justify-center gap-1.5">
          <FileText size={15} /> 查看申请记录
        </Link>
        <Link to="/paid-modules"
          className="h-[44px] rounded-lg text-[14px] font-semibold text-white flex items-center justify-center gap-1 transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #F77234 0%, #F99D1C 100%)' }}>
          继续购买 <ChevronRight size={15} />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header title="购买模块" subtitle={`${mod.name}（商业版） — ${mod.code}`} />

      <div className="p-6">
        {/* Back link */}
        <button onClick={() => step === 1 ? navigate('/paid-modules') : setStep((step - 1) as Step)}
          className="inline-flex items-center gap-1 text-[14px] text-[#86909C] hover:text-[#1C71D8] transition-colors mb-2">
          <ArrowLeft size={15} /> {step === 1 ? '返回付费模块' : '返回上一步'}
        </button>

        <StepBar />

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
}
