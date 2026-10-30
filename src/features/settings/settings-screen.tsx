import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppText, BackButton, Screen } from '@/ui';

const noAction = (): void => undefined;

type SettingsScreenProps = {
  readonly nickname: string;
  readonly onBack?: () => void;
  readonly onNickname?: () => void;
  readonly onPrivacy?: () => void;
};

/** Settings leads to the Nickname and to Privacy and Support. It is not a preferences menu. */
export function SettingsScreen({
  nickname,
  onBack = noAction,
  onNickname = noAction,
  onPrivacy = noAction,
}: SettingsScreenProps): React.JSX.Element {
  const { spacing } = useTheme();
  const listStyle = useMemo(() => ({ gap: spacing.sm }), [spacing.sm]);

  return (
    <Screen testID="settings-screen">
      <BackButton onPress={onBack} />
      <AppText>Settings</AppText>
      <View style={listStyle}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Nickname, ${nickname}`}
          onPress={onNickname}
          style={styles.row}
        >
          <AppText>Nickname</AppText>
          <AppText>{nickname}</AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Privacy and Support"
          onPress={onPrivacy}
          style={styles.row}
        >
          <AppText>Privacy and Support</AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 44, justifyContent: 'center' },
});
