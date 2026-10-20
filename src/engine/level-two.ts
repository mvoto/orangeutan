import type { Puzzle, Symbol } from './types';

const size = 6;

/**
 * First 6×6. Most cells are Givens. The last cell is empty, and the Edge clues
 * are the first in the sequence. (row + column) even is a monkey.
 */
function alternatingGivens(): (Symbol | null)[] {
  const givens: (Symbol | null)[] = [];
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      givens.push((row + column) % 2 === 0 ? 'monkey' : 'orange');
    }
  }
  givens[size * size - 1] = null;
  return givens;
}

export const levelTwo: Puzzle = {
  size,
  edgeClues: [
    { a: 0, b: 1, relation: 'opposite' },
    { a: 34, b: 35, relation: 'opposite' },
  ],
  givens: alternatingGivens(),
};
