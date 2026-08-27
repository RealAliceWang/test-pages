import type { LucideIcon } from 'lucide-react';

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
  /** Amber fill instead of the signal blue, for ratios that need attention. */
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

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12.5px] font-semibold text-text-secondary truncate">{label}</p>
        {Icon && <Icon size={14} className="text-text-placeholder shrink-0" />}
      </div>

      {/* Figure and meter travel together; only the label and hint are pinned
          to the tile's edges, so a stretched tile still reads as one block. */}
      <div>
        <p className="display-num text-[30px] text-text">
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
                  background: warn ? 'var(--color-warning-light)' : 'var(--color-signal)',
                }}
              />
            </div>
            <span className="num text-[11.5px] font-bold text-text-muted shrink-0">{pct}%</span>
          </div>
        )}
      </div>

      {hint && <p className="text-[11.5px] text-text-muted truncate">{hint}</p>}
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
