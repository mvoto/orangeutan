import { brokenLines, cycleCell } from '@/engine';

import type { Cell } from '@/engine';

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
    ).toContainEqual({ rule: 'no-three-in-a-row', line: 'row', index: 0 });

    expect(
      brokenLines(
        grid(`
          .O..
          .O..
          .O..
          ....
        `),
      ),
    ).toContainEqual({ rule: 'no-three-in-a-row', line: 'column', index: 1 });

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
    ).toContainEqual({ rule: 'balance', line: 'row', index: 0 });

    expect(
      brokenLines(
        grid(`
          .O..
          .M..
          .O..
          .O..
        `),
      ),
    ).toContainEqual({ rule: 'balance', line: 'column', index: 1 });

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
});
