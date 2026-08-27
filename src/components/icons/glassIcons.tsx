import type { SVGProps } from 'react';

/**
 * Hand-drawn glass icon set for the KPI tiles.
 *
 * Lucide is a 2px stroke set: it cannot carry the layered, lit look these
 * tiles want, so these dozen shapes are drawn as filled forms instead. Each
 * one is built the same way — a receding back plane, a lit front face, then a
 * specular streak — which is what makes them read as one family.
 *
 * Everything is painted in `currentColor` with white gradient overlays, so an
 * icon takes the tone colour of whatever tile it sits in.
 */

type P = SVGProps<SVGSVGElement>;

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true,
  focusable: 'false',
} as const;

/** Stacked modules — the catalogue, a shelf of things. */
export function GlassBoxes(p: P) {
  return (
    <svg {...base} {...p}>
      <rect x="3" y="7.5" width="11" height="10" rx="2.6" fill="currentColor" opacity="0.42" />
      <rect x="3" y="7.5" width="11" height="10" rx="2.6" fill="url(#gi-back)" />
      <g filter="url(#gi-drop)">
        <rect x="9" y="4.5" width="12" height="11" rx="2.8" fill="currentColor" />
        <rect x="9" y="4.5" width="12" height="11" rx="2.8" fill="url(#gi-face)" />
      </g>
      <path d="M10.6 6.1h8.8a1.2 1.2 0 0 1 1.2 1.2v1.1c-3.6-.5-7.4-.6-11.2-.3V7.3a1.2 1.2 0 0 1 1.2-1.2Z" fill="url(#gi-shine)" />
      <circle cx="15" cy="10.6" r="1.5" fill="#FFFFFF" opacity="0.85" />
    </svg>
  );
}

/** A sealed, checked package — something already provisioned. */
export function GlassPackageCheck(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3.2 20.4 7v9.4L12 20.6 3.6 16.4V7L12 3.2Z" fill="currentColor" opacity="0.4" />
      <g filter="url(#gi-drop)">
        <path d="M12 3.2 20.4 7 12 11 3.6 7 12 3.2Z" fill="currentColor" />
        <path d="M12 3.2 20.4 7 12 11 3.6 7 12 3.2Z" fill="url(#gi-body)" />
      </g>
      <path d="M12 11v9.6l8.4-4.2V7L12 11Z" fill="currentColor" opacity="0.62" />
      <path d="M12 11v9.6L3.6 16.4V7L12 11Z" fill="url(#gi-back)" />
      <path d="M8.6 12.9l2.4 2.3 4.6-4.4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.92" />
    </svg>
  );
}

