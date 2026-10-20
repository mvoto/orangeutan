import { generatePuzzle, logicalSolution } from '../index';
import type { Puzzle } from '../types';

function givenCount(puzzle: Puzzle): number {
  return puzzle.givens.filter((given) => given !== null).length;
}

function expectOneLogicalSolution(puzzle: Puzzle): void {
  const solution = logicalSolution(puzzle);
  expect(solution).not.toBeNull();
  expect(solution?.count).toBe(1);
  expect(solution?.cells).toHaveLength(puzzle.size * puzzle.size);
  expect(solution?.cells.some((cell) => cell === 'empty')).toBe(false);
}

describe('generate a unique Puzzle', () => {
  it('builds a 6×6 from a seed with Edge clues and the requested Givens', () => {
    const puzzle = generatePuzzle(7, 6, 30);

    expect(puzzle).toEqual(generatePuzzle(7, 6, 30));
    expect(puzzle.size).toBe(6);
    expect(puzzle.edgeClues.length).toBeGreaterThanOrEqual(2);
    expect(givenCount(puzzle)).toBe(30);
    expectOneLogicalSolution(puzzle);
  });

  it('builds the same 8×8 from the same seed', () => {
    const first = generatePuzzle(11, 8, 56);
    const second = generatePuzzle(11, 8, 56);

    expect(first).toEqual(second);
    expect(first.size).toBe(8);
    expect(first.edgeClues.length).toBeGreaterThanOrEqual(2);
    expect(givenCount(first)).toBe(56);
    expectOneLogicalSolution(first);
  });

  it('gives an easier Puzzle when more Givens are requested', () => {
    const fewer = generatePuzzle(7, 6, 28);
    const more = generatePuzzle(7, 6, 32);

    expect(fewer.size).toBe(6);
    expect(more.size).toBe(6);
    expect(givenCount(more)).toBeGreaterThan(givenCount(fewer));
    expect(givenCount(more)).toBe(32);
    expect(givenCount(fewer)).toBe(28);
    expectOneLogicalSolution(fewer);
    expectOneLogicalSolution(more);
  });
});
