import type { CatalogModule } from './types';

/**
 * Shared display formatting. Pages render these strings verbatim so the same
 * module or countdown reads identically on every screen.
 */

/** Canonical module display name:「名称（版本）」, e.g.「钢结构设计（商业版）」. */
export function moduleLabel(mod: Pick<CatalogModule, 'name' | 'edition'>): string {
  return `${mod.name}（${mod.edition}）`;
}

/** Expiry countdown copy, unified as「剩 N 天」. */
export function daysLeftLabel(days: number): string {
  return `剩 ${days} 天`;
}
