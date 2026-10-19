import { lineCellIndexes } from './cell-index';
import { balance } from './rules/balance';
import type { LineRule } from './rules/line-rule';
import { noThreeInARow } from './rules/no-three-in-a-row';
import type { Cell, Line } from './types';

export type BrokenLine = {
  readonly rule: string;
  readonly line: Line;
  readonly index: number;
  readonly cellIndexes: readonly number[];
};

const rules: readonly LineRule[] = [noThreeInARow, balance];

const size = 4;

export function brokenLines(cells: readonly Cell[]): readonly BrokenLine[] {
  const found: BrokenLine[] = [];

  for (const line of ['row', 'column'] as const) {
    for (let index = 0; index < size; index += 1) {
      const cellIndexes = lineCellIndexes(line, index, size);
      const lineCells = cellsOn(cells, cellIndexes, line, index);
      for (const rule of rules) {
        if (rule.broken(lineCells)) {
          found.push({ rule: rule.name, line, index, cellIndexes });
        }
      }
    }
  }

  return found;
}

function cellsOn(
  cells: readonly Cell[],
  cellIndexes: readonly number[],
  line: Line,
  index: number,
): readonly Cell[] {
  return cellIndexes.map((position) => {
    const cell = cells[position];
    if (cell === undefined) {
      throw new Error(`Missing cell at ${line} ${index}`);
    }
    return cell;
  });
}
