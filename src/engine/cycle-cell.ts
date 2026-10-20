import { cellAt } from './cell-at';
import type { Cell, Puzzle } from './types';

/** Advance a player cell. A Given stays as it was. */
export function cycleCell(puzzle: Puzzle, cells: readonly Cell[], index: number): readonly Cell[] {
  const given = puzzle.givens[index];
  if (given !== null && given !== undefined) return cells;

  const next = cells.slice();
  next[index] = nextCell(cellAt(next, index));
  return next;
}

function nextCell(current: Cell): Cell {
  switch (current) {
    case 'empty':
      return 'monkey';
    case 'monkey':
      return 'orange';
    case 'orange':
      return 'empty';
    default: {
      const neverCell: never = current;
      return neverCell;
    }
  }
}
