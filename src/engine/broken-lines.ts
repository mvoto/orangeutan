import type { Cell, Line } from './types';

export type BrokenLine = {
  readonly rule: 'no-three-in-a-row';
  readonly line: Line;
  readonly index: number;
};

const size = 4;

/** Rows and columns that already hold three identical Symbols in a row. */
export function brokenLines(cells: readonly Cell[]): readonly BrokenLine[] {
  const found: BrokenLine[] = [];

  for (const line of ['row', 'column'] as const) {
    for (let index = 0; index < size; index += 1) {
      if (hasThreeInARow(cells, line, index)) {
        found.push({ rule: 'no-three-in-a-row', line, index });
      }
    }
  }

  return found;
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
