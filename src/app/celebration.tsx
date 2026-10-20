import { useRouter } from 'expo-router';

import { CelebrationScreen } from '@/features/celebration/celebration-screen';

export default function CelebrationRoute(): React.JSX.Element {
  const router = useRouter();
  return <CelebrationScreen onNext={() => router.replace('/level')} />;
}
