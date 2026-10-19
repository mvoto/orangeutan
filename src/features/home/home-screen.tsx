import { Image, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { Button, Screen } from '@/ui';

const noAction = (): void => undefined;

/** Width / height of assets/mascot-home.jpg. */
const mascotAspectRatio = 768 / 1152;

/** First screen after loading. PLAY and Settings do nothing until later milestones. */
export function HomeScreen(): React.JSX.Element {
  const { spacing } = useTheme();

  return (
    <Screen testID="home-screen">
      <View style={styles.settingsRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          onPress={noAction}
          hitSlop={spacing.sm}
          style={styles.settingsButton}
        >
          <CogIcon />
        </Pressable>
      </View>
      <View style={[styles.center, { gap: spacing.lg }]}>
        <Image
          accessible
          accessibilityRole="image"
          accessibilityLabel="Orangutan holding an orange"
          source={require('../../../assets/mascot-home.jpg')}
          resizeMode="contain"
          style={styles.mascot}
        />
        <Button label="PLAY" onPress={noAction} testID="play-button" />
      </View>
    </Screen>
  );
}

function CogIcon(): React.JSX.Element {
  const { colors } = useTheme();
  const toothColor = colors.textPrimary;

  return (
    <View style={styles.cog}>
      {[0, 45, 90, 135].map((degrees) => (
        <View
          key={degrees}
          style={[
            styles.cogTeeth,
            { backgroundColor: toothColor, transform: [{ rotate: `${degrees}deg` }] },
          ]}
        />
      ))}
      <View style={[styles.cogHub, { backgroundColor: toothColor }]} />
      <View style={[styles.cogHole, { backgroundColor: colors.background }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  settingsRow: { alignItems: 'flex-end' },
  settingsButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mascot: { width: '100%', maxWidth: 320, aspectRatio: mascotAspectRatio },
  cog: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  cogTeeth: { position: 'absolute', width: 6, height: 28, borderRadius: 2 },
  cogHub: { width: 16, height: 16, borderRadius: 8 },
  cogHole: { position: 'absolute', width: 7, height: 7, borderRadius: 4 },
});
