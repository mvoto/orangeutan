import type { Symbol } from '../types';

import type { LineRule } from './line-rule';

export const balance: LineRule = {
  name: 'balance',
  broken(line) {
    const half = line.length / 2;
    const counts: Record<Symbol, number> = { monkey: 0, orange: 0 };
    for (const cell of line) {
      if (cell === 'empty') continue;
      counts[cell] += 1;
    }
    return counts.monkey > half || counts.orange > half;
  },
};
