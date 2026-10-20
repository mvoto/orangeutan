import { useRouter } from 'expo-router';

import { CelebrationScreen } from '@/features/celebration/celebration-screen';
import { useLevelSession } from '@/features/level';

export default function CelebrationRoute(): React.JSX.Element {
  const router = useRouter();
  const { advance } = useLevelSession();

  return (
    <CelebrationScreen
      onNext={() => {
        advance();
        router.replace('/level');
      }}
    />
  );
}
