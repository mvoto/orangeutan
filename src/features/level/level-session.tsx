import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import type { PropsWithChildren } from 'react';

import { isSolved } from '@/engine';
import type { Cell, Puzzle } from '@/engine';
import type { SaveStore } from '@/services/save-store';

import { levelSessionReducer, startingState } from './level-session-state';
import type { LevelSessionAction, LevelSessionState } from './level-session-state';
import { encodeSave, openSave } from './save';
import { levelNumber, nextLevel } from './sequence';

type StoredSession = LevelSessionState & { readonly preserveDocument: boolean };

type LevelSession = {
  readonly puzzle: Puzzle;
  readonly cells: readonly Cell[];
  readonly solved: boolean;
  /** True when the current Puzzle is solved. The Celebration is the only way forward. */
  readonly celebrate: boolean;
  /** True when the solved Puzzle is the last Level. */
  readonly finished: boolean;
  /** How many Levels are solved. Present only when every Level is solved. */
  readonly score: number | null;
  /** 1-based place of the open Puzzle in the sequence. */
  readonly level: number;
  readonly cycle: (index: number) => void;
  readonly advance: () => void;
};

const LevelSessionContext = createContext<LevelSession | null>(null);

function readSession(store: SaveStore): StoredSession {
  try {
    const opened = openSave(store.read());
    return { ...opened.state, preserveDocument: opened.preserveDocument };
  } catch {
    return { ...startingState(), preserveDocument: false };
  }
}

function storedSessionReducer(state: StoredSession, action: LevelSessionAction): StoredSession {
  return { ...levelSessionReducer(state, action), preserveDocument: state.preserveDocument };
}

/** Placed Symbols live here so leaving the app does not clear the grid. */
export function LevelSessionProvider({
  children,
  store,
}: PropsWithChildren<{ readonly store: SaveStore }>): React.JSX.Element {
  const [state, dispatch] = useReducer(storedSessionReducer, store, readSession);

  useEffect(() => {
    if (state.preserveDocument) return;
    try {
      store.write(encodeSave(state));
    } catch {
      // The session keeps running when the device cannot store it.
    }
  }, [state, store]);
  const cycle = useCallback((index: number) => {
    dispatch({ type: 'cycle', index });
  }, []);
  const advance = useCallback(() => {
    dispatch({ type: 'advance' });
  }, []);
  const solved = isSolved(state.puzzle, state.cells);
  const finished = solved && nextLevel(state.puzzle) === null;
  const celebrate = solved;
  const level = levelNumber(state.puzzle);
  const score = finished ? level : null;
  const session = useMemo(
    () => ({
      puzzle: state.puzzle,
      cells: state.cells,
      solved,
      celebrate,
      finished,
      score,
      level,
      cycle,
      advance,
    }),
    [state.puzzle, state.cells, solved, celebrate, finished, score, level, cycle, advance],
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
