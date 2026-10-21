import { Fragment, memo, useMemo, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { brokenLines, cellIndex } from '@/engine';
import type { Cell, EdgeClue } from '@/engine';
import type { ColorTokens } from '@/theme';
import { compactOrangeSvg, grinMonkeySvg, useTheme } from '@/theme';
import { AppText, Button, playTimeLabel, Screen } from '@/ui';

import { useLevelSession } from './level-session';
import { RuleDiagram } from './rule-diagram';
import {
  firstUnseen,
  oppositeMark,
  ruleAfterClose,
  ruleCopy,
  rulesOnPuzzle,
  sameMark,
} from './rules';
import type { RuleId } from './rules';

type LevelScreenProps = {
  readonly onBack: () => void;
};

type GridCellProps = {
  readonly index: number;
  readonly row: number;
  readonly column: number;
  readonly cell: Cell;
  readonly onCycle: (index: number) => void;
  readonly style: StyleProp<ViewStyle>;
  readonly wash: StyleProp<ViewStyle>;
};

export function LevelScreen({ onBack }: LevelScreenProps): React.JSX.Element {
  const { colors, spacing, radii } = useTheme();
  const { cells, clear, cycle, level, playSeconds, puzzle, remembered, remember } =
    useLevelSession();
  const timer = playTimeLabel(playSeconds);
  const size = puzzle.size;
  const rules = useMemo(() => rulesOnPuzzle(puzzle), [puzzle]);
  // The Level route remounts after the Celebration, so the first unremembered rule opens again.
  const [openRule, setOpenRule] = useState<RuleId | null>(() => firstUnseen(puzzle, remembered));
  const outlined = useMemo(() => outlinedCells(cells, puzzle.edgeClues), [cells, puzzle.edgeClues]);
  const headerStyle = useMemo(() => [styles.header, { gap: spacing.sm }], [spacing.sm]);
  const backArrowStyle = useMemo(
    () => [styles.arrow, { borderColor: colors.textSecondary }],
    [colors.textSecondary],
  );
  const cardsStyle = useMemo(
    () => [styles.cards, { gap: spacing.sm, marginTop: spacing.md }],
    [spacing.sm, spacing.md],
  );
  const cardStyle = useMemo(
    () => [
      styles.card,
      {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radii.md,
        padding: spacing.sm,
      },
    ],
    [colors.surface, colors.border, radii.md, spacing.sm],
  );
  const gridStyle = useMemo(() => ({ marginTop: spacing.lg }), [spacing.lg]);
  const clearStyle = useMemo(
    () => ({ marginTop: spacing.md, alignItems: 'flex-start' as const }),
    [spacing.md],
  );
  const gapStyle = useMemo(() => ({ width: spacing.xs, height: spacing.xs }), [spacing.xs]);
  const cellStyle = useMemo(
    () => [styles.cell, { borderColor: colors.border, borderStyle: 'solid' as const }],
    [colors.border],
  );
  const brokenCellStyle = useMemo(
    () => [styles.cell, { borderColor: colors.textPrimary, borderStyle: 'dashed' as const }],
    [colors.textPrimary],
  );
  const washes = useMemo(() => washStyles(colors), [colors]);
  const sheetStyle = useMemo(
    () => [
      styles.card,
      {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radii.md,
        padding: spacing.md,
        marginTop: spacing.md,
        gap: spacing.sm,
      },
    ],
    [colors.surface, colors.border, radii.md, spacing.md, spacing.sm],
  );
  const dismiss = (): void => {
    if (openRule === null) return;
    if (!remembered[openRule]) remember(openRule);
    setOpenRule(ruleAfterClose(puzzle, remembered, openRule));
  };
  const showRule = (rule: RuleId): void => {
    if (rule === openRule) return;
    setOpenRule(rule);
  };

  return (
    <Screen testID="level-screen">
      <View style={headerStyle}>
        {openRule === null ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={onBack}
            hitSlop={spacing.sm}
            style={styles.back}
          >
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={backArrowStyle}
            />
          </Pressable>
        ) : (
          <View style={styles.back} />
        )}
        <AppText>{`Level ${level}`}</AppText>
        <AppText accessibilityLabel={timer}>{timer}</AppText>
      </View>
      <View style={cardsStyle}>
        {rules.map((rule) => (
          <Pressable
            key={rule}
            accessibilityRole="button"
            accessibilityLabel={ruleCopy[rule].title}
            onPress={() => showRule(rule)}
            style={cardStyle}
          >
            <RuleDiagram rule={rule} size={18} asImage={false} />
            <AppText>{ruleCopy[rule].title}</AppText>
          </Pressable>
        ))}
      </View>
      {openRule === null ? null : (
        <View style={sheetStyle}>
          <AppText variant="display">{ruleCopy[openRule].title}</AppText>
          <RuleDiagram rule={openRule} size={44} asImage />
          <AppText variant="body">{ruleCopy[openRule].sentence}</AppText>
          <Button label="Close" onPress={dismiss} />
        </View>
      )}
      <View style={gridStyle}>
        {Array.from({ length: size }, (_, row) => (
          <Fragment key={row}>
            <View style={styles.row}>
              {Array.from({ length: size }, (_, column) => {
                const index = cellIndex(row, column, size);
                const cell = cells[index] ?? 'empty';
                return (
                  <Fragment key={column}>
                    <GridCell
                      index={index}
                      row={row}
                      column={column}
                      cell={cell}
                      onCycle={openRule === null ? cycle : ignoreCycle}
                      style={outlined.has(index) ? brokenCellStyle : cellStyle}
                      wash={washes[cell]}
                    />
                    {column < size - 1 ? (
                      <EdgeMark
                        clue={edgeClueBetween(puzzle.edgeClues, index, index + 1)}
                        gapStyle={gapStyle}
                      />
                    ) : null}
                  </Fragment>
                );
              })}
            </View>
            {row < size - 1 ? (
              <View style={styles.row}>
                {Array.from({ length: size }, (_, column) => {
                  const index = cellIndex(row, column, size);
                  const beside = edgeClueBetween(puzzle.edgeClues, index, index + 1);
                  return (
                    <Fragment key={column}>
                      <View style={styles.markCell}>
                        <EdgeMark
                          clue={edgeClueBetween(puzzle.edgeClues, index, index + size)}
                          gapStyle={gapStyle}
                        />
                      </View>
                      {column < size - 1 ? (
                        <View style={beside === undefined ? gapStyle : styles.clue} />
                      ) : null}
                    </Fragment>
                  );
                })}
              </View>
            ) : null}
          </Fragment>
        ))}
      </View>
      <View style={clearStyle}>
        <Button label="Clear" onPress={clear} />
      </View>
    </Screen>
  );
}

