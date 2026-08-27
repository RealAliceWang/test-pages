type Tone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

/** Flat tinted chip. The ring was doing nothing at this size but add noise. */
const tones: Record<Tone, string> = {
  info: 'bg-primary-bg text-primary-dark',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
  neutral: 'bg-surface-hover text-text-muted',
};

const dots: Record<Tone, string> = {
  info: 'bg-primary',
  success: 'bg-success-light',
  warning: 'bg-warning-light',
  danger: 'bg-danger-light',
  neutral: 'bg-text-placeholder',
};

const map: Record<string, Tone> = {
  // catalog availability
  可申请: 'info',
  可购买: 'info',
  已开通: 'success',
  席位充足: 'success',
  席位已满: 'warning',
  未开通: 'neutral',
  已下架: 'neutral',
  // approval chain
  待部门审批: 'warning',
  待企业审批: 'warning',
  待厂商审批: 'warning',
  待采购: 'info',
  已下单: 'info',
  审核中: 'warning',
  待审批: 'warning',
  已通过: 'success',
  已驳回: 'danger',
  已撤销: 'neutral',
  // seats
  生效中: 'success',
  即将到期: 'warning',
  已过期: 'neutral',
  已暂停: 'danger',
  已回收: 'neutral',
  // orders
  待支付: 'warning',
  待厂商确认: 'info',
  退款中: 'warning',
  已支付: 'info',
  已完成: 'success',
  已取消: 'neutral',
  // people and orgs
  在职: 'success',
  待激活: 'warning',
  已停用: 'neutral',
  正常: 'success',
  使用中: 'success',
  已认证: 'success',
  未认证: 'warning',
};

interface StatusBadgeProps {
  status: string;
  tone?: Tone;
}

export default function StatusBadge({ status, tone }: StatusBadgeProps) {
  const key = tone ?? map[status] ?? 'neutral';
  return (
    <span
      className={`inline-flex items-center gap-[5px] rounded-full pl-[8px] pr-[10px] py-[3px] text-[12px] font-semibold leading-[16px] whitespace-nowrap ${tones[key]}`}
    >
      <span className={`w-[5px] h-[5px] rounded-full shrink-0 ${dots[key]}`} />
      {status}
    </span>
  );
}
