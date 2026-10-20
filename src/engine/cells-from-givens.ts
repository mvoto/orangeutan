import type { Cell, Puzzle } from './types';

/** The grid a Puzzle starts on. A Given is locked; an open cell is empty. */
export function cellsFromGivens(puzzle: Puzzle): readonly Cell[] {
  return puzzle.givens.map((given): Cell => given ?? 'empty');
}
