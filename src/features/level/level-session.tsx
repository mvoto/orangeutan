import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { cycleCell, levelOne } from '@/engine';
import type { Cell } from '@/engine';

type LevelSession = {
  readonly cells: readonly Cell[];
  readonly cycle: (index: number) => void;
};

const LevelSessionContext = createContext<LevelSession | null>(null);

function startingCells(): Cell[] {
  return levelOne.givens.map((given): Cell => given ?? 'empty');
}

/** Placed Symbols live here so leaving Level 1 does not clear the grid. */
export function LevelSessionProvider({ children }: PropsWithChildren): React.JSX.Element {
  const [cells, setCells] = useState<readonly Cell[]>(startingCells);
  const cycle = useCallback((index: number) => {
    setCells((current) => cycleCell(levelOne, current, index));
  }, []);
  const session = useMemo(() => ({ cells, cycle }), [cells, cycle]);

  return <LevelSessionContext.Provider value={session}>{children}</LevelSessionContext.Provider>;
}

export function useLevelSession(): LevelSession {
  const session = useContext(LevelSessionContext);
  if (session === null) {
    throw new Error('LevelSessionProvider is missing');
  }
  return session;
}
