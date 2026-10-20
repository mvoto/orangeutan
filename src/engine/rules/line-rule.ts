import type { Cell } from '../types';

export type LineRuleName = 'no-three-in-a-row' | 'balance';

/** A broken row, column, or Edge clue. */
export type RuleName = LineRuleName | 'edge-clue';

export type LineRule = {
  readonly name: LineRuleName;
  broken(line: readonly Cell[]): boolean;
};
