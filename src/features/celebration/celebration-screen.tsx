import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View } from 'react-native';

import { Button, Screen } from '@/ui';

/** The clip ships on this gold. Other Celebration chrome stays on the existing button. */
const celebrationGold = '#FDBF4E';

const noAction = (): void => undefined;

/** First of the two supplied clips. One clip keeps the Celebration stable. */
export const celebrationClip = require('../../../assets/orangeutan_celebration1.mp4') as number;

type CelebrationScreenProps = {
  readonly onNext?: () => void;
  readonly onHome?: () => void;
};

export function CelebrationScreen({ onNext, onHome }: CelebrationScreenProps): React.JSX.Element {
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
      <View style={styles.next}>
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
  next: { padding: 16, alignItems: 'center' },
});
