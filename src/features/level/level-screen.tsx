import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { brokenLines, cycleCell, levelOne } from '@/engine';
import type { Cell } from '@/engine';
import { useTheme } from '@/theme';
import { AppText, Screen } from '@/ui';

const ruleCards = ['No three in a row', 'Balance'] as const;
const size = levelOne.size;

/** Level 1. A quiet back control arrives with the session test. */
export function LevelScreen(): React.JSX.Element {
  const { colors, spacing, radii } = useTheme();
  const [cells, setCells] = useState<readonly Cell[]>(() =>
    levelOne.givens.map((given): Cell => given ?? 'empty'),
  );
  const outlined = outlinedCells(cells);

  return (
    <Screen testID="level-screen">
      <AppText variant="title">Level 1</AppText>
      <View style={[styles.cards, { gap: spacing.sm, marginTop: spacing.md }]}>
        {ruleCards.map((title) => (
          <View
            key={title}
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radii.md,
                padding: spacing.sm,
              },
            ]}
          >
            <AppText>{title}</AppText>
          </View>
        ))}
      </View>
      <View style={{ marginTop: spacing.lg, gap: spacing.xs }}>
        {Array.from({ length: size }, (_, row) => (
          <View key={row} style={[styles.row, { gap: spacing.xs }]}>
            {Array.from({ length: size }, (_, column) => {
              const index = row * size + column;
              const cell = cells[index] ?? 'empty';
              const breaks = outlined.has(index);
              return (
                <Pressable
                  key={column}
                  accessibilityRole="button"
                  accessibilityLabel={`Row ${row + 1}, column ${column + 1}, ${cell}`}
                  accessibilityHint={breaks ? 'Breaks a rule' : undefined}
                  onPress={() => setCells((current) => cycleCell(levelOne, current, index))}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: colors.surface,
                      borderColor: breaks ? colors.textPrimary : colors.border,
                      borderWidth: breaks ? 3 : 1,
                    },
                  ]}
                >
                  <AppText align="center">{mark(cell)}</AppText>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </Screen>
  );
}

function outlinedCells(cells: readonly Cell[]): ReadonlySet<number> {
  const indexes = new Set<number>();
  for (const broken of brokenLines(cells)) {
    for (let offset = 0; offset < size; offset += 1) {
      const index =
        broken.line === 'row' ? broken.index * size + offset : offset * size + broken.index;
      indexes.add(index);
    }
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
  },
});
