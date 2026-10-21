import { useRouter } from 'expo-router';

import { CelebrationScreen } from '@/features/celebration/celebration-screen';
import { useLevelSession } from '@/features/level';

export default function CelebrationRoute(): React.JSX.Element {
  const router = useRouter();
  const { advance, finished, level } = useLevelSession();

  if (finished) {
    return <CelebrationScreen level={level} onHome={() => router.replace('/home')} />;
  }

  return (
    <CelebrationScreen
      level={level}
      onNext={() => {
        advance();
        router.replace('/level');
      }}
    />
  );
}
