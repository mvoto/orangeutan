import type { Cell, Line, Symbol } from './types';

export type RuleName = 'no-three-in-a-row' | 'balance';

export type BrokenLine = {
  readonly rule: RuleName;
  readonly line: Line;
  readonly index: number;
};

const size = 4;

const half = size / 2;

/** Rows and columns that already break no-three-in-a-row or balance. */
export function brokenLines(cells: readonly Cell[]): readonly BrokenLine[] {
  const found: BrokenLine[] = [];

  for (const line of ['row', 'column'] as const) {
    for (let index = 0; index < size; index += 1) {
      if (hasThreeInARow(cells, line, index)) {
        found.push({ rule: 'no-three-in-a-row', line, index });
      }
      if (hasMoreThanHalf(cells, line, index)) {
        found.push({ rule: 'balance', line, index });
      }
    }
  }

  return found;
}

function hasMoreThanHalf(cells: readonly Cell[], line: Line, index: number): boolean {
  const counts: Record<Symbol, number> = { monkey: 0, orange: 0 };
  for (let offset = 0; offset < size; offset += 1) {
    const cell = cellAt(cells, line, index, offset);
    if (cell === 'empty') continue;
    counts[cell] += 1;
  }
  return counts.monkey > half || counts.orange > half;
}

function hasThreeInARow(cells: readonly Cell[], line: Line, index: number): boolean {
  for (let start = 0; start <= size - 3; start += 1) {
    const first = cellAt(cells, line, index, start);
    const second = cellAt(cells, line, index, start + 1);
    const third = cellAt(cells, line, index, start + 2);
    if (first !== 'empty' && first === second && second === third) return true;
  }
  return false;
}

function cellAt(cells: readonly Cell[], line: Line, index: number, offset: number): Cell {
  const position = line === 'row' ? index * size + offset : offset * size + index;
  const cell = cells[position];
  if (cell === undefined) {
    throw new Error(`Missing cell at ${line} ${index} offset ${offset}`);
  }
  return cell;
}
