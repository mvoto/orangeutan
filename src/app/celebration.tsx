import { useRouter } from 'expo-router';

import { CelebrationScreen } from '@/features/celebration/celebration-screen';
import { useLevelSession } from '@/features/level';

export default function CelebrationRoute(): React.JSX.Element {
  const router = useRouter();
  const { advance, finished } = useLevelSession();

  if (finished) {
    return <CelebrationScreen onHome={() => router.replace('/home')} />;
  }

  return (
    <CelebrationScreen
      onNext={() => {
        advance();
        router.replace('/level');
      }}
    />
  );
}
