import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';

import { bootstrapTasks, LoadingScreen, MIN_LOADING_MS, useBootstrap } from '@/features/bootstrap';

const bootstrapOptions = { minDurationMs: MIN_LOADING_MS };

export default function LoadingRoute(): React.JSX.Element {
  const { status, retry } = useBootstrap(bootstrapTasks, bootstrapOptions);
  const hideNativeSplash = useCallback(() => SplashScreen.hide(), []);

  if (status === 'ready') {
    return <Redirect href="/home" />;
  }

  return <LoadingScreen status={status} onRetry={retry} onLayout={hideNativeSplash} />;
}
