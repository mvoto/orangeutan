import { lineCellIndexes } from './cell-index';
import { balance } from './rules/balance';
import type { LineRule } from './rules/line-rule';
import { noThreeInARow } from './rules/no-three-in-a-row';
import type { Cell, EdgeClue, Line } from './types';

export type BrokenLine = {
  readonly rule: string;
  readonly line: Line;
  readonly index: number;
  readonly cellIndexes: readonly number[];
};

const rules: readonly LineRule[] = [noThreeInARow, balance];

export function brokenLines(
  cells: readonly Cell[],
  edgeClues: readonly EdgeClue[] = [],
): readonly BrokenLine[] {
  const size = boardSize(cells.length);
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

  for (const clue of edgeClues) {
    const broken = brokenEdgeClue(cells, clue, size);
    if (broken !== null) found.push(broken);
  }

  return found;
}

function boardSize(cellCount: number): number {
  const size = Math.sqrt(cellCount);
  if (size !== 4 && size !== 6 && size !== 8) {
    throw new Error(`Unsupported board size ${cellCount}`);
  }
  return size;
}

function brokenEdgeClue(cells: readonly Cell[], clue: EdgeClue, size: number): BrokenLine | null {
  const left = cells[clue.a];
  const right = cells[clue.b];
  if (left === undefined || right === undefined) {
    throw new Error(`Missing cell for Edge clue ${clue.a},${clue.b}`);
  }
  if (left === 'empty' || right === 'empty') return null;
  const same = left === right;
  const breaks = clue.relation === 'same' ? !same : same;
  if (!breaks) return null;

  const row = Math.floor(clue.a / size);
  const sameRow = row === Math.floor(clue.b / size);
  return {
    rule: 'edge-clue',
    line: sameRow ? 'row' : 'column',
    index: sameRow ? row : clue.a % size,
    cellIndexes: [clue.a, clue.b],
  };
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
