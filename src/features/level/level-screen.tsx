import { memo, useMemo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { brokenLines, cellIndex, levelOne } from '@/engine';
import type { Cell } from '@/engine';
import { useTheme } from '@/theme';
import { AppText, Button, Screen } from '@/ui';

import { useLevelSession } from './level-session';

const ruleCards = ['No three in a row', 'Balance'] as const;
const size = levelOne.size;

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
};

export function LevelScreen({ onBack }: LevelScreenProps): React.JSX.Element {
  const { colors, spacing, radii } = useTheme();
  const { cells, cycle } = useLevelSession();
  const outlined = useMemo(() => outlinedCells(cells), [cells]);
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
  const gridStyle = useMemo(
    () => ({ marginTop: spacing.lg, gap: spacing.xs }),
    [spacing.lg, spacing.xs],
  );
  const rowStyle = useMemo(() => [styles.row, { gap: spacing.xs }], [spacing.xs]);
  const cellStyle = useMemo(
    () => [
      styles.cell,
      {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderStyle: 'solid' as const,
      },
    ],
    [colors.surface, colors.border],
  );
  const brokenCellStyle = useMemo(
    () => [
      styles.cell,
      {
        backgroundColor: colors.surface,
        borderColor: colors.textPrimary,
        borderStyle: 'dashed' as const,
      },
    ],
    [colors.surface, colors.textPrimary],
  );

  return (
    <Screen testID="level-screen">
      <Button label="Back" onPress={onBack} />
      <View style={cardsStyle}>
        {ruleCards.map((title) => (
          <View key={title} style={cardStyle}>
            <AppText>{title}</AppText>
          </View>
        ))}
      </View>
      <View style={gridStyle}>
        {Array.from({ length: size }, (_, row) => (
          <View key={row} style={rowStyle}>
            {Array.from({ length: size }, (_, column) => {
              const index = cellIndex(row, column, size);
              const cell = cells[index] ?? 'empty';
              return (
                <GridCell
                  key={column}
                  index={index}
                  row={row}
                  column={column}
                  cell={cell}
                  onCycle={cycle}
                  style={outlined.has(index) ? brokenCellStyle : cellStyle}
                />
              );
            })}
          </View>
        ))}
      </View>
    </Screen>
  );
}

const GridCell = memo(function GridCell({
  index,
  row,
  column,
  cell,
  onCycle,
  style,
}: GridCellProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Row ${row + 1}, column ${column + 1}, ${cell}`}
      onPress={() => onCycle(index)}
      style={style}
    >
      <AppText align="center">{mark(cell)}</AppText>
    </Pressable>
  );
});

function outlinedCells(cells: readonly Cell[]): ReadonlySet<number> {
  const indexes = new Set<number>();
  for (const broken of brokenLines(cells)) {
    for (const index of broken.cellIndexes) indexes.add(index);
  }
  return indexes;
}

function mark(cell: Cell): string {
  switch (cell) {
    case 'monkey':
      return 'M';
    case 'orange':
      return 'O';
    case 'empty':
      return '';
    default: {
      const neverCell: never = cell;
      return neverCell;
    }
  }
}

const styles = StyleSheet.create({
  cards: { flexDirection: 'row', flexWrap: 'wrap' },
  card: { borderWidth: 1 },
  row: { flexDirection: 'row' },
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
