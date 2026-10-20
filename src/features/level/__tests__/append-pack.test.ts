import { appendPack, nextPackedPuzzle, packedLevels } from '../append-pack';

import type { Puzzle, Symbol } from '@/engine';

function puzzle(size: 6 | 8, givenCount: number, symbol: Symbol = 'monkey'): Puzzle {
  return {
    size,
    edgeClues: [],
    givens: Array.from({ length: size * size }, (_, index) => (index < givenCount ? symbol : null)),
  };
}

describe('packedLevels', () => {
  it('reads a shipped list and rejects anything else', () => {
    const shipped = puzzle(6, 1);

    expect(packedLevels([shipped])).toEqual([shipped]);
    expect(() => packedLevels({ size: 6 })).toThrow('Level pack is not a list');
    expect(() => packedLevels([{ size: 4, edgeClues: [], givens: [] }])).toThrow(
      'Shipped Level is not a 6×6 or an 8×8',
    );
  });
});

describe('nextPackedPuzzle', () => {
  it('continues the seed so two Levels at one Given count are not the same Puzzle', () => {
    const slot = { size: 6 as const, givenCount: 34 };
    const generate = (seed: number) => {
      if (seed === 34001) return { ok: false as const, error: { reason: 'miss' as const } };
      return {
        ok: true as const,
        value: puzzle(6, 34, seed === 34002 ? 'monkey' : 'orange'),
      };
    };

    const first = nextPackedPuzzle(slot, 34000, generate);
    const second = nextPackedPuzzle(slot, first.seed, generate);

    expect(first.seed).toBe(34002);
    expect(second.seed).toBe(34003);
    expect(first.puzzle.givens[0]).not.toBe(second.puzzle.givens[0]);
  });
});

describe('appendPack', () => {
  it('keeps a shipped Level at its index and appends the next one', () => {
    const shipped = puzzle(6, 34);
    const added = puzzle(6, 33, 'orange');
    const make = jest.fn(() => added);

    const packed = appendPack(
      [shipped],
      [
        { size: 6, givenCount: 34 },
        { size: 6, givenCount: 33 },
      ],
      make,
    );

    expect(packed[0]).toBe(shipped);
    expect(packed[1]).toBe(added);
    expect(make).toHaveBeenCalledTimes(1);
    expect(make).toHaveBeenCalledWith({ size: 6, givenCount: 33 });
  });

  it('refuses to replace a shipped Level with a different slot', () => {
    const shipped = puzzle(6, 34);

    expect(() => appendPack([shipped], [{ size: 6, givenCount: 30 }], () => shipped)).toThrow(
      'Refusing to renumber the pack',
    );
  });

  it('refuses to drop a shipped Level', () => {
    const shipped = [puzzle(6, 34), puzzle(6, 33)];

    expect(() => appendPack(shipped, [{ size: 6, givenCount: 34 }], () => shipped[0]!)).toThrow(
      'Refusing to drop Levels from the pack',
    );
  });

  it('refuses a pack that is not 6×6s then 8×8s with more Givens first', () => {
    const make = (): Puzzle => {
      throw new Error('should not build');
    };

    expect(() =>
      appendPack(
        [],
        [
          { size: 8, givenCount: 60 },
          { size: 6, givenCount: 30 },
        ],
        make,
      ),
    ).toThrow('Pack breaks the sequence order');

    expect(() =>
      appendPack(
        [],
        [
          { size: 6, givenCount: 30 },
          { size: 6, givenCount: 34 },
        ],
        make,
      ),
    ).toThrow('Pack breaks the sequence order');
  });
});
