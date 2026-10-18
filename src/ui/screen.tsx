import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

type ScreenProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;

export function Screen({ children, style, testID }: ScreenProps): React.JSX.Element {
  const { colors, spacing } = useTheme();

  return (
    <SafeAreaView
      testID={testID}
      style={[styles.root, { backgroundColor: colors.background, padding: spacing.md }, style]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
