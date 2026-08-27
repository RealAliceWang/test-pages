/**
 * Design tokens that must be readable from TypeScript.
 *
 * Recharts renders to SVG and cannot resolve CSS custom properties, so chart
 * colours have to exist as literals somewhere. Keeping that single set here —
 * rather than inline in each page — is what stops charts from drifting into
 * their own palette. Everything else in the product should use the CSS
 * variables in index.css instead of importing from this file.
 */

export const chart = {
  /** The measure being emphasised. Matches --color-signal (light blue). */
  signal: '#7DD3FC',
  /** Primary data series. Matches --color-ink. */
  primary: '#1C1F28',
  /** Secondary/comparison series. Matches --color-primary. */
  secondary: '#2F6BFF',
  positive: '#10B981',
  attention: '#F59E0B',
  negative: '#EF4444',
  /** Axis ticks, grid lines, and other non-data chrome. */
  grid: '#E9EBEF',
  axis: '#9CA3AF',
} as const;

/**
 * Categorical series palette, ordered by visual priority.
 *
 * Ink leads, so a single-series chart is monochrome and the signal tint stays
 * reserved for the value being emphasised rather than becoming just another
 * category colour. Amber sits between the two blues so neighbouring slices
 * never read as one hue. Charts with more than six categories should aggregate
 * rather than extend this list.
 */
export const chartSeries = [
  '#1C1F28',
  '#7DD3FC',
  '#F59E0B',
  '#2F6BFF',
  '#10B981',
  '#8B5CF6',
] as const;

/** Shared Recharts tooltip surface, matching .panel-floating. */
export const chartTooltip = {
  background: '#FFFFFF',
  border: '1px solid rgba(10,12,16,0.06)',
  borderRadius: 16,
  boxShadow: '0 2px 6px rgba(10,12,16,0.05), 0 20px 44px -20px rgba(10,12,16,0.22)',
  fontSize: 13,
  padding: '10px 14px',
} as const;
