import type { Line } from './types';

export function cellIndex(row: number, column: number, size: number): number {
  return row * size + column;
}

export function lineCellIndexes(line: Line, index: number, size: number): readonly number[] {
  const indexes: number[] = [];
  for (let offset = 0; offset < size; offset += 1) {
    indexes.push(line === 'row' ? cellIndex(index, offset, size) : cellIndex(offset, index, size));
  }
  return indexes;
}
