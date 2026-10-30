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
  seconds: [0],
  remembered: {
    'no-three-in-a-row': false,
    balance: false,
    'edge-clues': false,
  },
};

describe('save', () => {
  it('restores a missing save as Level 1', () => {
    expect(decodeSave(null)).toEqual(startingState());
  });

  it('starts Level 1 when the save cannot be read', () => {
    expect(decodeSave('not json')).toEqual(startingState());
    expect(decodeSave('{"version":3,"level":1,"cells":[]}')).toEqual(startingState());
    expect(decodeSave('{"version":1,"level":9,"cells":[]}')).toEqual(startingState());

    const changedGiven = encodeSave(startingState(), 'Calm Orangutan');
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
    const newer = '{"version":5,"level":1,"cells":[]}';
    const opened = openSave(newer);

    expect(opened.state).toEqual(startingState());
    expect(opened.preserveDocument).toBe(true);
  });

  it('stores the Level by its place in the sequence', () => {
    const stranger = { ...levelOne, edgeClues: [] };

    expect(JSON.parse(encodeSave(startingState(), 'Calm Orangutan')).level).toBe(1);
    expect(
      JSON.parse(
        encodeSave(levelSessionReducer(startingState(), { type: 'advance' }), 'Calm Orangutan'),
      ).level,
    ).toBe(2);
    expect(() =>
      encodeSave(
        {
          puzzle: stranger,
          cells: startingState().cells,
          seconds: [0],
          remembered: startingState().remembered,
        },
        'Calm Orangutan',
      ),
    ).toThrow('Puzzle is not in the Level sequence');
  });

  it('retires a solved Level 1 as Level 2', () => {
    expect(isSolved(levelOne, solvedLevelOne.cells)).toBe(true);

    const restored = decodeSave(encodeSave(solvedLevelOne, 'Calm Orangutan'));

    expect(restored.puzzle.size).toBe(6);
    expect(restored.puzzle.edgeClues.length).toBeGreaterThan(0);
    expect(restored.cells).toHaveLength(36);
  });

  it('round-trips the Nickname on the current save', () => {
    const encoded = encodeSave(startingState(), 'Calm Orangutan');
    const document = JSON.parse(encoded) as { version: unknown; nickname: unknown };

    expect(document.version).toBe(4);
    expect(document.nickname).toBe('Calm Orangutan');
    expect(openSave(encoded).nickname).toBe('Calm Orangutan');
    expect(openSave(encoded).state.cells).toEqual(startingState().cells);
  });

  it('keeps an older Level and takes the Nickname the caller supplies', () => {
    const level = startingState();
    const older = JSON.stringify({
      version: 3,
      level: 1,
      cells: level.cells,
      seconds: level.seconds,
      remembered: level.remembered,
    });
    const opened = openSave(older, 'Sunny Orange');

    expect(opened.nickname).toBe('Sunny Orange');
    expect(opened.state.cells).toEqual(level.cells);
    expect(opened.state.seconds).toEqual(level.seconds);
    expect(opened.state.remembered).toEqual(level.remembered);
    expect(opened.state.puzzle).toEqual(level.puzzle);
  });

  it('drops a stored Nickname the filter rejects', () => {
    const level = startingState();
    const rejected = JSON.stringify({
      version: 4,
      level: 1,
      cells: level.cells,
      seconds: level.seconds,
      remembered: level.remembered,
      nickname: 'nope!!',
    });

    expect(openSave(rejected, 'Sunny Orange').nickname).toBeNull();
    expect(openSave(rejected).state.cells).toEqual(level.cells);
  });

  it('starts a fresh Level with no stored Nickname when the save is missing', () => {
    const opened = openSave(null, 'Calm Orangutan');

    expect(opened.state).toEqual(startingState());
    expect(opened.nickname).toBeNull();
  });

  it('keeps placed Symbols and the current Level', () => {
    const placed = levelSessionReducer(startingState(), { type: 'cycle', index: 2 });
    expect(decodeSave(encodeSave(placed, 'Calm Orangutan')).cells[2]).toBe('monkey');

    const levelTwo = levelSessionReducer(startingState(), { type: 'advance' });
    const restored = decodeSave(encodeSave(levelTwo, 'Calm Orangutan'));
    expect(restored.cells).toHaveLength(36);
    expect(restored.puzzle.size).toBe(6);
    expect(restored.puzzle.edgeClues.length).toBeGreaterThan(0);
  });
});
