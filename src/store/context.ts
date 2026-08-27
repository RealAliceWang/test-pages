import { createContext, type Dispatch } from 'react';
import type { Department, Member, Organization } from '../domain/types';
import type { Action, AppState } from './appState';

export interface AppContextValue {
  state: AppState;
  /** The signed-in member. */
  me: Member;
  myOrg: Organization;
  myDept?: Department;
  dispatch: Dispatch<Action>;
}

export const AppContext = createContext<AppContextValue | null>(null);
