import { Check, X, Clock, CircleDot, CreditCard, ShoppingCart, Ban } from 'lucide-react';
import type { ReactNode } from 'react';

const map: Record<string, { bg: string; fg: string; icon: ReactNode }> = {
  '可申请':  { bg: 'bg-primary-bg', fg: 'text-primary', icon: <CircleDot size={12} /> },
  '已开通':  { bg: 'bg-success-bg', fg: 'text-success', icon: <Check size={12} /> },
  '审核中':  { bg: 'bg-warning-bg', fg: 'text-warning', icon: <Clock size={12} /> },
  '可购买':  { bg: 'bg-primary-bg', fg: 'text-primary', icon: <ShoppingCart size={12} /> },
  '已购买':  { bg: 'bg-success-bg', fg: 'text-success', icon: <Check size={12} /> },
  '待审核':  { bg: 'bg-warning-bg', fg: 'text-warning', icon: <Clock size={12} /> },
  '已通过':  { bg: 'bg-success-bg', fg: 'text-success', icon: <Check size={12} /> },
  '已拒绝':  { bg: 'bg-danger-bg',  fg: 'text-danger',  icon: <X size={12} /> },
  '使用中':  { bg: 'bg-success-bg', fg: 'text-success', icon: <Check size={12} /> },
  '停用':    { bg: 'bg-surface-hover', fg: 'text-text-muted', icon: <Ban size={12} /> },
  '待支付':  { bg: 'bg-warning-bg', fg: 'text-warning', icon: <CreditCard size={12} /> },
  '已支付':  { bg: 'bg-primary-bg', fg: 'text-primary', icon: <Check size={12} /> },
  '已完成':  { bg: 'bg-success-bg', fg: 'text-success', icon: <Check size={12} /> },
  '已取消':  { bg: 'bg-surface-hover', fg: 'text-text-muted', icon: <Ban size={12} /> },
};

export default function StatusBadge({ status }: { status: string }) {
  const c = map[status] || map['可申请'];
  return (
    <span className={`inline-flex items-center rounded-sm px-2 py-[2px] text-[14px] font-normal leading-[18px] ${c.bg} ${c.fg}`}>
      {status}
    </span>
  );
}
