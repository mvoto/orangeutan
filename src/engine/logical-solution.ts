import { brokenLines } from './broken-lines';
import { cellAt } from './cell-at';
import { cellsFromGivens } from './cells-from-givens';
import type { Result } from './result';
import { fail, ok } from './result';
import type { Cell, Puzzle, Symbol } from './types';

const symbols: readonly Symbol[] = ['monkey', 'orange'];

export type LogicalSolution = {
  readonly count: number;
  readonly cells: readonly Cell[];
};

export type SolutionFailure =
  | { readonly reason: 'forced-fill' }
  | { readonly reason: 'still-empty' }
  | { readonly reason: 'not-one'; readonly count: number };

export function isSolved(puzzle: Puzzle, cells: readonly Cell[]): boolean {
  const solution = logicalSolution(puzzle);
  if (!solution.ok || solution.value.cells.length !== cells.length) return false;
  return solution.value.cells.every((cell, index) => cell === cells[index]);
}

/**
 * The completed grid when forced moves fill every cell and no other completion exists.
 * A Puzzle with no solution, or more than one, is a failure. It is not a throw.
 */
export function logicalSolution(puzzle: Puzzle): Result<LogicalSolution, SolutionFailure> {
  const cells = openCells(puzzle);
  if (!fillForced(puzzle, cells)) return fail({ reason: 'forced-fill' });
  if (cells.some((cell) => cell === 'empty')) return fail({ reason: 'still-empty' });
  const count = countCompletions(puzzle);
  if (count !== 1) return fail({ reason: 'not-one', count });
  return ok({ count, cells });
}

function openCells(puzzle: Puzzle): Cell[] {
  // Propagation and the search write into this copy. The starting grid stays fixed.
  return [...cellsFromGivens(puzzle)];
}

function fillForced(puzzle: Puzzle, cells: Cell[]): boolean {
  let changed = true;
  while (changed) {
    changed = false;
    for (let index = 0; index < cells.length; index += 1) {
      if (cellAt(cells, index) !== 'empty') continue;
      const legal = symbols.filter((symbol) => !placementBreaks(puzzle, cells, index, symbol));
      if (legal.length === 0) return false;
      if (legal.length === 1) {
        const only = legal[0];
        if (only === undefined) {
          throw new Error('Missing symbol');
        }
        cells[index] = only;
        changed = true;
      }
    }
  }
  return true;
}

/** Counts completed grids up to 2, which is enough to tell unique from not. */
function countCompletions(puzzle: Puzzle): number {
  return search(puzzle, openCells(puzzle), 2);
}

function search(puzzle: Puzzle, cells: Cell[], limit: number): number {
  const index = cells.indexOf('empty');
  // A full grid that already breaks a rule is not a completion.
  if (index === -1) return brokenLines(cells, puzzle.edgeClues).length === 0 ? 1 : 0;

  let count = 0;
  for (const symbol of symbols) {
    if (placementBreaks(puzzle, cells, index, symbol)) continue;
    cells[index] = symbol;
    count += search(puzzle, cells, limit);
    cells[index] = 'empty';
    if (count >= limit) return count;
  }
  return count;
}

function placementBreaks(puzzle: Puzzle, cells: Cell[], index: number, symbol: Symbol): boolean {
  const previous = cellAt(cells, index);
  cells[index] = symbol;
  const breaks = brokenLines(cells, puzzle.edgeClues).length > 0;
  cells[index] = previous;
  return breaks;
}
