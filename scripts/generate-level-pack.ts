// @ts-nocheck — the app typecheck has no Node types. Run this with tsx.
import { writeFileSync } from 'node:fs';

import { generatePuzzle } from '../src/engine/generator';
import type { Puzzle } from '../src/engine/types';

/**
 * Builds the generated tail of the one Level sequence.
 * Run with `npx tsx scripts/generate-level-pack.ts`.
 * This rewrites the pack. Append new Levels at the end of the file instead
 * when saves already exist, so a stored index still opens the same Level.
 * Within a size, higher Given counts come first.
 */
const perCount = 20;
const sixGivenCounts = [34, 33, 32, 31, 30];
const eightGivenCounts = [62, 61, 60, 59, 58];

const pack: Puzzle[] = [...collect(6, sixGivenCounts), ...collect(8, eightGivenCounts)];

writeFileSync(
  new URL('../src/features/level/level-pack.json', import.meta.url),
  `${JSON.stringify(pack)}\n`,
);
console.log(`wrote ${pack.length} Levels`);

function collect(size: 6 | 8, givenCounts: readonly number[]): Puzzle[] {
  const puzzles: Puzzle[] = [];
  for (const givenCount of givenCounts) {
    let seed = givenCount * 1000;
    let made = 0;
    while (made < perCount) {
      seed += 1;
      if (seed > givenCount * 1000 + 400) {
        throw new Error(`Ran out of seeds for ${size}×${size} with ${givenCount} Givens`);
      }
      try {
        puzzles.push(generatePuzzle(seed, size, givenCount));
        made += 1;
        console.log(`${size}×${size} givens ${givenCount}: ${made}/${perCount}`);
      } catch {
        // This seed has no Puzzle at that Given count. The next seed continues the sequence.
      }
    }
  }
  return puzzles;
}
