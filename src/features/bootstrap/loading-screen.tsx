import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppText, Button, LogoPlaceholder, Screen } from '@/ui';

import type { BootstrapStatus } from './use-bootstrap';

type LoadingScreenProps = {
  status: BootstrapStatus;
  onRetry: () => void;
  /** Fires once the screen is laid out, so the native splash can hide without a blank frame. */
  onLayout?: () => void;
};

export function LoadingScreen({
  status,
  onRetry,
  onLayout,
}: LoadingScreenProps): React.JSX.Element {
  const { colors, spacing } = useTheme();

  return (
    <Screen testID="loading-screen">
      <View
        testID="loading-content"
        style={[styles.center, { gap: spacing.xl }]}
        onLayout={onLayout}
      >
        <LogoPlaceholder />
        {status === 'error' ? (
          <View style={[styles.center, { gap: spacing.md }]}>
            <AppText color="textSecondary" align="center">
              We couldn&apos;t start the game.
            </AppText>
            <Button label="Try again" onPress={onRetry} testID="bootstrap-retry" />
          </View>
        ) : (
          <ActivityIndicator testID="loading-indicator" color={colors.textSecondary} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
