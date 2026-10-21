import { useVideoPlayer, VideoView } from 'expo-video';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppText, Button, Screen } from '@/ui';

/** The clip ships on this gold. Other Celebration chrome stays on the existing button. */
const celebrationGold = '#FDBF4E';

const noAction = (): void => undefined;

/** First of the two supplied clips. One clip keeps the Celebration stable. */
export const celebrationClip = require('../../../assets/orangeutan_celebration1.mp4') as number;

type CelebrationScreenProps = {
  readonly level: number;
  readonly onNext?: () => void;
  readonly onHome?: () => void;
};

export function CelebrationScreen({
  level,
  onNext,
  onHome,
}: CelebrationScreenProps): React.JSX.Element {
  const { spacing } = useTheme();
  const nextStyle = useMemo(() => [styles.next, { gap: spacing.sm }], [spacing.sm]);
  const player = useVideoPlayer(celebrationClip, (ready) => {
    ready.muted = true;
    ready.loop = false;
    ready.play();
  });

  return (
    <Screen testID="celebration-screen" style={styles.screen}>
      <VideoView
        player={player}
        style={styles.clip}
        nativeControls={false}
        contentFit="contain"
        accessibilityLabel="Orangutan and orange celebrating"
      />
      <View style={nextStyle}>
        <AppText>{`Level ${level}`}</AppText>
        <Button
          label={onHome === undefined ? 'Next' : 'Home'}
          emphasis="primary"
          onPress={onHome ?? onNext ?? noAction}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: celebrationGold, padding: 0 },
  clip: { flex: 1 },
  next: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});
