import { levelOne, levelTwo } from '@/engine';
import type { EdgeRelation, Puzzle, Symbol } from '@/engine';

import pack from './level-pack.json';

/**
 * Shipped order. A save stores a 1-based index into this list.
 * Grow the sequence by appending Levels at the end, so existing indexes stay put.
 */
export const levelSequence: readonly Puzzle[] = [levelOne, levelTwo, ...pack.map(shippedPuzzle)];

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

function shippedPuzzle(value: unknown): Puzzle {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Shipped Level is not a Puzzle');
  }
  const record = value as { size?: unknown; edgeClues?: unknown; givens?: unknown };
  if (record.size !== 6 && record.size !== 8) {
    throw new Error('Shipped Level is not a 6×6 or an 8×8');
  }
  if (!Array.isArray(record.edgeClues) || !Array.isArray(record.givens)) {
    throw new Error('Shipped Level is missing its clues or Givens');
  }
  return {
    size: record.size,
    edgeClues: record.edgeClues.map(shippedClue),
    givens: record.givens.map(shippedGiven),
  };
}

function shippedClue(value: unknown): Puzzle['edgeClues'][number] {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Shipped Edge clue is not a clue');
  }
  const clue = value as { a?: unknown; b?: unknown; relation?: unknown };
  if (typeof clue.a !== 'number' || typeof clue.b !== 'number' || !isRelation(clue.relation)) {
    throw new Error('Shipped Edge clue is not a clue');
  }
  return { a: clue.a, b: clue.b, relation: clue.relation };
}

function shippedGiven(value: unknown): Symbol | null {
  if (value === 'monkey' || value === 'orange' || value === null) return value;
  throw new Error('Shipped Given is not a Symbol');
}

function isRelation(value: unknown): value is EdgeRelation {
  return value === 'same' || value === 'opposite';
}
