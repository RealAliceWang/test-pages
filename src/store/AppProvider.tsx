import { useMemo, useReducer, type ReactNode } from 'react';
import { AppContext, type AppContextValue } from './context';
import { deptOf, initialState, memberOf, orgOf, reducer, type AppState } from './appState';

/**
 * Dev-only session presets, both driven from the query string:
 *   ?as=<memberId>  boot as that member
 *   ?logout=1       boot signed out, so /login and /register are reachable
 *
 * The store is in-memory, so the identity switcher is normally the only way to
 * change roles — which external tools (screenshot runners, the Figma capture
 * service) cannot drive, since they open a URL in their own browser session.
 * The seeded session also boots authed, so RequireAuth redirects the pre-auth
 * routes to the workbench unless `logout` is set.
 * Gated on import.meta.env.DEV so production always boots the seeded default.
 */
function bootState(base: AppState): AppState {
  if (!import.meta.env.DEV || typeof window === 'undefined') return base;

  const params = new URLSearchParams(window.location.search);
  let next = base;

  const id = params.get('as');
  if (id) {
    const member = memberOf(base, id);
    if (member) next = { ...next, currentMemberId: member.id, authed: true };
    else console.warn(`[dev] ?as=${id} does not match a seeded member; ignoring.`);
  }

  if (params.get('logout') === '1') next = { ...next, authed: false };

  return next;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, bootState);

  const value = useMemo<AppContextValue>(() => {
    const me = memberOf(state, state.currentMemberId)!;
    return {
      state,
      me,
      myOrg: orgOf(state, me.orgId)!,
      myDept: deptOf(state, me.deptId),
      dispatch,
    };
  }, [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
