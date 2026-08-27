interface RingProgressProps {
  /** 0–100. Values outside the range are clamped. */
  value: number;
  size?: number;
  thickness?: number;
  /** Ring colour. Defaults to the signal blue. */
  color?: string;
  /** Track colour behind the ring. */
  track?: string;
  /** Centre content. Defaults to the rounded percentage. */
  label?: React.ReactNode;
  /** Announced to screen readers, e.g. "席位利用率". */
  caption?: string;
}

/**
 * Circular progress dial.
 *
 * A ring states "how full is this" far faster than a bar plus a fraction,
 * which is why the reference dashboards lead with them. Used for bounded
 * ratios only (utilisation, completion) — never for unbounded counts.
 *
 * Drawn with stroke-dasharray on a rotated circle so the fill animates
 * without any layout work.
 */
export default function RingProgress({
  value,
  size = 96,
  thickness = 9,
  color = 'var(--color-signal)',
  track = 'var(--color-surface-hover)',
  label,
  caption,
}: RingProgressProps) {
  const pct = Math.min(100, Math.max(0, value));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${caption ? `${caption}：` : ''}${Math.round(pct)}%`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={track}
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (pct / 100) * circumference}
          style={{ transition: 'stroke-dashoffset 700ms var(--ease-fluid)' }}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        {label ?? (
          <span className="display-num text-text" style={{ fontSize: size * 0.26 }}>
            {Math.round(pct)}%
          </span>
        )}
      </div>
    </div>
  );
}
