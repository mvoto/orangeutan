import type { Cell } from '../types';

export type LineRule = {
  readonly name: string;
  broken(line: readonly Cell[]): boolean;
};
