import { levelSessionReducer, startingCells } from '../level-session-state';

describe('level session state', () => {
  it('cycles an empty cell and leaves a Given locked', () => {
    const start = { cells: startingCells() };
    expect(start.cells[0]).toBe('orange');
    expect(start.cells[6]).toBe('monkey');

    const monkey = levelSessionReducer(start, { type: 'cycle', index: 2 });
    expect(monkey.cells[2]).toBe('monkey');
    expect(start.cells[2]).toBe('empty');

    const orange = levelSessionReducer(monkey, { type: 'cycle', index: 2 });
    expect(orange.cells[2]).toBe('orange');

    const empty = levelSessionReducer(orange, { type: 'cycle', index: 2 });
    expect(empty.cells[2]).toBe('empty');

    const given = levelSessionReducer(empty, { type: 'cycle', index: 0 });
    expect(given.cells[0]).toBe('orange');
    expect(given.cells[2]).toBe('empty');
  });
});
