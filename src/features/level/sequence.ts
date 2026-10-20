import { levelOne, levelTwo } from '@/engine';
import type { Puzzle } from '@/engine';

/** Shipped order. A save stores a 1-based index into this list. */
export const levelSequence: readonly Puzzle[] = [levelOne, levelTwo];

export function levelNumber(puzzle: Puzzle): number {
  const index = levelSequence.indexOf(puzzle);
  if (index < 0) {
    throw new Error('Puzzle is not in the Level sequence');
  }
  return index + 1;
}

export function puzzleAt(level: number): Puzzle | null {
  return levelSequence[level - 1] ?? null;
}

export function nextLevel(puzzle: Puzzle): Puzzle | null {
  const index = levelSequence.indexOf(puzzle);
  if (index < 0) return null;
  return levelSequence[index + 1] ?? null;
}
