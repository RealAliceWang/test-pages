import type { SVGProps } from 'react';

/**
 * Hand-drawn icon set for the KPI tiles.
 *
 * Built the way the reference art is: a pale frosted plate at the back, a
 * solid saturated body on top, a gloss streak on its lit shoulder. The body is
 * opaque on purpose — an earlier pass drew it as translucent white over a
 * light plate and the set greyed out into an unreadable smudge at 24px.
 *
 * Depth comes from `currentColor` at three opacities rather than from shared
 * gradients: a gradient in a common <defs> resolves `currentColor` against the
 * element hosting the defs, not against each icon, so every shape came out
 * black. Flat fills keep each icon in its own tile's hue.
 */

type P = SVGProps<SVGSVGElement>;

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true,
  focusable: 'false',
} as const;

/** Rounded frosted plate every icon sits on, matching the reference art. */
function Plate() {
  return (
    <>
      <rect x="1.5" y="1.5" width="21" height="21" rx="6.5" fill="currentColor" fillOpacity="0.14" />
      <rect
        x="2.1"
        y="2.1"
        width="19.8"
        height="19.8"
        rx="6"
        stroke="#FFFFFF"
        strokeOpacity="0.55"
        strokeWidth="0.8"
        fill="none"
      />
    </>
  );
}

/** Stacked modules — the catalogue, a shelf of things. */
export function GlassBoxes(p: P) {
  return (
    <svg {...base} {...p}>
      <Plate />
      <rect x="5" y="9.4" width="8.6" height="8.2" rx="2.1" fill="currentColor" fillOpacity="0.55" />
      <g>
        <rect x="9.6" y="6.2" width="9.4" height="8.8" rx="2.3" fill="currentColor" />
      </g>
      <path d="M11.3 7.5h6a1.1 1.1 0 0 1 1.1 1.1v.5c-2.7-.5-5.5-.6-8.2-.2v-.3a1.1 1.1 0 0 1 1.1-1.1Z" fill="#FFFFFF" fillOpacity="0.4" />
      <circle cx="14.3" cy="10.6" r="1.35" fill="#FFFFFF" fillOpacity="0.9" />
    </svg>
  );
}

