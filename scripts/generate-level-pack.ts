import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { format } from 'prettier';

import { generatePuzzle } from '../src/engine/generator';
import { appendPack, nextPackedPuzzle, packedLevels } from '../src/features/level/append-pack';
import type { PackSlot } from '../src/features/level/append-pack';
import type { Puzzle } from '../src/engine/types';

/**
 * Adds Levels at the end of the one sequence.
 * Run with `npx tsx scripts/generate-level-pack.ts`.
 * Shipped Levels stay at their indexes, because a save stores that index.
 * Within a size, higher Given counts come first.
 */
const perCount = 20;
const sixGivenCounts = [34, 33, 32, 31, 30];
const eightGivenCounts = [62, 61, 60, 59, 58];
const packPath = fileURLToPath(new URL('../src/features/level/level-pack.json', import.meta.url));

const slots: readonly PackSlot[] = [
  ...slotsFor(6, sixGivenCounts),
  ...slotsFor(8, eightGivenCounts),
];

void writePack();

async function writePack(): Promise<void> {
  const existing = packedLevels(JSON.parse(readFileSync(packPath, 'utf8')));
  const packed = appendPack(existing, slots, make);
  const text = await format(JSON.stringify(packed), { parser: 'json', filepath: packPath });
  writeFileSync(packPath, text);
  console.log(`wrote ${packed.length} Levels`);
}

function slotsFor(size: 6 | 8, givenCounts: readonly number[]): PackSlot[] {
  return givenCounts.flatMap((givenCount) =>
    Array.from({ length: perCount }, () => ({ size, givenCount })),
  );
}

const seeds = new Map<string, number>();

function make(slot: PackSlot): Puzzle {
  const key = `${slot.size}:${slot.givenCount}`;
  const found = nextPackedPuzzle(slot, seeds.get(key) ?? slot.givenCount * 1000, (seed) =>
    generatePuzzle(seed, slot.size, slot.givenCount),
  );
  seeds.set(key, found.seed);
  return found.puzzle;
}
