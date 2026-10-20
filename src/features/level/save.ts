import { isSolved } from '@/engine';
import type { Cell, Puzzle } from '@/engine';

import { levelSessionReducer, startingState } from './level-session-state';
import type { LevelSessionState } from './level-session-state';
import { levelNumber, nextLevel, puzzleAt } from './sequence';

const saveVersion = 1;

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
  const restored = { puzzle, cells };
  // A solved Level is retired. The next launch continues at the following Level.
  if (nextLevel(restored.puzzle) !== null && isSolved(restored.puzzle, restored.cells)) {
    return playable(levelSessionReducer(restored, { type: 'advance' }));
  }
  return playable(restored);
}

/**
 * Version 1 is the current document. A higher version is left untouched.
 * An older version will convert here before it is read.
 */
function migrate(
  value: unknown,
):
  | { readonly kind: 'current'; readonly level: unknown; readonly cells: unknown }
  | { readonly kind: 'foreign' }
  | { readonly kind: 'invalid' } {
  if (typeof value !== 'object' || value === null) return { kind: 'invalid' };
  const record = value as { version?: unknown; level?: unknown; cells?: unknown };
  if (typeof record.version === 'number' && record.version > saveVersion)
    return { kind: 'foreign' };
  if (record.version !== saveVersion) return { kind: 'invalid' };
  return { kind: 'current', level: record.level, cells: record.cells };
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
