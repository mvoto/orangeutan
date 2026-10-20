import { Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { SourceSans3_400Regular, SourceSans3_600SemiBold } from '@expo-google-fonts/source-sans-3';
import { useFonts } from 'expo-font';
import type { ErrorBoundaryProps } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { LevelSessionProvider } from '@/features/level';
import { deviceSaveStore } from '@/services/save-store';
import { treehouseTheme, treehouseType, ThemeProvider } from '@/theme';
import { ErrorFallback } from '@/ui';

const treehouseFonts = [
  {
    fontFamily: treehouseType.display,
    fontDefinitions: [
      { path: Nunito_600SemiBold, weight: 600 },
      { path: Nunito_700Bold, weight: 700 },
    ],
  },
  {
    fontFamily: treehouseType.body,
    fontDefinitions: [
      { path: SourceSans3_400Regular, weight: 400 },
      { path: SourceSans3_600SemiBold, weight: 600 },
    ],
  },
];

// Must run at module scope, before the first render, or the splash may already be gone.
void SplashScreen.preventAutoHideAsync();

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps): React.JSX.Element {
  useEffect(() => {
    console.error('Unhandled render error', error);
    SplashScreen.hide();
  }, [error]);

  return <ErrorFallback onRetry={() => void retry()} />;
}

export default function RootLayout(): React.JSX.Element | null {
  const [fontsLoaded, fontError] = useFonts(treehouseFonts);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider theme={treehouseTheme}>
      <LevelSessionProvider store={deviceSaveStore}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: treehouseTheme.colors.background },
          }}
        />
      </LevelSessionProvider>
    </ThemeProvider>
  );
}
