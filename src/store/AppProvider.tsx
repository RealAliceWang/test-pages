import { useMemo, useReducer, type ReactNode } from 'react';
import { AppContext, type AppContextValue } from './context';
import { deptOf, initialState, memberOf, orgOf, reducer } from './appState';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

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
