import { Image, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './app-text';

/** Launch mark. The same picture is the native splash. */
export function Logo(): React.JSX.Element {
  const { spacing } = useTheme();

  return (
    <View
      testID="logo"
      accessibilityRole="image"
      accessibilityLabel="Orangeutan"
      style={styles.container}
    >
      <Image
        accessible={false}
        source={require('../../assets/splash-icon.png')}
        resizeMode="contain"
        style={[styles.mark, { marginBottom: spacing.md }]}
      />
      <AppText variant="display">Orangeutan</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  mark: { width: 160, height: 160 },
});