/** Key — a seat, an entitlement to use something. */
export function GlassKey(p: P) {
  return (
    <svg {...base} {...p}>
      <g filter="url(#gi-drop)">
        <circle cx="8.6" cy="8.6" r="5.4" fill="currentColor" />
        <circle cx="8.6" cy="8.6" r="5.4" fill="url(#gi-body)" />
      </g>
      <circle cx="8.6" cy="8.6" r="2.1" fill="#FFFFFF" opacity="0.9" />
      <path d="M12.3 12.3 19 19" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M12.3 12.3 19 19" stroke="url(#gi-face)" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M16.4 18.2l1.5-1.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      <path d="M5.6 5.2a4.6 4.6 0 0 1 3.4-1.4" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

/** Wallet — money leaving or arriving. */
export function GlassWallet(p: P) {
  return (
    <svg {...base} {...p}>
      <rect x="2.8" y="6" width="18.4" height="13" rx="3.2" fill="currentColor" opacity="0.42" />
      <g filter="url(#gi-drop)">
        <rect x="2.8" y="6" width="18.4" height="13" rx="3.2" fill="currentColor" />
        <rect x="2.8" y="6" width="18.4" height="13" rx="3.2" fill="url(#gi-face)" />
      </g>
      <path d="M6 7.6h12a1.6 1.6 0 0 1 1.6 1.6v.5c-4.6-.9-9.6-1-14.6-.2v-.3A1.6 1.6 0 0 1 6 7.6Z" fill="url(#gi-shine)" />
      <path d="M15 11.4h6.2v4.2H15a2.1 2.1 0 0 1 0-4.2Z" fill="currentColor" />
      <path d="M15 11.4h6.2v4.2H15a2.1 2.1 0 0 1 0-4.2Z" fill="url(#gi-back)" />
      <circle cx="16.4" cy="13.5" r="1.25" fill="#FFFFFF" opacity="0.92" />
    </svg>
  );
}

/** People — members, headcount. */
export function GlassUsers(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="16.6" cy="8.4" r="3.1" fill="currentColor" opacity="0.45" />
      <path d="M11.8 19.4c.5-2.9 2.6-4.6 5.1-4.6s4.2 1.6 4.5 4.2c.1.6-.3.9-.8.9h-8c-.5 0-.9-.2-.8-.5Z" fill="currentColor" opacity="0.45" />
      <g filter="url(#gi-drop)">
        <circle cx="9.3" cy="7.9" r="3.9" fill="currentColor" />
        <circle cx="9.3" cy="7.9" r="3.9" fill="url(#gi-body)" />
        <path d="M2.9 19.1c.4-3.5 3-5.6 6.4-5.6s6 2.1 6.4 5.6c.1.7-.4 1.2-1.1 1.2H4c-.7 0-1.2-.5-1.1-1.2Z" fill="currentColor" />
        <path d="M2.9 19.1c.4-3.5 3-5.6 6.4-5.6s6 2.1 6.4 5.6c.1.7-.4 1.2-1.1 1.2H4c-.7 0-1.2-.5-1.1-1.2Z" fill="url(#gi-face)" />
      </g>
      <path d="M7 5.6a3.4 3.4 0 0 1 2.6-1.1" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

/** Clock — time running out, or a window of days. */
export function GlassClock(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9.2" fill="currentColor" opacity="0.4" />
      <g filter="url(#gi-drop)">
        <circle cx="12" cy="12" r="9.2" fill="currentColor" />
        <circle cx="12" cy="12" r="9.2" fill="url(#gi-body)" />
      </g>
      <circle cx="12" cy="12" r="6.4" fill="#FFFFFF" opacity="0.28" />
      <path d="M12 7.4V12l3.3 2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
      <path d="M6.6 6.4a7.6 7.6 0 0 1 3.6-2.3" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

/** Warning — something needs attention now. */
export function GlassAlert(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M13.7 3.6l7.7 13.3c.8 1.3-.2 3-1.7 3H4.3c-1.5 0-2.5-1.7-1.7-3L10.3 3.6c.8-1.3 2.6-1.3 3.4 0Z" fill="currentColor" opacity="0.42" />
      <g filter="url(#gi-drop)">
        <path d="M13.4 4.3l7.3 12.6c.7 1.2-.2 2.7-1.6 2.7H4.9c-1.4 0-2.3-1.5-1.6-2.7L10.6 4.3a1.6 1.6 0 0 1 2.8 0Z" fill="currentColor" />
        <path d="M13.4 4.3l7.3 12.6c.7 1.2-.2 2.7-1.6 2.7H4.9c-1.4 0-2.3-1.5-1.6-2.7L10.6 4.3a1.6 1.6 0 0 1 2.8 0Z" fill="url(#gi-body)" />
      </g>
      <path d="M12 8.4v4.4" stroke="#FFFFFF" strokeWidth="2.1" strokeLinecap="round" opacity="0.95" />
      <circle cx="12" cy="16.2" r="1.25" fill="#FFFFFF" opacity="0.95" />
    </svg>
  );
}

/** Receipt — an order, a billing record. */
export function GlassReceipt(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M6.4 2.8h11.2c.9 0 1.6.7 1.6 1.6v16.2c0 .6-.7 1-1.2.6l-1.8-1.3-1.9 1.4c-.3.2-.7.2-1 0l-1.9-1.4-1.9 1.4c-.3.2-.7.2-1 0l-1.8-1.4-1.7 1.3c-.5.4-1.2 0-1.2-.6V4.4c0-.9.7-1.6 1.6-1.6Z" fill="currentColor" opacity="0.4" />
      <g filter="url(#gi-drop)">
        <path d="M6.8 3.2h10.4c.8 0 1.4.6 1.4 1.4v15.1c0 .6-.6.9-1.1.6l-1.6-1.1-1.7 1.2c-.3.2-.7.2-.9 0l-1.7-1.2-1.7 1.2c-.3.2-.7.2-.9 0L7.3 19.2l-1.5 1.1c-.5.3-1.1 0-1.1-.6V4.6c0-.8.6-1.4 1.4-1.4Z" fill="currentColor" />
        <path d="M6.8 3.2h10.4c.8 0 1.4.6 1.4 1.4v15.1c0 .6-.6.9-1.1.6l-1.6-1.1-1.7 1.2c-.3.2-.7.2-.9 0l-1.7-1.2-1.7 1.2c-.3.2-.7.2-.9 0L7.3 19.2l-1.5 1.1c-.5.3-1.1 0-1.1-.6V4.6c0-.8.6-1.4 1.4-1.4Z" fill="url(#gi-face)" />
      </g>
      <path d="M6.9 4.6h10.2v1.5c-3.4-.6-6.9-.6-10.2-.1V4.6Z" fill="url(#gi-shine)" />
      <path d="M8 9.2h8M8 12.4h5.6" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

/** Building — a customer organization. */
export function GlassBuilding(p: P) {
  return (
    <svg {...base} {...p}>
      <rect x="12" y="7" width="9" height="14" rx="1.8" fill="currentColor" opacity="0.44" />
      <rect x="12" y="7" width="9" height="14" rx="1.8" fill="url(#gi-back)" />
      <g filter="url(#gi-drop)">
        <rect x="3.2" y="3" width="10.6" height="18" rx="2.2" fill="currentColor" />
        <rect x="3.2" y="3" width="10.6" height="18" rx="2.2" fill="url(#gi-face)" />
      </g>
      <path d="M5.4 4.4h6.2a1 1 0 0 1 1 1v.8c-2.7-.4-5.6-.4-8.2 0v-.8a1 1 0 0 1 1-1Z" fill="url(#gi-shine)" />
      <g fill="#FFFFFF" opacity="0.88">
        <rect x="5.9" y="7.6" width="2" height="2" rx="0.6" />
        <rect x="9.3" y="7.6" width="2" height="2" rx="0.6" />
        <rect x="5.9" y="11.4" width="2" height="2" rx="0.6" />
        <rect x="9.3" y="11.4" width="2" height="2" rx="0.6" />
      </g>
      <rect x="15.2" y="10.6" width="2.6" height="2" rx="0.6" fill="#FFFFFF" opacity="0.7" />
    </svg>
  );
}

/** Shield check — verified, approved, trustworthy. */
export function GlassVerified(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 2.4l7.6 2.9v6.2c0 4.6-3.1 8.6-7.6 10-4.5-1.4-7.6-5.4-7.6-10V5.3L12 2.4Z" fill="currentColor" opacity="0.42" />
      <g filter="url(#gi-drop)">
        <path d="M12 3l7 2.7v5.6c0 4.2-2.8 7.9-7 9.2-4.2-1.3-7-5-7-9.2V5.7L12 3Z" fill="currentColor" />
        <path d="M12 3l7 2.7v5.6c0 4.2-2.8 7.9-7 9.2-4.2-1.3-7-5-7-9.2V5.7L12 3Z" fill="url(#gi-body)" />
      </g>
      <path d="M6.6 6.6L12 4.5v7.8c-2 .4-4 .9-6 1.6-.3-.9-.4-1.8-.4-2.6V6.6h1Z" fill="#FFFFFF" opacity="0.2" />
      <path d="M8.7 11.9l2.3 2.3 4.3-4.4" stroke="#FFFFFF" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
    </svg>
  );
}

/** Globe — platform-wide, cross-tenant scope. */
export function GlassGlobe(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9.2" fill="currentColor" opacity="0.4" />
      <g filter="url(#gi-drop)">
        <circle cx="12" cy="12" r="9.2" fill="currentColor" />
        <circle cx="12" cy="12" r="9.2" fill="url(#gi-body)" />
      </g>
      <g stroke="#FFFFFF" strokeWidth="1.5" opacity="0.85" fill="none">
        <path d="M2.8 12h18.4" strokeLinecap="round" />
        <path d="M12 2.8c2.4 2.5 3.7 5.7 3.7 9.2s-1.3 6.7-3.7 9.2c-2.4-2.5-3.7-5.7-3.7-9.2S9.6 5.3 12 2.8Z" />
      </g>
      <path d="M5.4 6.2a8.4 8.4 0 0 1 4.2-2.7" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}
