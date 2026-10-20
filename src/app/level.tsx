import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { LevelScreen, useLevelSession } from '@/features/level';

export default function LevelRoute(): React.JSX.Element {
  const router = useRouter();
  const { celebrate, advance } = useLevelSession();

  useEffect(() => {
    if (!celebrate) return;
    advance();
    router.replace('/celebration');
  }, [celebrate, advance, router]);

  return <LevelScreen onBack={() => router.back()} />;
}
