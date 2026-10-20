import { generatePuzzle, logicalSolution } from '../index';
import type { Puzzle } from '../types';

function givenCount(puzzle: Puzzle): number {
  return puzzle.givens.filter((given) => given !== null).length;
}

function built(seed: number, size: 6 | 8, givenCount: number): Puzzle {
  const result = generatePuzzle(seed, size, givenCount);
  if (!result.ok) throw new Error('expected a Puzzle');
  return result.value;
}

function expectOneLogicalSolution(puzzle: Puzzle): void {
  const solution = logicalSolution(puzzle);
  expect(solution.ok).toBe(true);
  if (!solution.ok) return;
  expect(solution.value.count).toBe(1);
  expect(solution.value.cells).toHaveLength(puzzle.size * puzzle.size);
  expect(solution.value.cells.some((cell) => cell === 'empty')).toBe(false);
}

describe('generate a unique Puzzle', () => {
  it('returns a miss when that seed has no Puzzle', () => {
    expect(generatePuzzle(1, 6, 0, 1)).toEqual({ ok: false, error: { reason: 'miss' } });
  });

  it('throws when the Given count does not fit the board', () => {
    expect(() => generatePuzzle(1, 6, 99)).toThrow('Given count 99 does not fit a 6×6');
  });

  it('builds a 6×6 from a seed with Edge clues and the requested Givens', () => {
    const puzzle = built(7, 6, 30);

    expect(puzzle).toEqual(built(7, 6, 30));
    expect(puzzle.size).toBe(6);
    expect(puzzle.edgeClues.length).toBeGreaterThanOrEqual(2);
    expect(givenCount(puzzle)).toBe(30);
    expectOneLogicalSolution(puzzle);
  });

  it('builds the same 8×8 from the same seed', () => {
    const first = built(11, 8, 56);
    const second = built(11, 8, 56);

    expect(first).toEqual(second);
    expect(first.size).toBe(8);
    expect(first.edgeClues.length).toBeGreaterThanOrEqual(2);
    expect(givenCount(first)).toBe(56);
    expectOneLogicalSolution(first);
  });

  it('gives an easier Puzzle when more Givens are requested', () => {
    const fewer = built(7, 6, 28);
    const more = built(7, 6, 32);

    expect(fewer.size).toBe(6);
    expect(more.size).toBe(6);
    expect(givenCount(more)).toBeGreaterThan(givenCount(fewer));
    expect(givenCount(more)).toBe(32);
    expect(givenCount(fewer)).toBe(28);
    expectOneLogicalSolution(fewer);
    expectOneLogicalSolution(more);
  });
});
