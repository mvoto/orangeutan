import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import type { PropsWithChildren } from 'react';

import { isSolved, levelOne } from '@/engine';
import type { Cell, Puzzle } from '@/engine';

import { levelSessionReducer, startingState } from './level-session-state';
import type { LevelSessionState } from './level-session-state';

type LevelSession = {
  readonly puzzle: Puzzle;
  readonly cells: readonly Cell[];
  readonly solved: boolean;
  /** True only when Level 1 is solved. Level 2's ending is a later Level. */
  readonly celebrate: boolean;
  readonly cycle: (index: number) => void;
  readonly advance: () => void;
};

const LevelSessionContext = createContext<LevelSession | null>(null);

function createSession(): LevelSessionState {
  return startingState();
}

/** Placed Symbols live here so leaving Level 1 does not clear the grid. */
export function LevelSessionProvider({ children }: PropsWithChildren): React.JSX.Element {
  const [state, dispatch] = useReducer(levelSessionReducer, null, createSession);
  const cycle = useCallback((index: number) => {
    dispatch({ type: 'cycle', index });
  }, []);
  const advance = useCallback(() => {
    dispatch({ type: 'advance' });
  }, []);
  const solved = isSolved(state.puzzle, state.cells);
  const celebrate = solved && state.puzzle === levelOne;
  const session = useMemo(
    () => ({ puzzle: state.puzzle, cells: state.cells, solved, celebrate, cycle, advance }),
    [state.puzzle, state.cells, solved, celebrate, cycle, advance],
  );

  return <LevelSessionContext.Provider value={session}>{children}</LevelSessionContext.Provider>;
}

export function useLevelSession(): LevelSession {
  const session = useContext(LevelSessionContext);
  if (session === null) {
    throw new Error('LevelSessionProvider is missing');
  }
  return session;
}
