import { brokenLines } from './broken-lines';
import type { Cell, Puzzle, Symbol } from './types';

const symbols: readonly Symbol[] = ['monkey', 'orange'];

export type LogicalSolution = {
  readonly count: 1;
  readonly cells: readonly Cell[];
};

/**
 * The completed grid when forced moves fill every cell and no other completion exists.
 * Returns null when the Puzzle needs a guess or does not have one solution.
 */
export function logicalSolution(puzzle: Puzzle): LogicalSolution | null {
  const cells = openCells(puzzle);
  if (!fillForced(cells)) return null;
  if (cells.some((cell) => cell === 'empty')) return null;
  if (countCompletions(puzzle) !== 1) return null;
  return { count: 1, cells };
}

function openCells(puzzle: Puzzle): Cell[] {
  return puzzle.givens.map((given): Cell => given ?? 'empty');
}

function fillForced(cells: Cell[]): boolean {
  let changed = true;
  while (changed) {
    changed = false;
    for (let index = 0; index < cells.length; index += 1) {
      if (cells[index] !== 'empty') continue;
      const legal = symbols.filter((symbol) => !placementBreaks(cells, index, symbol));
      if (legal.length === 0) return false;
      if (legal.length === 1) {
        const only = legal[0];
        if (only === undefined) return false;
        cells[index] = only;
        changed = true;
      }
    }
  }
  return true;
}

/** Counts completed grids up to 2, which is enough to tell unique from not. */
function countCompletions(puzzle: Puzzle): number {
  return search(openCells(puzzle), 2);
}

function search(cells: Cell[], limit: number): number {
  const index = cells.indexOf('empty');
  if (index === -1) return 1;

  let count = 0;
  for (const symbol of symbols) {
    if (placementBreaks(cells, index, symbol)) continue;
    cells[index] = symbol;
    count += search(cells, limit);
    cells[index] = 'empty';
    if (count >= limit) return count;
  }
  return count;
}

function placementBreaks(cells: Cell[], index: number, symbol: Symbol): boolean {
  const previous = cells[index];
  if (previous === undefined) {
    throw new Error(`Missing cell ${index}`);
  }
  cells[index] = symbol;
  const breaks = brokenLines(cells).length > 0;
  cells[index] = previous;
  return breaks;
}
