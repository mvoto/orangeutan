import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './app-text';

/** Stand-in until the real logo is designed and approved (milestone 5). */
export function LogoPlaceholder(): React.JSX.Element {
  const { colors, radii, spacing } = useTheme();

  return (
    <View
      testID="logo-placeholder"
      accessibilityRole="image"
      accessibilityLabel="Orangeutan"
      style={styles.container}
    >
      <View
        style={[
          styles.mark,
          {
            borderColor: colors.border,
            backgroundColor: colors.surfaceMuted,
            borderRadius: radii.lg,
            marginBottom: spacing.md,
          },
        ]}
      >
        <AppText variant="caption" color="textSecondary">
          logo
        </AppText>
      </View>
      <AppText variant="display">Orangeutan</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  mark: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
