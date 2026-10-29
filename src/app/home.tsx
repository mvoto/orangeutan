import { router } from 'expo-router';

import { HomeScreen } from '@/features/home';
import { useLevelSession } from '@/features/level';
import { deviceScoreShare } from '@/services/score-share';

export default function HomeRoute(): React.JSX.Element {
  const { finished, level, playTime, score, nickname, rename } = useLevelSession();

  return (
    <HomeScreen
      onPlay={() => router.push('/level')}
      finished={finished}
      level={level}
      playTime={playTime}
      score={score}
      nickname={nickname}
      onRename={rename}
      onShare={() => {
        if (score === null) return;
        void deviceScoreShare.share(score).catch(() => undefined);
      }}
      onPrivacy={() => router.push('/privacy')}
    />
  );
}
