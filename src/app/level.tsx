import { useRouter } from 'expo-router';

import { LevelScreen } from '@/features/level';

export default function LevelRoute(): React.JSX.Element {
  const router = useRouter();
  return <LevelScreen onBack={() => router.back()} />;
}