function ignoreCycle(_index: number): void {}

const GridCell = memo(function GridCell({
  index,
  row,
  column,
  cell,
  onCycle,
  style,
  wash,
}: GridCellProps): React.JSX.Element {
  const xml = symbolXml(cell);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Row ${row + 1}, column ${column + 1}, ${cell}`}
      onPress={() => onCycle(index)}
      style={[style, wash]}
    >
      {xml === null ? null : (
        <SvgXml xml={xml} width="72%" height="72%" testID={`symbol-${cell}`} accessible={false} />
      )}
    </Pressable>
  );
});

function outlinedCells(
  cells: readonly Cell[],
  edgeClues: readonly EdgeClue[],
): ReadonlySet<number> {
  const indexes = new Set<number>();
  for (const broken of brokenLines(cells, edgeClues)) {
    for (const index of broken.cellIndexes) indexes.add(index);
  }
  return indexes;
}

function edgeClueBetween(
  clues: readonly EdgeClue[],
  left: number,
  right: number,
): EdgeClue | undefined {
  return clues.find(
    (clue) => (clue.a === left && clue.b === right) || (clue.a === right && clue.b === left),
  );
}

function EdgeMark({
  clue,
  gapStyle,
}: {
  readonly clue: EdgeClue | undefined;
  readonly gapStyle: StyleProp<ViewStyle>;
}): React.JSX.Element {
  if (clue === undefined) return <View style={gapStyle} />;

  const same = clue.relation === 'same';
  return (
    <View
      style={styles.clue}
      accessible
      accessibilityLabel={same ? 'Edge clue, same' : 'Edge clue, opposite'}
    >
      <AppText>{same ? sameMark : oppositeMark}</AppText>
    </View>
  );
}

function washStyles(colors: ColorTokens): Record<Cell, ViewStyle> {
  return StyleSheet.create({
    empty: { backgroundColor: colors.surface },
    monkey: { backgroundColor: colors.monkey },
    orange: { backgroundColor: colors.orange },
  });
}

function symbolXml(cell: Cell): string | null {
  switch (cell) {
    case 'monkey':
      return grinMonkeySvg;
    case 'orange':
      return compactOrangeSvg;
    case 'empty':
      return null;
    default: {
      const neverCell: never = cell;
      return neverCell;
    }
  }
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  arrow: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  cards: { flexDirection: 'row', flexWrap: 'wrap' },
  card: { borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  markCell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  clue: { width: 16, alignItems: 'center', justifyContent: 'center' },
  cell: {
    flex: 1,
    aspectRatio: 1,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
