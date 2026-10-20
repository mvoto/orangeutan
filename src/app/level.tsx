import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { LevelScreen, useLevelSession } from '@/features/level';

export default function LevelRoute(): React.JSX.Element {
  const router = useRouter();
  const { celebrate } = useLevelSession();

  useEffect(() => {
    if (!celebrate) return;
    router.replace('/celebration');
  }, [celebrate, router]);

  return <LevelScreen onBack={() => router.back()} />;
}
