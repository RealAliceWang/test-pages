interface Point {
  label: string;
  value: number;
}

interface ActivityChartProps {
  data: Point[];
  /** Index of the bar to emphasise. Defaults to the peak. */
  focusIndex?: number;
  /** Text shown in the bubble above the focused bar. */
  focusLabel?: string;
}

/**
 * Weekly activity bars with a single emphasised column.
 *
 * Deliberately hand-rolled rather than Recharts: at seven bars the library's
 * axes, margins and tooltip layer cost more than they add, and this gives
 * exact control over the highlighted bar and its bubble.
 */
export default function ActivityChart({ data, focusIndex, focusLabel }: ActivityChartProps) {
  const peak = Math.max(...data.map((d) => d.value), 1);
  const focus = focusIndex ?? data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);

  return (
    <div className="flex items-end justify-between gap-2 h-full min-h-[172px]" role="img"
      aria-label={`近 7 天活跃度，峰值出现在${data[focus]?.label}`}>
      {data.map((d, i) => {
        const active = i === focus;
        /* Floor at 12% so a zero day still shows a track rather than vanishing. */
        const height = Math.max(12, Math.round((d.value / peak) * 100));

        return (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-2.5 h-full justify-end">
            <div className="relative w-full flex-1 flex items-end justify-center">
              {active && focusLabel && (
                <span className="chip-signal absolute -top-1 left-1/2 -translate-x-1/2 num text-[11.5px] font-bold rounded-full px-2.5 py-[3px] whitespace-nowrap">
                  {focusLabel}
                </span>
              )}
              <div
                className="w-full max-w-[26px] rounded-full transition-all duration-500"
                style={{
                  height: `${height}%`,
                  background: active ? 'var(--color-signal)' : 'var(--color-surface-hover)',
                }}
              />
            </div>
            <span
              className={`text-[11.5px] ${active ? 'font-bold text-text' : 'font-medium text-text-placeholder'}`}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
