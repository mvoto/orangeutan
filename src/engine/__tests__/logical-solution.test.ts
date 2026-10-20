import { cellsFromGivens, levelOne, logicalSolution } from '../index';
import type { LogicalSolution } from '../index';
import type { Puzzle, Symbol } from '../types';

type CountIsNumber = number extends LogicalSolution['count'] ? true : false;
const countIsNumber: CountIsNumber = true;

function puzzle(givens: readonly (Symbol | null)[]): Puzzle {
  const size = Math.sqrt(givens.length);
  if (size !== 4 && size !== 6 && size !== 8) {
    throw new Error(`Unsupported board size ${givens.length}`);
  }
  return { size, edgeClues: [], givens };
}

describe('cellsFromGivens', () => {
  it('turns each Given into that Symbol and each open cell into empty', () => {
    expect(cellsFromGivens(levelOne)).toEqual([
      'orange',
      'orange',
      'empty',
      'empty',
      'empty',
      'empty',
      'monkey',
      'monkey',
      'empty',
      'empty',
      'empty',
      'empty',
      'empty',
      'empty',
      'empty',
      'empty',
    ]);
  });
});

describe('logicalSolution', () => {
  it('keeps count wide enough to hold a number other than 1', () => {
    expect(countIsNumber).toBe(true);
  });

  it('returns a failure when forced moves cannot continue', () => {
    const result = logicalSolution(
      puzzle([
        'monkey',
        'monkey',
        'monkey',
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ]),
    );

    expect(result).toEqual({ ok: false, error: { reason: 'forced-fill' } });
  });

  it('returns a failure when a cell is still empty after propagation', () => {
    const result = logicalSolution(puzzle(Array.from({ length: 16 }, () => null)));

    expect(result).toEqual({ ok: false, error: { reason: 'still-empty' } });
  });

  it('returns a failure when the completion count is not 1', () => {
    const result = logicalSolution(puzzle(Array.from({ length: 16 }, () => 'monkey' as const)));

    expect(result).toEqual({ ok: false, error: { reason: 'not-one', count: 0 } });
  });

  it('returns Level 1 as the one solution', () => {
    const result = logicalSolution(levelOne);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.count).toBe(1);
  });
});
