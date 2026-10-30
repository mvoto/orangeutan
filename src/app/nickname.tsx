import { router } from 'expo-router';

import { useLevelSession } from '@/features/level';
import { acceptedNickname } from '@/features/nickname/nickname';
import { NicknameScreen } from '@/features/nickname/nickname-screen';

export default function NicknameRoute(): React.JSX.Element {
  const { nickname, rename } = useLevelSession();

  return (
    <NicknameScreen
      nickname={nickname}
      onBack={() => router.back()}
      onRename={(draft) => {
        rename(draft);
        return acceptedNickname(draft) !== null;
      }}
    />
  );
}
