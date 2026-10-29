import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppText, Screen } from '@/ui';

const policySentences = [
  'Play time and progress stay on the device.',
  'Deleting the app deletes Play time and progress.',
  'The game collects no name.',
  'The game is not directed to children under 13.',
] as const;

type PrivacyScreenProps = {
  readonly onBack: () => void;
  /** Visible address Support opens. */
  readonly supportUrl: string;
  readonly onSupport: () => void;
};

/** Privacy policy and Support, on their own screen so Home stays put. */
export function PrivacyScreen({
  onBack,
  supportUrl,
  onSupport,
}: PrivacyScreenProps): React.JSX.Element {
  const { colors, spacing } = useTheme();
  const copyStyle = useMemo(() => ({ gap: spacing.sm }), [spacing.sm]);
  const backArrowStyle = useMemo(
    () => [styles.arrow, { borderColor: colors.textSecondary }],
    [colors.textSecondary],
  );

  return (
    <Screen testID="privacy-screen">
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
      <View style={copyStyle}>
        {policySentences.map((sentence) => (
          <AppText key={sentence}>{sentence}</AppText>
        ))}
        <AppText>Support</AppText>
        <Pressable accessibilityRole="link" onPress={onSupport} style={styles.link}>
          <AppText>{supportUrl}</AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  arrow: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  link: { minHeight: 44, justifyContent: 'center' },
});
