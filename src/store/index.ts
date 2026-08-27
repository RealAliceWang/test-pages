/**
 * Single entry point for the store.
 *
 * Pure state logic lives in `appState.ts` (no React); the context, provider and
 * hook are split across `context.ts`, `AppProvider.tsx` and `useApp.ts` so that
 * each module has a single kind of export. Consumers import from here, so the
 * split stays an internal detail.
 */

export * from './appState';
export type { AppContextValue } from './context';
export { AppProvider } from './AppProvider';
export { useApp } from './useApp';
