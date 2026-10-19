import type { Puzzle } from './types';

/**
 * First Puzzle. Two orange Givens and two monkey Givens, and no Edge clues.
 * Balance forces every other cell, so the solution does not need a guess.
 */
export const levelOne: Puzzle = {
  size: 4,
  edgeClues: [],
  givens: [
    'orange',
    'orange',
    null,
    null,
    null,
    null,
    'monkey',
    'monkey',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ],
};
