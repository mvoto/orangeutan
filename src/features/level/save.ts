import { isSolved, levelOne, levelTwo } from '@/engine';
import type { Cell, Puzzle } from '@/engine';

import { levelSessionReducer, startingState } from './level-session-state';
import type { LevelSessionState } from './level-session-state';

const saveVersion = 1;

export function encodeSave(state: LevelSessionState): string {
  return JSON.stringify({
    version: saveVersion,
    level: state.puzzle === levelTwo ? 2 : 1,
    cells: state.cells,
  });
}

/** A missing or unreadable document starts a fresh Level 1 instead of throwing. */
export function decodeSave(raw: string | null): LevelSessionState {
  if (raw === null) return startingState();
  try {
    return readSave(JSON.parse(raw) as unknown);
  } catch {
    return startingState();
  }
}

function readSave(value: unknown): LevelSessionState {
  if (typeof value !== 'object' || value === null) return startingState();
  const record = value as { version?: unknown; level?: unknown; cells?: unknown };
  if (record.version !== saveVersion) return startingState();

  const puzzle = puzzleFor(record.level);
  if (puzzle === null || !Array.isArray(record.cells)) return startingState();
  if (record.cells.length !== puzzle.size * puzzle.size) return startingState();

  const cells: Cell[] = [];
  for (const cell of record.cells) {
    if (!isCell(cell)) return startingState();
    cells.push(cell);
  }
  if (!givensHold(puzzle, cells)) return startingState();
  const restored = { puzzle, cells };
  // A solved Level is retired. The next launch continues at the following Level.
  if (restored.puzzle === levelOne && isSolved(restored.puzzle, restored.cells)) {
    return levelSessionReducer(restored, { type: 'advance' });
  }
  return restored;
}

function puzzleFor(level: unknown): Puzzle | null {
  if (level === 1) return levelOne;
  if (level === 2) return levelTwo;
  return null;
}

function isCell(value: unknown): value is Cell {
  return value === 'monkey' || value === 'orange' || value === 'empty';
}

function givensHold(puzzle: Puzzle, cells: readonly Cell[]): boolean {
  return puzzle.givens.every((given, index) => given === null || cells[index] === given);
}
