import { isSolved, levelOne } from '@/engine';

import type { LevelSessionState } from '../level-session-state';
import { levelSessionReducer, startingState } from '../level-session-state';
import { levelSequence } from '../sequence';
import { decodeSave, encodeSave, openSave } from '../save';

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
    expect(decodeSave('{"version":3,"level":1,"cells":[]}')).toEqual(startingState());
    expect(decodeSave('{"version":1,"level":9,"cells":[]}')).toEqual(startingState());

    const changedGiven = encodeSave(startingState());
    const broken = changedGiven.replace('"orange"', '"monkey"');
    expect(decodeSave(broken)).toEqual(startingState());
    expect(openSave('not json').preserveDocument).toBe(false);
  });

  it('does not open a Level from the old nearly full pack', () => {
    const oldLevel = levelSequence[2];
    if (oldLevel === undefined) throw new Error('Level 3 is missing');
    const old = JSON.stringify({
      version: 1,
      level: 3,
      cells: oldLevel.givens.map((given) => given ?? 'empty'),
    });

    expect(decodeSave(old)).toEqual(startingState());
  });

  it('leaves a newer save on disk', () => {
    const newer = '{"version":3,"level":1,"cells":[]}';
    const opened = openSave(newer);

    expect(opened.state).toEqual(startingState());
    expect(opened.preserveDocument).toBe(true);
  });

  it('stores the Level by its place in the sequence', () => {
    const stranger = { ...levelOne, edgeClues: [] };

    expect(JSON.parse(encodeSave(startingState())).level).toBe(1);
    expect(
      JSON.parse(encodeSave(levelSessionReducer(startingState(), { type: 'advance' }))).level,
    ).toBe(2);
    expect(() => encodeSave({ puzzle: stranger, cells: startingState().cells })).toThrow(
      'Puzzle is not in the Level sequence',
    );
  });

  it('retires a solved Level 1 as Level 2', () => {
    expect(isSolved(levelOne, solvedLevelOne.cells)).toBe(true);

    const restored = decodeSave(encodeSave(solvedLevelOne));

    expect(restored.puzzle.size).toBe(6);
    expect(restored.puzzle.edgeClues.length).toBeGreaterThan(0);
    expect(restored.cells).toHaveLength(36);
  });

  it('keeps placed Symbols and the current Level', () => {
    const placed = levelSessionReducer(startingState(), { type: 'cycle', index: 2 });
    expect(decodeSave(encodeSave(placed)).cells[2]).toBe('monkey');

    const levelTwo = levelSessionReducer(startingState(), { type: 'advance' });
    const restored = decodeSave(encodeSave(levelTwo));
    expect(restored.cells).toHaveLength(36);
    expect(restored.puzzle.size).toBe(6);
    expect(restored.puzzle.edgeClues.length).toBeGreaterThan(0);
  });
});
