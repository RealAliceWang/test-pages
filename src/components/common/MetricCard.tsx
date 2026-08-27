import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

/** The four accent tones a metric may carry. Anything outside this set is a bug. */
export type MetricTone = 'neutral' | 'accent' | 'positive' | 'attention';

const tones: Record<MetricTone, { chip: string; icon: string }> = {
  neutral: { chip: 'bg-surface-hover', icon: 'text-text-secondary' },
  /* Signal blue on the leading metric, matching the rings and meters it
     summarises. */
  accent: { chip: 'chip-signal', icon: 'text-signal-deep' },
  positive: { chip: 'bg-success-bg', icon: 'text-success' },
  attention: { chip: 'bg-warning-bg', icon: 'text-warning' },
};

export interface Metric {
  icon: LucideIcon;
  value: string | number;
  label: string;
  hint?: string;
  tone?: MetricTone;
  to?: string;
}

interface MetricCardProps {
  metric: Metric;
  onGo?: (to: string) => void;
}

/**
 * The single KPI tile used across every page.
 *
 * Layout is label → figure → hint, top to bottom. Because the label is one
 * line at a fixed height, the big figures land on the same baseline in every
 * card, so a row reads as one continuous line of numbers rather than four
 * unrelated boxes.
 */
export default function MetricCard({ metric, onGo }: MetricCardProps) {
  const tone = tones[metric.tone ?? 'neutral'];

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-semibold text-text-secondary leading-[18px] truncate">
          {metric.label}
        </p>
        <span
          className={`w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 ${tone.chip}`}
        >
          <metric.icon size={17} strokeWidth={2.1} className={tone.icon} />
        </span>
      </div>

      <p className="display-num mt-[14px] text-[34px] text-text">{metric.value}</p>

      <div className="mt-auto pt-[12px] flex items-end justify-between gap-2">
        <p className="text-[12.5px] text-text-muted leading-[17px] truncate">{metric.hint}</p>
        {metric.to && (
          <ArrowRight
            size={14}
            className="shrink-0 mb-[2px] text-text-placeholder transition-all duration-200 group-hover:text-text group-hover:translate-x-[3px]"
          />
        )}
      </div>
    </>
  );

  const base = 'panel group flex flex-col px-5 py-[18px] w-full text-left';
  if (!metric.to || !onGo) return <div className={base}>{body}</div>;

  const to = metric.to;
  return (
    <button type="button" onClick={() => onGo(to)} className={`${base} panel-hover cursor-pointer`}>
      {body}
    </button>
  );
}