/** A sealed, checked package — something already provisioned. */
export function GlassPackageCheck(p: P) {
  return (
    <svg {...base} {...p}>
      <Plate />
      <path d="M12 5.2 18.6 8.2v6.6L12 18 5.4 14.8V8.2L12 5.2Z" fill="currentColor" fillOpacity="0.55" />
      <g>
        <path d="M12 5.2 18.6 8.2 12 11.2 5.4 8.2 12 5.2Z" fill="currentColor" />
      </g>
      <path d="M12 11.2v6.8l6.6-3.2V8.2L12 11.2Z" fill="currentColor" fillOpacity="0.75" />
      <path d="M9.4 12.9l1.9 1.8 3.6-3.5" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Key — a seat, an entitlement to use something. */
export function GlassKey(p: P) {
  return (
    <svg {...base} {...p}>
      <Plate />
      <path d="M12.4 12.2 17.4 17.2" stroke="currentColor" strokeOpacity="0.55" strokeWidth="3.4" strokeLinecap="round" />
      <g>
        <circle cx="9.6" cy="9.6" r="4.4" fill="currentColor" />
      </g>
      <circle cx="9.6" cy="9.6" r="1.7" fill="#FFFFFF" fillOpacity="0.92" />
      <path d="M15.4 16.4l1.3-1.3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.9" />
      <path d="M7.2 7.1a3.6 3.6 0 0 1 2.5-1.1" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.75" />
    </svg>
  );
}

/** Wallet — money leaving or arriving. */
export function GlassWallet(p: P) {
  return (
    <svg {...base} {...p}>
      <Plate />
      <g>
        <rect x="4.6" y="7.4" width="14.8" height="10" rx="2.6" fill="currentColor" />
      </g>
      <path d="M6.8 8.6h9.4a1.3 1.3 0 0 1 1.3 1.3v.3c-3.7-.7-7.8-.8-11.9-.2v-.1A1.3 1.3 0 0 1 6.8 8.6Z" fill="#FFFFFF" fillOpacity="0.4" />
      <path d="M13.6 10.9h5.8v3.6h-5.8a1.8 1.8 0 0 1 0-3.6Z" fill="#FFFFFF" fillOpacity="0.9" />
      <circle cx="15" cy="12.7" r="1.1" fill="currentColor" />
    </svg>
  );
}

/** People — members, headcount. */
export function GlassUsers(p: P) {
  return (
    <svg {...base} {...p}>
      <Plate />
      <circle cx="15.6" cy="9.4" r="2.5" fill="currentColor" fillOpacity="0.55" />
      <path d="M11.6 17.6c.4-2.4 2.1-3.8 4.1-3.8s3.4 1.3 3.7 3.4c.1.5-.3.8-.7.8h-6.4c-.5 0-.8-.2-.7-.4Z" fill="currentColor" fillOpacity="0.55" />
      <g>
        <circle cx="9.4" cy="8.9" r="3.3" fill="currentColor" />
        <path d="M4.2 17.4c.3-2.9 2.5-4.6 5.2-4.6s4.9 1.7 5.2 4.6c.1.6-.3 1-.9 1H5.1c-.6 0-1-.4-.9-1Z" fill="currentColor" />
      </g>
      <path d="M7.5 7a2.9 2.9 0 0 1 2.2-.9" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.8" />
    </svg>
  );
}

/** Clock — time running out, or a window of days. */
export function GlassClock(p: P) {
  return (
    <svg {...base} {...p}>
      <Plate />
      <g>
        <circle cx="12" cy="12" r="7" fill="currentColor" />
      </g>
      <circle cx="12" cy="12" r="4.8" fill="#FFFFFF" fillOpacity="0.22" />
      <path d="M12 8.2V12l2.6 1.6" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.6 7.6a6 6 0 0 1 2.8-1.8" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.75" />
    </svg>
  );
}

/** Warning — something needs attention now. */
export function GlassAlert(p: P) {
  return (
    <svg {...base} {...p}>
      <Plate />
      <g>
        <path d="M13.2 5.9l5.6 9.7c.6 1-.1 2.2-1.2 2.2H6.4c-1.1 0-1.8-1.2-1.2-2.2l5.6-9.7a1.4 1.4 0 0 1 2.4 0Z" fill="currentColor" />
      </g>
      <path d="M12 8.6v4" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="12" cy="15.3" r="1.1" fill="#FFFFFF" />
      <path d="M11.2 7.4l-3 5.2" stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.4" />
    </svg>
  );
}

/** Receipt — an order, a billing record. */
export function GlassReceipt(p: P) {
  return (
    <svg {...base} {...p}>
      <Plate />
      <g>
        <path d="M7 5.4h10c.7 0 1.2.5 1.2 1.2v11.6c0 .5-.5.8-.9.5l-1.3-.9-1.4 1c-.2.2-.5.2-.8 0l-1.4-1-1.4 1c-.2.2-.5.2-.8 0l-1.4-1-1.2.9c-.4.3-.9 0-.9-.5V6.6c0-.7.5-1.2 1.2-1.2Z" fill="currentColor" />
      </g>
      <path d="M7.4 6.6h9.2v1.2c-3-.5-6.1-.5-9.2-.1V6.6Z" fill="#FFFFFF" fillOpacity="0.4" />
      <path d="M8.8 10.4h6.4M8.8 13.2h4.4" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Building — a customer organization. */
export function GlassBuilding(p: P) {
  return (
    <svg {...base} {...p}>
      <Plate />
      <rect x="12.4" y="8.6" width="6.6" height="9.8" rx="1.5" fill="currentColor" fillOpacity="0.55" />
      <g>
        <rect x="5" y="5.2" width="8.4" height="13.2" rx="1.9" fill="currentColor" />
      </g>
      <path d="M6.6 6.3h5.2a.9.9 0 0 1 .9.9v.5c-2.2-.3-4.6-.3-6.9 0v-.5a.9.9 0 0 1 .8-.9Z" fill="#FFFFFF" fillOpacity="0.4" />
      <g fill="#FFFFFF" fillOpacity="0.9">
        <rect x="7" y="9.1" width="1.7" height="1.7" rx="0.5" />
        <rect x="9.8" y="9.1" width="1.7" height="1.7" rx="0.5" />
        <rect x="7" y="12.2" width="1.7" height="1.7" rx="0.5" />
        <rect x="9.8" y="12.2" width="1.7" height="1.7" rx="0.5" />
      </g>
      <rect x="14.6" y="11.4" width="2.2" height="1.7" rx="0.5" fill="#FFFFFF" fillOpacity="0.75" />
    </svg>
  );
}

/** Shield check — verified, approved, trustworthy. */
export function GlassVerified(p: P) {
  return (
    <svg {...base} {...p}>
      <Plate />
      <g>
        <path d="M12 4.8l5.6 2.1v4.6c0 3.4-2.3 6.4-5.6 7.4-3.3-1-5.6-4-5.6-7.4V6.9L12 4.8Z" fill="currentColor" />
      </g>
      <path d="M12 4.8v6.4c-1.7.3-3.4.8-5.1 1.4a8 8 0 0 1-.5-1.1V6.9L12 4.8Z" fill="#FFFFFF" fillOpacity="0.18" />
      <path d="M9.6 11.9l1.9 1.9 3.4-3.5" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Globe — platform-wide, cross-tenant scope. */
export function GlassGlobe(p: P) {
  return (
    <svg {...base} {...p}>
      <Plate />
      <g>
        <circle cx="12" cy="12" r="7" fill="currentColor" />
      </g>
      <g stroke="#FFFFFF" strokeWidth="1.35" fill="none" strokeOpacity="0.92">
        <path d="M5 12h14" strokeLinecap="round" />
        <path d="M12 5c1.9 1.9 2.9 4.4 2.9 7s-1 5.1-2.9 7c-1.9-1.9-2.9-4.4-2.9-7S10.1 6.9 12 5Z" />
      </g>
      <path d="M7.6 7.6a6 6 0 0 1 2.8-1.8" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />
    </svg>
  );
}
