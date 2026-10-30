import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput } from 'react-native';

import { useTheme } from '@/theme';
import { AppText, BackButton, Button, Screen } from '@/ui';

const noAction = (): void => undefined;
const decline = (): boolean => false;

type NicknameScreenProps = {
  /** The name stored on this device. A rejected edit returns to this. */
  readonly nickname: string;
  readonly onBack?: () => void;
  /** Returns true when this draft replaces the Nickname. */
  readonly onRename?: (nickname: string) => boolean;
};

/** The player edits the Nickname here. Home only greets with it. */
export function NicknameScreen({
  nickname,
  onBack = noAction,
  onRename = decline,
}: NicknameScreenProps): React.JSX.Element {
  const { colors, spacing, radii, typography } = useTheme();
  const [draft, setDraft] = useState<string | null>(null);
  const [rejected, setRejected] = useState(false);
  const shown = draft ?? nickname;
  const copyStyle = useMemo(() => ({ gap: spacing.sm }), [spacing.sm]);
  const fieldStyle = useMemo(
    () => [
      styles.field,
      {
        color: colors.textPrimary,
        fontFamily: typography.body.fontFamily,
        fontSize: typography.body.fontSize,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        borderRadius: radii.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
      },
    ],
    [colors, typography.body, radii.sm, spacing.sm, spacing.xs],
  );

  const save = (): void => {
    const kept = onRename(shown);
    if (kept) {
      onBack();
      return;
    }
    setDraft(null);
    setRejected(true);
  };

  return (
    <Screen testID="nickname-screen">
      <BackButton onPress={onBack} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={copyStyle}>
        <AppText>Nickname</AppText>
        <TextInput
          accessibilityLabel="Nickname"
          value={shown}
          onChangeText={(value) => {
            setDraft(value);
            setRejected(false);
          }}
          onSubmitEditing={save}
          autoCorrect={false}
          autoCapitalize="words"
          style={fieldStyle}
        />
        {rejected ? <AppText>That Nickname was not kept.</AppText> : null}
        <Button label="Save" emphasis="primary" onPress={save} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: { minHeight: 44, borderWidth: 1 },
});
