import type { Puzzle } from '@/engine';

export const ruleOrder = ['no-three-in-a-row', 'balance', 'edge-clues'] as const;

export type RuleId = (typeof ruleOrder)[number];

export type RememberedRules = Readonly<Record<RuleId, boolean>>;

/** The same marks the grid draws between cells. */
export const sameMark = '=';
export const oppositeMark = '×';

type RuleCopy = {
  readonly title: string;
  readonly sentence: string;
  readonly diagram: string;
};

export const ruleCopy: Record<RuleId, RuleCopy> = {
  'no-three-in-a-row': {
    title: 'No three in a row',
    sentence: 'Not three of the same in a row or a column.',
    diagram: 'Three monkeys in a row, not allowed. Three oranges in a column, not allowed.',
  },
  balance: {
    title: 'Balance',
    sentence: 'Each row and each column is half and half.',
    diagram:
      'A row that is half monkeys and half oranges, with the monkeys grouped together. A column that is half monkeys and half oranges, with the monkeys grouped together.',
  },
  'edge-clues': {
    title: 'Edge clues',
    sentence: `${sameMark} means the same. ${oppositeMark} means different.`,
    diagram: 'An equals sign between two monkeys. A cross between a monkey and an orange.',
  },
};

export const noRulesRemembered: RememberedRules = {
  'no-three-in-a-row': false,
  balance: false,
  'edge-clues': false,
};

/** No three in a row and Balance are on every Puzzle. Edge clues only when the Puzzle has them. */
export function rulesOnPuzzle(puzzle: Puzzle): readonly RuleId[] {
  if (puzzle.edgeClues.length > 0) return ruleOrder;
  return ruleOrder.filter((rule) => rule !== 'edge-clues');
}

export function firstUnseen(puzzle: Puzzle, remembered: RememberedRules): RuleId | null {
  return rulesOnPuzzle(puzzle).find((rule) => !remembered[rule]) ?? null;
}

/** Closing remembers that rule, then opens the next one this Puzzle has not remembered. */
export function ruleAfterClose(
  puzzle: Puzzle,
  remembered: RememberedRules,
  closed: RuleId,
): RuleId | null {
  return firstUnseen(puzzle, { ...remembered, [closed]: true });
}
