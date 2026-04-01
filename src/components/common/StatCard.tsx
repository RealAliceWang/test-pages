import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  iconBg: string;
  value: number | string;
  label: string;
  unit?: string;
  badgeColor?: string;
  horizontal?: boolean;
}

export default function StatCard({ icon, iconBg, value, label, unit, badgeColor, horizontal }: StatCardProps) {
  if (horizontal) {
    return (
      <div className="bg-white rounded px-5 py-4 flex items-center gap-4 relative overflow-hidden">
        {badgeColor && <span className="absolute top-[14px] right-[16px] text-[14px] font-semibold" style={{ color: badgeColor }} />}
        <div className={`w-[44px] h-[44px] rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>{icon}</div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-[26px] font-bold text-[#1D2129] leading-none">{value}</span>
            {unit && <span className="text-[14px] text-[#86909C] font-medium">{unit}</span>}
          </div>
          <p className="text-[14px] text-[#86909C] mt-[6px]">{label}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded px-5 py-4 flex items-center gap-4 relative overflow-hidden">
      {badgeColor && <span className="absolute top-[14px] right-[16px] text-[14px] font-semibold" style={{ color: badgeColor }} />}
      <div className={`w-[44px] h-[44px] rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>{icon}</div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-[24px] font-bold text-[#1D2129] leading-none">{value}</span>
          {unit && <span className="text-[14px] text-[#86909C] font-medium">{unit}</span>}
        </div>
        <p className="text-[14px] text-[#86909C] mt-[6px]">{label}</p>
      </div>
    </div>
  );
}
