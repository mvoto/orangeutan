/** A monkey or an orange. The two marks a cell can hold. */
export type Symbol = 'monkey' | 'orange';

/** A cell is empty until it holds a Symbol. */
export type Cell = Symbol | 'empty';

export type Line = 'row' | 'column';

/** A 4×4 Puzzle. Givens are locked Symbols; null cells are for the player. */
export type Puzzle = {
  readonly size: 4;
  readonly edgeClues: readonly [];
  readonly givens: readonly (Symbol | null)[];
};
