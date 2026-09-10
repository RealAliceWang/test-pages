import type { LucideIcon } from 'lucide-react';
import { METER_FILL, poolHealth } from '../../domain/poolHealth';

export interface MiniStatProps {
  label: string;
  /** Left side of the ratio, e.g. seats already allocated. */
  current: number;
  /** Right side of the ratio. When 0 the meter is hidden. */
  total: number;
  unit?: string;
  /** One supporting line under the meter, usually what the remainder means. */
  hint?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  /**
   * Flags the ratio as needing attention: the fraction and percentage text
   * turn amber. The `.meter` fill itself always follows `poolHealth(pct)`
   * (see src/domain/poolHealth.ts) and is never driven by this flag.
   */
  warn?: boolean;
}

/**
 * Compact "3/10 ——— 32%" tile.
 *
 * Ratios are shown three ways at once — fraction, bar, percentage — because
 * each answers a different question: how many, how full, how close to done.
 * Only used for bounded values; a plain count belongs in MetricCard.
 */
export default function MiniStat({
  label,
  current,
  total,
  unit,
  hint,
  icon: Icon,
  onClick,
  warn,
}: MiniStatProps) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  const health = poolHealth(pct);
  // Over-capacity (current > total) is an objective fact about the ratio and
  // must escalate the same way poolHealth's `full` bucket does everywhere
  // else — it can't depend solely on the caller-supplied `warn` flag.
  const attention = warn || health === 'full';

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-text-secondary truncate">{label}</p>
        {Icon && <Icon size={14} className="text-text-placeholder shrink-0" />}
      </div>

      {/* Figure and meter travel together; only the label and hint are pinned
          to the tile's edges, so a stretched tile still reads as one block. */}
      <div>
        <p className={`display-num text-[27px] ${attention ? 'text-warning' : 'text-text'}`}>
          {current}
          {total > 0 && <span className="text-text-placeholder">/{total}</span>}
          {unit && <span className="text-[13px] font-semibold text-text-muted ml-1">{unit}</span>}
        </p>

        {total > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <div className="meter flex-1">
              <span
                style={{
                  width: `${pct}%`,
                  background: METER_FILL[health],
                }}
              />
            </div>
            <span
              className={`num text-[12px] font-bold shrink-0 ${attention ? 'text-warning' : 'text-text-muted'}`}
            >
              {pct}%
            </span>
          </div>
        )}
      </div>

      {hint && <p className="text-[12px] text-text-muted truncate">{hint}</p>}
    </>
  );

  const base = 'panel px-4 py-[15px] flex flex-col justify-between gap-3 w-full h-full text-left';
  if (!onClick) return <div className={base}>{body}</div>;

  return (
    <button type="button" onClick={onClick} className={`${base} panel-hover cursor-pointer`}>
      {body}
    </button>
  );
}
