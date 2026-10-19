import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppText, Screen } from '@/ui';

const ruleCards = ['No three in a row', 'Balance'] as const;

/** Level 1. The grid and back arrive with the play tests. */
export function LevelScreen(): React.JSX.Element {
  const { colors, spacing, radii } = useTheme();

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
    </Screen>
  );
}

const styles = StyleSheet.create({
  cards: { flexDirection: 'row', flexWrap: 'wrap' },
  card: { borderWidth: 1 },
});
