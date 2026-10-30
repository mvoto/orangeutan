import { router } from 'expo-router';

import { useLevelSession } from '@/features/level';
import { SettingsScreen } from '@/features/settings';

export default function SettingsRoute(): React.JSX.Element {
  const { nickname } = useLevelSession();

  return (
    <SettingsScreen
      nickname={nickname}
      onBack={() => router.back()}
      onNickname={() => router.push('/nickname')}
      onPrivacy={() => router.push('/privacy')}
    />
  );
}
