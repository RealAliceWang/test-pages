import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';

/** The four accent tones a metric may carry. Anything outside this set is a bug. */
export type MetricTone = 'neutral' | 'accent' | 'positive' | 'attention';

/**
 * Tone shows up in one place only: a hairline rule above the figure, plus the
 * icon. Filled colour chips on every card made a row of KPIs read as four
 * unrelated badges competing for attention — the numbers are the content, so
 * colour stays subordinate to them.
 */
const tones: Record<MetricTone, { rule: string; icon: string }> = {
  neutral: { rule: 'bg-text-placeholder/35', icon: 'text-text-placeholder' },
  accent: { rule: 'bg-signal', icon: 'text-signal-deep' },
  positive: { rule: 'bg-success-light', icon: 'text-success' },
  attention: { rule: 'bg-warning-light', icon: 'text-warning' },
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
 * Reads top to bottom as rule → label → figure → hint, with the figure given
 * far more weight than anything around it. The label sits on one fixed line so
 * the big figures land on a shared baseline and a row scans as one line of
 * numbers rather than four separate boxes.
 */
export default function MetricCard({ metric, onGo }: MetricCardProps) {
  const tone = tones[metric.tone ?? 'neutral'];

  const body = (
    <>
      {/* Short tone rule: enough colour to group the card, too little to
          compete with the figure below it. */}
      <span className={`block h-[3px] w-[26px] rounded-full ${tone.rule}`} />

      <div className="mt-[14px] flex items-center gap-2">
        <metric.icon size={14} strokeWidth={2.2} className={`shrink-0 ${tone.icon}`} />
        <p className="eyebrow truncate">{metric.label}</p>
      </div>

      <p className="display-num mt-[10px] text-[40px] text-text">{metric.value}</p>

      <div className="mt-auto pt-[14px] flex items-end justify-between gap-2">
        <p className="text-[12.5px] text-text-muted leading-[17px] truncate">{metric.hint}</p>
        {metric.to && (
          <ArrowUpRight
            size={15}
            className="shrink-0 mb-[1px] text-text-placeholder transition-all duration-200 group-hover:text-text group-hover:-translate-y-[2px] group-hover:translate-x-[2px]"
          />
        )}
      </div>
    </>
  );

  const base = 'panel group flex flex-col px-6 py-[22px] w-full text-left';
  if (!metric.to || !onGo) return <div className={base}>{body}</div>;

  const to = metric.to;
  return (
    <button type="button" onClick={() => onGo(to)} className={`${base} panel-hover cursor-pointer`}>
      {body}
    </button>
  );
}
