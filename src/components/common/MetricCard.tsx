import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';

/** The four accent tones a metric may carry. Anything outside this set is a bug. */
export type MetricTone = 'neutral' | 'accent' | 'positive' | 'attention';

/**
 * One hue per tone, fed to both the card's wash and the icon plinth through a
 * single custom property. Tying them together is what keeps a row of four
 * tiles reading as a set rather than four unrelated colour choices.
 *
 * Tone stays semantic — amber means "needs attention", green means healthy —
 * so a row is not a fixed four-colour rotation. Neutral takes violet rather
 * than grey purely so the fourth hue holds its own next to the other three.
 *
 * `on` is the glyph colour: each is picked to clear 4.5:1 against the middle
 * of its own plinth, which rules out the lighter mid-tones for amber.
 */
const tones: Record<MetricTone, { tint: string; on: string }> = {
  neutral: { tint: '#A78BFA', on: '#2E1065' },
  accent: { tint: '#38BDF8', on: '#052E45' },
  positive: { tint: '#34D399', on: '#04372A' },
  attention: { tint: '#FBBF24', on: '#432B04' },
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
 * Reads top to bottom as icon + label → figure → hint, with the figure given
 * far more weight than anything around it. The label sits on one fixed line so
 * the big figures land on a shared baseline and a row scans as one line of
 * numbers rather than four separate boxes.
 */
export default function MetricCard({ metric, onGo }: MetricCardProps) {
  const tone = tones[metric.tone ?? 'neutral'];
  const style = { '--metric-tint': tone.tint } as CSSProperties;

  const body = (
    <>
      <div className="flex items-center gap-2.5">
        <span className="metric-icon w-[38px] h-[38px] rounded-[13px] flex items-center justify-center shrink-0">
          <metric.icon size={18} strokeWidth={2.3} style={{ color: tone.on }} />
        </span>
        <p className="eyebrow truncate">{metric.label}</p>
      </div>

      <p className="display-num mt-[16px] text-[40px] text-text">{metric.value}</p>

      <div className="mt-auto pt-[14px] flex items-end justify-between gap-2">
        {/* Secondary ink, not muted: the tinted ground eats the ~0.5 of
            contrast that muted grey had spare on plain white. */}
        <p className="text-[12.5px] text-text-secondary leading-[17px] truncate">{metric.hint}</p>
        {metric.to && (
          <ArrowUpRight
            size={15}
            className="shrink-0 mb-[1px] text-text-placeholder transition-all duration-200 group-hover:text-text group-hover:-translate-y-[2px] group-hover:translate-x-[2px]"
          />
        )}
      </div>
    </>
  );

  const base = 'panel metric-tile group flex flex-col px-6 py-[22px] w-full text-left';
  if (!metric.to || !onGo) {
    return (
      <div className={base} style={style}>
        {body}
      </div>
    );
  }

  const to = metric.to;
  return (
    <button
      type="button"
      onClick={() => onGo(to)}
      style={style}
      className={`${base} panel-hover cursor-pointer`}
    >
      {body}
    </button>
  );
}
