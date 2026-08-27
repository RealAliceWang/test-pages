import { createContext, useContext, useEffect, type ReactNode } from 'react';

/** Setter published by Layout so a page can mount content into the side rail. */
export const AsideSlotContext = createContext<((node: ReactNode) => void) | null>(null);

/**
 * Render `node` into the shell's right-hand rail for as long as this page is
 * mounted.
 *
 * `deps` controls when the rail re-renders. It is a raw dependency list rather
 * than `[node]` because a JSX element is a fresh object on every render, which
 * would loop forever.
 */
export function useAside(node: ReactNode, deps: unknown[]): void {
  const setAside = useContext(AsideSlotContext);

  useEffect(() => {
    if (!setAside) return;
    setAside(node);
    return () => setAside(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setAside, ...deps]);
}
