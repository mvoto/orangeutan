import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import type { PropsWithChildren } from 'react';

import type { Cell } from '@/engine';

import { levelSessionReducer, startingCells } from './level-session-state';
import type { LevelSessionState } from './level-session-state';

type LevelSession = {
  readonly cells: readonly Cell[];
  readonly cycle: (index: number) => void;
};

const LevelSessionContext = createContext<LevelSession | null>(null);

function createSession(): LevelSessionState {
  return { cells: startingCells() };
}

/** Placed Symbols live here so leaving Level 1 does not clear the grid. */
export function LevelSessionProvider({ children }: PropsWithChildren): React.JSX.Element {
  const [state, dispatch] = useReducer(levelSessionReducer, null, createSession);
  const cycle = useCallback((index: number) => {
    dispatch({ type: 'cycle', index });
  }, []);
  const session = useMemo(() => ({ cells: state.cells, cycle }), [state.cells, cycle]);

  return <LevelSessionContext.Provider value={session}>{children}</LevelSessionContext.Provider>;
}

export function useLevelSession(): LevelSession {
  const session = useContext(LevelSessionContext);
  if (session === null) {
    throw new Error('LevelSessionProvider is missing');
  }
  return session;
}
