import { isSolved, levelOne } from '@/engine';

import type { LevelSessionState } from '../level-session-state';
import { levelSessionReducer, startingState } from '../level-session-state';
import { decodeSave, encodeSave } from '../save';

const solvedLevelOne: LevelSessionState = {
  puzzle: levelOne,
  cells: [
    'orange',
    'orange',
    'monkey',
    'monkey',
    'orange',
    'orange',
    'monkey',
    'monkey',
    'monkey',
    'monkey',
    'orange',
    'orange',
    'monkey',
    'monkey',
    'orange',
    'orange',
  ],
};

describe('save', () => {
  it('restores a missing save as Level 1', () => {
    expect(decodeSave(null)).toEqual(startingState());
  });

  it('starts Level 1 when the save cannot be read', () => {
    expect(decodeSave('not json')).toEqual(startingState());
    expect(decodeSave('{"version":2,"level":1,"cells":[]}')).toEqual(startingState());
    expect(decodeSave('{"version":1,"level":9,"cells":[]}')).toEqual(startingState());

    const changedGiven = encodeSave(startingState());
    const broken = changedGiven.replace('"orange"', '"monkey"');
    expect(decodeSave(broken)).toEqual(startingState());
  });

  it('retires a solved Level 1 as Level 2', () => {
    expect(isSolved(levelOne, solvedLevelOne.cells)).toBe(true);

    const restored = decodeSave(encodeSave(solvedLevelOne));

    expect(restored.puzzle.size).toBe(6);
    expect(restored.cells[0]).toBe('monkey');
    expect(restored.cells[35]).toBe('empty');
  });

  it('keeps placed Symbols and the current Level', () => {
    const placed = levelSessionReducer(startingState(), { type: 'cycle', index: 2 });
    expect(decodeSave(encodeSave(placed)).cells[2]).toBe('monkey');

    const levelTwo = levelSessionReducer(startingState(), { type: 'advance' });
    const restored = decodeSave(encodeSave(levelTwo));
    expect(restored.cells).toHaveLength(36);
    expect(restored.cells[0]).toBe('monkey');
    expect(restored.puzzle.size).toBe(6);
  });
});
