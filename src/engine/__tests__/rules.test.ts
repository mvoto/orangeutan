import { brokenLines, cycleCell, levelOne, levelTwo, logicalSolution } from '../index';

import type { Cell } from '../types';

function grid(pattern: string): Cell[] {
  return pattern
    .replace(/\s+/g, '')
    .split('')
    .map((mark) => {
      if (mark === 'M') return 'monkey';
      if (mark === 'O') return 'orange';
      if (mark === '.') return 'empty';
      throw new Error(`Unknown mark ${mark}`);
    });
}

describe('4×4 rules with no Edge clues', () => {
  it('breaks a row or column with three identical Symbols in a row', () => {
    expect(
      brokenLines(
        grid(`
          .MMM
          ....
          ....
          ....
        `),
      ),
    ).toContainEqual({
      rule: 'no-three-in-a-row',
      line: 'row',
      index: 0,
      cellIndexes: [0, 1, 2, 3],
    });

    expect(
      brokenLines(
        grid(`
          .O..
          .O..
          .O..
          ....
        `),
      ),
    ).toContainEqual({
      rule: 'no-three-in-a-row',
      line: 'column',
      index: 1,
      cellIndexes: [1, 5, 9, 13],
    });

    expect(
      brokenLines(
        grid(`
          MM..
          .M..
          ..M.
          ....
        `),
      ).filter((line) => line.rule === 'no-three-in-a-row'),
    ).toEqual([]);
  });

  it('breaks a row or column with more than half of one Symbol', () => {
    expect(
      brokenLines(
        grid(`
          MOMM
          ....
          ....
          ....
        `),
      ),
    ).toContainEqual({ rule: 'balance', line: 'row', index: 0, cellIndexes: [0, 1, 2, 3] });

    expect(
      brokenLines(
        grid(`
          .O..
          .M..
          .O..
          .O..
        `),
      ),
    ).toContainEqual({
      rule: 'balance',
      line: 'column',
      index: 1,
      cellIndexes: [1, 5, 9, 13],
    });

    expect(
      brokenLines(
        grid(`
          MMOO
          OOMM
          MOOM
          OMMO
        `),
      ).filter((line) => line.rule === 'balance'),
    ).toEqual([]);
  });

  it('keeps a Given in place when that cell is cycled', () => {
    const givens = [
      'monkey',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      'orange',
      null,
      null,
      null,
      null,
    ] as const;
    const puzzle = { size: 4 as const, edgeClues: [] as const, givens };
    const cells = givens.map((given) => given ?? 'empty');

    expect(cycleCell(puzzle, cells, 0)).toEqual(cells);
    expect(cycleCell(puzzle, cells, 11)).toEqual(cells);
    expect(cycleCell(puzzle, cells, 1)).not.toEqual(cells);
  });

  it('breaks an Edge clue once both cells disagree with it', () => {
    const different = grid(`
      MO..
      ....
      ....
      ....
    `);

    expect(brokenLines(different, [{ a: 0, b: 1, relation: 'same' }])).toContainEqual({
      rule: 'edge-clue',
      line: 'row',
      index: 0,
      cellIndexes: [0, 1],
    });
    expect(brokenLines(different, [{ a: 0, b: 1, relation: 'opposite' }])).toEqual([]);

    const sameColumn = grid(`
      M...
      M...
      ....
      ....
    `);
    expect(brokenLines(sameColumn, [{ a: 0, b: 4, relation: 'opposite' }])).toContainEqual({
      rule: 'edge-clue',
      line: 'column',
      index: 0,
      cellIndexes: [0, 4],
    });
  });

  it('waits to judge an Edge clue until both cells hold a Symbol', () => {
    const cells = grid(`
      M...
      ....
      ....
      ....
    `);

    expect(brokenLines(cells, [{ a: 0, b: 1, relation: 'same' }])).toEqual([]);
  });

  it('gives Level 1 exactly one logical solution and no Edge clues', () => {
    expect(levelOne).toEqual({
      size: 4,
      edgeClues: [],
      givens: [
        'orange',
        'orange',
        null,
        null,
        null,
        null,
        'monkey',
        'monkey',
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
    });

    expect(logicalSolution(levelOne)).toEqual({
      count: 1,
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
    });
  });
});

describe('Level 2', () => {
  it('is the first 6×6 and has exactly one logical solution', () => {
    expect(levelTwo.size).toBe(6);
    expect(levelTwo.edgeClues).toEqual([
      { a: 0, b: 1, relation: 'opposite' },
      { a: 34, b: 35, relation: 'opposite' },
    ]);
    expect(levelOne.edgeClues).toEqual([]);

    expect(logicalSolution(levelTwo)).toEqual({
      count: 1,
      cells: grid(`
        MOMOMO
        OMOMOM
        MOMOMO
        OMOMOM
        MOMOMO
        OMOMOM
      `),
    });
  });
});
