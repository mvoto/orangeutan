import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppText, Screen } from '@/ui';

/** Placeholder until the game screen exists (milestone 6). */
export function HomeScreen(): React.JSX.Element {
  const { spacing } = useTheme();

  return (
    <Screen testID="home-screen">
      <View style={[styles.center, { gap: spacing.sm }]}>
        <AppText variant="title">Orangeutan</AppText>
        <AppText color="textSecondary">Gameplay coming soon.</AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
