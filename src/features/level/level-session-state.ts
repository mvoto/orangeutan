import { cycleCell, levelOne } from '@/engine';
import type { Cell } from '@/engine';

export type LevelSessionState = {
  readonly cells: readonly Cell[];
};

export type LevelSessionAction = {
  readonly type: 'cycle';
  readonly index: number;
};

export function startingCells(): readonly Cell[] {
  return levelOne.givens.map((given): Cell => given ?? 'empty');
}

export function levelSessionReducer(
  state: LevelSessionState,
  action: LevelSessionAction,
): LevelSessionState {
  switch (action.type) {
    case 'cycle':
      return { cells: cycleCell(levelOne, state.cells, action.index) };
    default: {
      const unexpected: never = action.type;
      throw new Error(`Unexpected level session action ${String(unexpected)}`);
    }
  }
}
