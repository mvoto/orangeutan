import { router } from 'expo-router';

import { HomeScreen } from '@/features/home';

export default function HomeRoute(): React.JSX.Element {
  return <HomeScreen onPlay={() => router.push('/level')} />;
}
