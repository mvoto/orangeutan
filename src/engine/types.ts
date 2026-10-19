/** A monkey or an orange. The two marks a cell can hold. */
export type Symbol = 'monkey' | 'orange';

/** A cell is empty until it holds a Symbol. */
export type Cell = Symbol | 'empty';

export type Line = 'row' | 'column';
