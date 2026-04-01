const map: Record<string, { bg: string; fg: string }> = {
  '可申请': { bg: 'bg-[#E8F3FF]', fg: 'text-[#1C71D8]' },
  '已开通': { bg: 'bg-[#E8FFEA]', fg: 'text-[#00B42A]' },
  '审核中': { bg: 'bg-[#FFF7E8]', fg: 'text-[#D4770B]' },
  '可购买': { bg: 'bg-[#E8F3FF]', fg: 'text-[#1C71D8]' },
  '已购买': { bg: 'bg-[#E8FFEA]', fg: 'text-[#00B42A]' },
  '待审核': { bg: 'bg-[#FFF7E8]', fg: 'text-[#D4770B]' },
  '已通过': { bg: 'bg-[#E8FFEA]', fg: 'text-[#00B42A]' },
  '已拒绝': { bg: 'bg-[#FFECE8]', fg: 'text-[#F53F3F]' },
  '使用中': { bg: 'bg-[#E8FFEA]', fg: 'text-[#00B42A]' },
  '停用':   { bg: 'bg-[#F2F3F5]', fg: 'text-[#86909C]' },
};

export default function StatusBadge({ status }: { status: string }) {
  const c = map[status] || map['可申请'];
  return (
    <span className={`inline-block rounded px-[8px] py-[2px] text-[14px] font-semibold leading-[18px] ${c.bg} ${c.fg}`}>
      {status}
    </span>
  );
}
