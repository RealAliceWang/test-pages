/**
 * Shared gradient and filter definitions for the glass icon set.
 *
 * Every icon draws from the same four ramps, so a row of them reads as one
 * family rather than four separate illustrations. Ids are namespaced with
 * `gi-` because these live in the document once and are referenced by url().
 */
export default function GlassDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
      <defs>
        {/* Body ramp: lit from the top-left, deepening toward the bottom-right. */}
        <linearGradient id="gi-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.18" />
        </linearGradient>

        {/* Front face: the panel that sits closest to the viewer. */}
        <linearGradient id="gi-face" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.42" />
        </linearGradient>

        {/* Back face: same shape pushed away, so it reads as depth not outline. */}
        <linearGradient id="gi-back" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.22" />
        </linearGradient>

        {/* Specular streak across the top-left shoulder of a form. */}
        <linearGradient id="gi-shine" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Soft contact shadow under raised parts. Kept tight so icons stay
            crisp at 18px, where a wide blur would just look like fog. */}
        <filter id="gi-drop" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0.7" stdDeviation="0.7" floodColor="#0B1020" floodOpacity="0.28" />
        </filter>
      </defs>
    </svg>
  );
}
