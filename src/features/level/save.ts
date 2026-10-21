import { isSolved } from '@/engine';
import type { Cell, Puzzle } from '@/engine';

import { levelSessionReducer, startingState } from './level-session-state';
import type { LevelSessionState } from './level-session-state';
import { noRulesRemembered, ruleOrder } from './rules';
import type { RememberedRules, RuleId } from './rules';
import { levelNumber, nextLevel, puzzleAt } from './sequence';

const saveVersion = 3;

export type OpenedSave = {
  readonly state: LevelSessionState;
  /** A newer document stays on disk. This session is only a temporary Level 1. */
  readonly preserveDocument: boolean;
};

export function encodeSave(state: LevelSessionState): string {
  return JSON.stringify({
    version: saveVersion,
    level: levelNumber(state.puzzle),
    cells: state.cells,
    seconds: state.seconds,
    remembered: state.remembered,
  });
}

/** A missing or unreadable document starts a fresh Level 1 instead of throwing. */
export function decodeSave(raw: string | null): LevelSessionState {
  return openSave(raw).state;
}

export function openSave(raw: string | null): OpenedSave {
  if (raw === null) return playable(startingState());
  try {
    const parsed: unknown = JSON.parse(raw);
    return readSave(parsed);
  } catch {
    return playable(startingState());
  }
}

function readSave(value: unknown): OpenedSave {
  const migrated = migrate(value);
  if (migrated.kind === 'foreign') return preserved();
  if (migrated.kind === 'invalid') return playable(startingState());

  const puzzle = typeof migrated.level === 'number' ? puzzleAt(migrated.level) : null;
  if (puzzle === null || !Array.isArray(migrated.cells)) return playable(startingState());
  if (migrated.cells.length !== puzzle.size * puzzle.size) return playable(startingState());

  const cells: Cell[] = [];
  for (const cell of migrated.cells) {
    if (!isCell(cell)) return playable(startingState());
    cells.push(cell);
  }
  if (!givensHold(puzzle, cells)) return playable(startingState());
  const restored = {
    puzzle,
    cells,
    seconds: secondsFor(levelNumber(puzzle), migrated.seconds),
    remembered: rememberedFor(value),
  };
  // A solved Level is retired. The next launch continues at the following Level.
  if (nextLevel(restored.puzzle) !== null && isSolved(restored.puzzle, restored.cells)) {
    return playable(levelSessionReducer(restored, { type: 'advance' }));
  }
  return playable(restored);
}

/**
 * Version 3 is the current document. A higher version is left untouched.
 * Version 1 named Levels in the nearly full pack. Only Level 1 is the same Puzzle.
 * Version 2 has the grid and no Play time.
 * Remembered rules are an optional field on this version. A missing field has introduced none.
 * A higher version is still left untouched.
 */
function migrate(value: unknown):
  | {
      readonly kind: 'current';
      readonly level: unknown;
      readonly cells: unknown;
      readonly seconds: unknown;
    }
  | { readonly kind: 'foreign' }
  | { readonly kind: 'invalid' } {
  if (typeof value !== 'object' || value === null) return { kind: 'invalid' };
  const record = value as {
    version?: unknown;
    level?: unknown;
    cells?: unknown;
    seconds?: unknown;
  };
  if (typeof record.version === 'number' && record.version > saveVersion)
    return { kind: 'foreign' };
  if (record.version === 1 && record.level === 1) {
    return { kind: 'current', level: record.level, cells: record.cells, seconds: null };
  }
  if (record.version === 2) {
    return { kind: 'current', level: record.level, cells: record.cells, seconds: null };
  }
  if (record.version !== saveVersion) return { kind: 'invalid' };
  return { kind: 'current', level: record.level, cells: record.cells, seconds: record.seconds };
}

/** Missing or unreadable times become a zero for every Level already reached. */
function secondsFor(level: number, raw: unknown): readonly number[] {
  const zeros = Array.from({ length: level }, () => 0);
  if (raw === null || !Array.isArray(raw) || raw.length !== level) return zeros;
  const seconds: number[] = [];
  for (const value of raw) {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) return zeros;
    seconds.push(value);
  }
  return seconds;
}

/** An older document has no record, so each rule still needs its one introduction. */
function rememberedFor(value: unknown): RememberedRules {
  if (typeof value !== 'object' || value === null) return noRulesRemembered;
  const remembered = (value as { remembered?: unknown }).remembered;
  if (typeof remembered !== 'object' || remembered === null) return noRulesRemembered;
  const rules = remembered as Record<string, unknown>;
  const read = {} as Record<RuleId, boolean>;
  for (const rule of ruleOrder) read[rule] = rules[rule] === true;
  return read;
}

function playable(state: LevelSessionState): OpenedSave {
  return { state, preserveDocument: false };
}

function preserved(): OpenedSave {
  return { state: startingState(), preserveDocument: true };
}

function isCell(value: unknown): value is Cell {
  return value === 'monkey' || value === 'orange' || value === 'empty';
}

function givensHold(puzzle: Puzzle, cells: readonly Cell[]): boolean {
  return puzzle.givens.every((given, index) => given === null || cells[index] === given);
}
