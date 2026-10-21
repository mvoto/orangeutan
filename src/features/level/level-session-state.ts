import { cellsFromGivens, cycleCell, isSolved, levelOne } from '@/engine';
import type { Cell, Puzzle } from '@/engine';

import { noRulesRemembered } from './rules';
import type { RememberedRules, RuleId } from './rules';
import { nextLevel } from './sequence';

export type LevelSessionState = {
  readonly puzzle: Puzzle;
  readonly cells: readonly Cell[];
  /** Whole seconds for every Level reached. The last entry is the open Level. */
  readonly seconds: readonly number[];
  /** A rule is remembered only after its sheet is closed. */
  readonly remembered: RememberedRules;
};

export type LevelSessionAction =
  | { readonly type: 'cycle'; readonly index: number }
  | { readonly type: 'clear' }
  | { readonly type: 'advance' }
  | { readonly type: 'tick' }
  | { readonly type: 'remember'; readonly rule: RuleId };

export function startingCells(): readonly Cell[] {
  return cellsFromGivens(levelOne);
}

export function startingState(): LevelSessionState {
  return { puzzle: levelOne, cells: startingCells(), seconds: [0], remembered: noRulesRemembered };
}

export function levelSessionReducer(
  state: LevelSessionState,
  action: LevelSessionAction,
): LevelSessionState {
  switch (action.type) {
    case 'cycle':
      return { ...state, cells: cycleCell(state.puzzle, state.cells, action.index) };
    case 'clear':
      return { ...state, cells: cellsFromGivens(state.puzzle) };
    case 'advance': {
      const next = nextLevel(state.puzzle);
      if (next === null) return state;
      return {
        puzzle: next,
        cells: cellsFromGivens(next),
        seconds: [...state.seconds, 0],
        remembered: state.remembered,
      };
    }
    case 'tick': {
      if (isSolved(state.puzzle, state.cells)) return state;
      const seconds = state.seconds.slice();
      const last = seconds.length - 1;
      const current = seconds[last];
      if (current === undefined) return state;
      seconds[last] = current + 1;
      return { ...state, seconds };
    }
    case 'remember':
      return { ...state, remembered: { ...state.remembered, [action.rule]: true } };
    default: {
      const unexpected: never = action;
      throw new Error(`Unexpected level session action ${JSON.stringify(unexpected)}`);
    }
  }
}
