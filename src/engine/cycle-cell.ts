import type { Cell, Puzzle } from './types';

/** Advance a player cell. A Given stays as it was. */
export function cycleCell(puzzle: Puzzle, cells: readonly Cell[], index: number): readonly Cell[] {
  const given = puzzle.givens[index];
  if (given !== null && given !== undefined) return cells;

  const next = cells.slice();
  const current = next[index];
  if (current === undefined) {
    throw new Error(`Missing cell ${index}`);
  }
  next[index] = 'monkey';
  return next;
}
