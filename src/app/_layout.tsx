import type { ErrorBoundaryProps } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { placeholderTheme, ThemeProvider } from '@/theme';
import { ErrorFallback } from '@/ui';

// Must run at module scope, before the first render, or the splash may already be gone.
void SplashScreen.preventAutoHideAsync();

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps): React.JSX.Element {
  useEffect(() => {
    console.error('Unhandled render error', error);
    SplashScreen.hide();
  }, [error]);

  return <ErrorFallback onRetry={() => void retry()} />;
}

export default function RootLayout(): React.JSX.Element {
  return (
    <ThemeProvider theme={placeholderTheme}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: placeholderTheme.colors.background },
        }}
      />
    </ThemeProvider>
  );
}
