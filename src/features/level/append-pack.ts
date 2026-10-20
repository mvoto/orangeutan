import type { Puzzle, PuzzleMiss, Result, Symbol, EdgeClue } from '@/engine';

export type PackSlot = {
  readonly size: 6 | 8;
  readonly givenCount: number;
};

/**
 * The next Puzzle for one slot. `seed` is the last seed used for this Given count,
 * so the following Level does not repeat it. A seed that misses is skipped.
 * Running out of seeds is a programmer bug.
 */
export function nextPackedPuzzle(
  slot: PackSlot,
  seed: number,
  generate: (seed: number) => Result<Puzzle, PuzzleMiss>,
): { readonly puzzle: Puzzle; readonly seed: number } {
  let next = seed;
  const limit = slot.givenCount * 1000 + 400;
  while (next < limit) {
    next += 1;
    const result = generate(next);
    if (result.ok) return { puzzle: result.value, seed: next };
  }
  throw new Error(`Ran out of seeds for ${slot.size}×${slot.size} with ${slot.givenCount} Givens`);
}

/** The generated tail, read back from the pack file. A bad file throws. */
export function packedLevels(value: unknown): readonly Puzzle[] {
  if (!Array.isArray(value)) {
    throw new Error('Level pack is not a list');
  }
  return value.map(shippedPuzzle);
}

/**
 * Keeps shipped Levels at their indexes. A save stores that index.
 * New slots are built and added at the end, still 6×6s then 8×8s, more Givens first.
 */
export function appendPack(
  existing: readonly Puzzle[],
  slots: readonly PackSlot[],
  make: (slot: PackSlot) => Puzzle,
): readonly Puzzle[] {
  if (existing.length > slots.length) {
    throw new Error('Refusing to drop Levels from the pack');
  }
  assertOrder(slots);
  for (let index = 0; index < existing.length; index += 1) {
    const puzzle = existing[index];
    const slot = slots[index];
    if (puzzle === undefined || slot === undefined || !sameSlot(puzzle, slot)) {
      throw new Error('Refusing to renumber the pack');
    }
  }
  const added = slots.slice(existing.length).map((slot) => make(slot));
  return [...existing, ...added];
}

function sameSlot(puzzle: Puzzle, slot: PackSlot): boolean {
  return puzzle.size === slot.size && givenCount(puzzle) === slot.givenCount;
}

function givenCount(puzzle: Puzzle): number {
  return puzzle.givens.filter((given) => given !== null).length;
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

function shippedClue(value: unknown): EdgeClue {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Shipped Edge clue is not a clue');
  }
  const clue = value as { a?: unknown; b?: unknown; relation?: unknown };
  if (
    typeof clue.a !== 'number' ||
    typeof clue.b !== 'number' ||
    (clue.relation !== 'same' && clue.relation !== 'opposite')
  ) {
    throw new Error('Shipped Edge clue is not a clue');
  }
  return { a: clue.a, b: clue.b, relation: clue.relation };
}

function shippedGiven(value: unknown): Symbol | null {
  if (value === 'monkey' || value === 'orange' || value === null) return value;
  throw new Error('Shipped Given is not a Symbol');
}

function assertOrder(slots: readonly PackSlot[]): void {
  let seenEight = false;
  let previousGivenCount: number | null = null;
  let previousSize: 6 | 8 | null = null;
  for (const slot of slots) {
    if (slot.size === 6 && seenEight) {
      throw new Error('Pack breaks the sequence order');
    }
    if (slot.size === 8) seenEight = true;
    if (
      previousSize === slot.size &&
      previousGivenCount !== null &&
      slot.givenCount > previousGivenCount
    ) {
      throw new Error('Pack breaks the sequence order');
    }
    previousSize = slot.size;
    previousGivenCount = slot.givenCount;
  }
}
