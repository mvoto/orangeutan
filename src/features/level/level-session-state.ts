import { cycleCell, levelOne } from '@/engine';
import type { Cell, Puzzle } from '@/engine';

import { nextLevel } from './sequence';

export type LevelSessionState = {
  readonly puzzle: Puzzle;
  readonly cells: readonly Cell[];
};

export type LevelSessionAction =
  { readonly type: 'cycle'; readonly index: number } | { readonly type: 'advance' };

export function startingCells(): readonly Cell[] {
  return openGivens(levelOne);
}

export function startingState(): LevelSessionState {
  return { puzzle: levelOne, cells: startingCells() };
}

export function levelSessionReducer(
  state: LevelSessionState,
  action: LevelSessionAction,
): LevelSessionState {
  switch (action.type) {
    case 'cycle':
      return { ...state, cells: cycleCell(state.puzzle, state.cells, action.index) };
    case 'advance': {
      const next = nextLevel(state.puzzle);
      if (next === null) return state;
      return { puzzle: next, cells: openGivens(next) };
    }
    default: {
      const unexpected: never = action;
      throw new Error(`Unexpected level session action ${JSON.stringify(unexpected)}`);
    }
  }
}

function openGivens(puzzle: Puzzle): readonly Cell[] {
  return puzzle.givens.map((given): Cell => given ?? 'empty');
}
