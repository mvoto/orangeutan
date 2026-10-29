import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppText, Button, playTimeLabel, Screen } from '@/ui';

const noAction = (): void => undefined;

/** Width / height of assets/mascot-home.jpg, the issue's chosen center drawing. */
const mascotAspectRatio = 768 / 1152;

type HomeScreenProps = {
  readonly onPlay?: () => void;
  /** Every Level is solved, so PLAY stays gone and the Score is visible. */
  readonly finished?: boolean;
  readonly score?: number | null;
  /** Current Level. Shown with PLAY, and hidden once the Score replaces it. */
  readonly level: number;
  /** Sum of Play time across every Level reached. */
  readonly playTime: number;
  readonly onShare?: () => void;
  /** Opens Privacy and Support. Home does not own that copy. */
  readonly onPrivacy?: () => void;
};

/** First screen after loading. The gear opens the Privacy policy and Support. See docs/adr/0002-anonymous-play.md. */
export function HomeScreen({
  onPlay = noAction,
  finished = false,
  score = null,
  level,
  playTime,
  onShare = noAction,
  onPrivacy = noAction,
}: HomeScreenProps): React.JSX.Element {
  const { spacing } = useTheme();
  const timer = playTimeLabel(playTime, 'total');
  const centerStyle = useMemo(() => [styles.center, { gap: spacing.lg }], [spacing.lg]);

  return (
    <Screen testID="home-screen">
      <View style={styles.statusRow}>
        {finished ? null : <AppText style={styles.level}>{`Level ${level}`}</AppText>}
        <AppText accessibilityLabel={timer}>{timer}</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Privacy and Support"
          onPress={onPrivacy}
          hitSlop={spacing.sm}
          style={styles.gearButton}
        >
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <AppText>⚙</AppText>
          </View>
        </Pressable>
      </View>
      <View style={centerStyle}>
        <View style={styles.mascotFrame} testID="mascot-frame">
          <Image
            accessible
            accessibilityRole="image"
            accessibilityLabel="Orangutan holding an orange"
            source={require('../../../assets/mascot-home.jpg')}
            resizeMode="contain"
            style={styles.mascot}
          />
        </View>
        {finished ? (
          <>
            <AppText>Score</AppText>
            <AppText>{score}</AppText>
            <Button label="Share" emphasis="primary" onPress={onShare} />
          </>
        ) : (
          <Button label="PLAY" emphasis="primary" onPress={onPlay} testID="play-button" />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  level: { marginRight: 'auto' },
  gearButton: {
    marginLeft: 'auto',
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // The frame owns the size. Image would otherwise lay out at the file's 1152px height and push PLAY off the screen.
  mascotFrame: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: mascotAspectRatio,
    flexShrink: 1,
  },
  mascot: { width: '100%', height: '100%' },
});
