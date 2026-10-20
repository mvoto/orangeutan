import type { Cell } from './types';

/** A hole in a grid is a programmer bug. Rules do not treat it as play. */
export function cellAt(cells: readonly Cell[], index: number): Cell {
  const cell = cells[index];
  if (cell === undefined) {
    throw new Error(`Missing cell ${index}`);
  }
  return cell;
}
