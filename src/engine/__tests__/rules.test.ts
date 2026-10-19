import { brokenLines } from '@/engine';

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
});
