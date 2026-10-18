import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './app-text';
import { Button } from './button';
import { Screen } from './screen';

type ErrorFallbackProps = {
  message?: string;
  onRetry: () => void;
};

export function ErrorFallback({
  message = 'Something went wrong.',
  onRetry,
}: ErrorFallbackProps): React.JSX.Element {
  const { spacing } = useTheme();

  return (
    <Screen testID="error-fallback">
      <View style={[styles.center, { gap: spacing.md }]}>
        <AppText variant="title" align="center">
          Oops
        </AppText>
        <AppText color="textSecondary" align="center">
          {message}
        </AppText>
        <Button label="Try again" onPress={onRetry} testID="error-retry" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
