import { cellAt } from '../cell-at';

import type { LineRule } from './line-rule';

const runLength = 3;

export const noThreeInARow: LineRule = {
  name: 'no-three-in-a-row',
  broken(line) {
    for (let start = 0; start <= line.length - runLength; start += 1) {
      const first = cellAt(line, start);
      const second = cellAt(line, start + 1);
      const third = cellAt(line, start + 2);
      if (first !== 'empty' && first === second && second === third) return true;
    }
    return false;
  },
};
