import type { Puzzle } from './types';

/**
 * First 6×6. Sixteen Givens, so the player fills most of the board.
 * More open cells than Level 1, and more Givens than the 6×6s that follow.
 * Seed 16001 from the generator.
 */
export const levelTwo: Puzzle = {
  size: 6,
  edgeClues: [
    { a: 7, b: 13, relation: 'same' },
    { a: 4, b: 10, relation: 'same' },
  ],
  givens: [
    null,
    'monkey',
    'monkey',
    'orange',
    null,
    'orange',
    null,
    null,
    'orange',
    'monkey',
    null,
    'orange',
    'monkey',
    null,
    null,
    'orange',
    null,
    null,
    null,
    'monkey',
    null,
    null,
    'monkey',
    null,
    'orange',
    null,
    'monkey',
    null,
    'orange',
    'monkey',
    'monkey',
    null,
    null,
    null,
    null,
    null,
  ],
};
