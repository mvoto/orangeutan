import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './app-text';

type ButtonProps = {
  label: string;
  onPress: () => void;
  testID?: string;
};

export function Button({ label, onPress, testID }: ButtonProps): React.JSX.Element {
  const { colors, spacing, radii } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: colors.primary,
          borderRadius: radii.pill,
          paddingVertical: spacing.sm + spacing.xs,
          paddingHorizontal: spacing.lg,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <AppText variant="button" color="textInverse">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
});
