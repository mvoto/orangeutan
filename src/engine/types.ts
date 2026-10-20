/** A monkey or an orange. The two marks a cell can hold. */
export type Symbol = 'monkey' | 'orange';

/** A cell is empty until it holds a Symbol. */
export type Cell = Symbol | 'empty';

export type Line = 'row' | 'column';

export type EdgeRelation = 'same' | 'opposite';

/** A mark on the border between two orthogonally adjacent cells. */
export type EdgeClue = {
  readonly a: number;
  readonly b: number;
  readonly relation: EdgeRelation;
};

/** A Puzzle. Givens are locked Symbols; null cells are for the player. */
export type Puzzle = {
  readonly size: 4 | 6;
  readonly edgeClues: readonly EdgeClue[];
  readonly givens: readonly (Symbol | null)[];
};
