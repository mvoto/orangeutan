import { brokenLines } from './broken-lines';
import { logicalSolution } from './logical-solution';
import type { Result } from './result';
import { fail, ok } from './result';
import { createRng } from './rng';
import type { Rng } from './rng';
import type { Cell, EdgeClue, Puzzle, Symbol } from './types';

const symbols: readonly Symbol[] = ['monkey', 'orange'];
/** A miss draws another grid from the same seed instead of repeating one pattern. */
const defaultAttempts = 40;
/** Trying every valid row explodes the search. Eight candidates, then another grid. */
const rowSamples = 8;

export type PuzzleMiss = { readonly reason: 'miss' };

/**
 * A seeded Puzzle of the requested size. Givens are removed only while logic
 * still forces the same completion, so more Givens is an easier Puzzle.
 * A seed that cannot produce one is a miss. A Given count that cannot fit throws.
 * `attemptLimit` is how many grids to try before that miss. The pack uses the default.
 */
export function generatePuzzle(
  seed: number,
  size: 6 | 8,
  givenCount: number,
  attemptLimit = defaultAttempts,
): Result<Puzzle, PuzzleMiss> {
  const cellCount = size * size;
  if (givenCount < 0 || givenCount > cellCount) {
    throw new Error(`Given count ${givenCount} does not fit a ${size}×${size}`);
  }

  const rng = createRng(seed);
  for (let attempt = 0; attempt < attemptLimit; attempt += 1) {
    const solution = fullGrid(rng, size);
    if (solution === null) continue;
    const puzzle = carve(rng, size, solution, givenCount);
    if (puzzle !== null) return ok(puzzle);
  }

  return fail({ reason: 'miss' });
}

function fullGrid(rng: Rng, size: 6 | 8): Cell[] | null {
  const catalog = validRows(size);
  const chosen: Symbol[][] = [];

  const place = (row: number): boolean => {
    if (row === size) return true;
    for (const line of shuffle(catalog, rng).slice(0, rowSamples)) {
      chosen.push(line);
      if (brokenLines(cellsFromRows(chosen, size)).length === 0 && place(row + 1)) return true;
      chosen.pop();
    }
    return false;
  };

  if (!place(0)) return null;
  return chosen.flat();
}

function carve(
  rng: Rng,
  size: 6 | 8,
  solution: readonly Cell[],
  givenCount: number,
): Puzzle | null {
  const edges = shuffle(adjacentPairs(size), rng);
  const removal = shuffle(indexes(solution.length), rng);
  // One more clue at a time, while logic still forces this grid.
  for (let clueCount = 2; clueCount <= edges.length; clueCount += 1) {
    const edgeClues = edges.slice(0, clueCount).map(([a, b]): EdgeClue => {
      const left = solution[a];
      const right = solution[b];
      return {
        a,
        b,
        relation: left !== undefined && left === right ? 'same' : 'opposite',
      };
    });
    const givens: (Symbol | null)[] = solution.map((cell) => {
      if (cell !== 'monkey' && cell !== 'orange') return null;
      return cell;
    });
    let kept = givens.length;
    for (const index of removal) {
      if (kept <= givenCount) break;
      const removed = givens[index];
      if (removed === undefined || removed === null) continue;
      givens[index] = null;
      if (matches({ size, edgeClues, givens }, solution)) {
        kept -= 1;
      } else {
        givens[index] = removed;
      }
    }
    if (kept === givenCount) return { size, edgeClues, givens: [...givens] };
  }
  return null;
}

function matches(puzzle: Puzzle, solution: readonly Cell[]): boolean {
  const solved = logicalSolution(puzzle);
  if (!solved.ok) return false;
  return solved.value.cells.every((cell, index) => cell === solution[index]);
}

const rowCatalog = new Map<number, Symbol[][]>();

function validRows(size: number): Symbol[][] {
  const cached = rowCatalog.get(size);
  if (cached !== undefined) return cached;

  const found: Symbol[][] = [];
  const row: Symbol[] = [];
  const walk = (): void => {
    if (row.length === size) {
      const cells = Array.from<Cell>({ length: size * size }).fill('empty');
      row.forEach((symbol, column) => {
        cells[column] = symbol;
      });
      if (brokenLines(cells).length === 0) found.push([...row]);
      return;
    }
    for (const symbol of symbols) {
      row.push(symbol);
      walk();
      row.pop();
    }
  };
  walk();
  rowCatalog.set(size, found);
  return found;
}

function cellsFromRows(rows: readonly (readonly Symbol[])[], size: number): Cell[] {
  const cells = Array.from<Cell>({ length: size * size }).fill('empty');
  rows.forEach((row, rowIndex) => {
    row.forEach((symbol, column) => {
      cells[rowIndex * size + column] = symbol;
    });
  });
  return cells;
}

function adjacentPairs(size: number): (readonly [number, number])[] {
  const pairs: (readonly [number, number])[] = [];
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const index = row * size + column;
      if (column + 1 < size) pairs.push([index, index + 1]);
      if (row + 1 < size) pairs.push([index, index + size]);
    }
  }
  return pairs;
}

function indexes(length: number): number[] {
  return Array.from({ length }, (_, index) => index);
}

function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));
    const current = copy[index];
    const other = copy[swap];
    if (current === undefined || other === undefined) continue;
    copy[index] = other;
    copy[swap] = current;
  }
  return copy;
}
