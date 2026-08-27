import type { CSSProperties, ReactElement } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle, BadgeCheck, Box, Boxes, Building2, CalendarDays, CircleCheck,
  Clock, Coins, CreditCard, Crown, Globe, History, KeyRound, PackageCheck,
  Receipt, Ticket, UserCheck, UserCog, UserMinus, UserPlus, UserX, Users, Wallet,
} from 'lucide-react';
import {
  GlassAlert, GlassBoxes, GlassBuilding, GlassClock, GlassGlobe, GlassKey,
  GlassPackageCheck, GlassReceipt, GlassUsers, GlassVerified, GlassWallet,
} from './glassIcons';

type GlassIcon = (p: { className?: string; style?: CSSProperties }) => ReactElement;

/**
 * Which glass shape stands in for each lucide icon on a KPI tile.
 *
 * Drawing all 24 lucide icons this way would be a lot of hand-tuned SVG for
 * very little gain, so near-synonyms share a shape: every "a person" metric
 * takes the same figure, every "money" metric the same wallet. What matters at
 * 18px is the silhouette, and these groups already share one.
 *
 * Anything without an entry keeps its lucide original — that is the intended
 * fallback, not a gap.
 */
const glassFor = new Map<LucideIcon, GlassIcon>([
  // Catalogue and inventory
  [Boxes, GlassBoxes],
  [Box, GlassBoxes],
  [PackageCheck, GlassPackageCheck],
  [Ticket, GlassPackageCheck],
  [CircleCheck, GlassPackageCheck],

  // Seats and entitlements
  [KeyRound, GlassKey],
  [UserPlus, GlassKey],

  // Money
  [Wallet, GlassWallet],
  [Coins, GlassWallet],
  [CreditCard, GlassWallet],
  [Receipt, GlassReceipt],

  // People
  [Users, GlassUsers],
  [UserCheck, GlassUsers],
  [UserCog, GlassUsers],
  [UserMinus, GlassUsers],
  [UserX, GlassUsers],

  // Time
  [Clock, GlassClock],
  [CalendarDays, GlassClock],
  [History, GlassClock],

  // States and scope
  [AlertTriangle, GlassAlert],
  [BadgeCheck, GlassVerified],
  [Crown, GlassVerified],
  [Building2, GlassBuilding],
  [Globe, GlassGlobe],
]);

export function glassIconFor(icon: LucideIcon): GlassIcon | undefined {
  return glassFor.get(icon);
}
