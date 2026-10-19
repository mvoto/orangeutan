import { Image, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppText, Button, Screen } from '@/ui';

const noAction = (): void => undefined;

/** Width / height of assets/mascot-home.jpg, the issue's chosen center drawing. */
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
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <AppText>⚙</AppText>
          </View>
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
        <Button label="PLAY" emphasis="primary" onPress={noAction} testID="play-button" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  settingsRow: { alignItems: 'flex-end' },
  settingsButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mascot: { width: '100%', maxWidth: 320, aspectRatio: mascotAspectRatio },
});
