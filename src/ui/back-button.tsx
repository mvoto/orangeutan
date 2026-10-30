import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

type BackButtonProps = {
  readonly onPress: () => void;
};

/** The same back control Privacy uses, for screens reached from Settings. */
export function BackButton({ onPress }: BackButtonProps): React.JSX.Element {
  const { colors, spacing } = useTheme();
  const arrowStyle = useMemo(
    () => [styles.arrow, { borderColor: colors.textSecondary }],
    [colors.textSecondary],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onPress}
      hitSlop={spacing.sm}
      style={styles.back}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={arrowStyle}
      />
    </Pressable>
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
});
