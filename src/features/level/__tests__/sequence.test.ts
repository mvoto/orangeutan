import { levelOne, logicalSolution } from '@/engine';

import { levelSequence, nextLevel } from '../sequence';

function givenCount(givens: readonly (string | null)[]): number {
  return givens.filter((given) => given !== null).length;
}

describe('shipped Levels', () => {
  it('walks one sequence of at least 200 Levels', () => {
    expect(levelSequence.length).toBeGreaterThanOrEqual(200);
    expect(levelSequence[0]).toBe(levelOne);

    for (let index = 0; index < levelSequence.length - 1; index += 1) {
      expect(nextLevel(levelSequence[index]!)).toBe(levelSequence[index + 1]);
    }
    expect(nextLevel(levelSequence[levelSequence.length - 1]!)).toBeNull();
  });

  it('orders one 4×4, then 6×6s, then 8×8s, with more Givens first', () => {
    const sizes = levelSequence.map((puzzle) => puzzle.size);
    const firstSix = sizes.indexOf(6);
    const firstEight = sizes.indexOf(8);

    expect(sizes[0]).toBe(4);
    expect(sizes.lastIndexOf(4)).toBe(0);
    expect(firstSix).toBe(1);
    expect(firstEight).toBeGreaterThan(firstSix);
    expect(sizes.slice(firstSix, firstEight).every((size) => size === 6)).toBe(true);
    expect(sizes.slice(firstEight).every((size) => size === 8)).toBe(true);

    expect(nonIncreasing(levelSequence.slice(firstSix, firstEight))).toBe(true);
    expect(nonIncreasing(levelSequence.slice(firstEight))).toBe(true);
  });

  it('gives every shipped Puzzle one logical solution', () => {
    for (const puzzle of levelSequence) {
      expect(logicalSolution(puzzle)?.count).toBe(1);
    }
  });
});

function nonIncreasing(puzzles: readonly { givens: readonly (string | null)[] }[]): boolean {
  const counts = puzzles.map((puzzle) => givenCount(puzzle.givens));
  return counts.every((count, index) => index === 0 || count <= (counts[index - 1] ?? count));
}
