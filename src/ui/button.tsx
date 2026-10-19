import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './app-text';

type ButtonProps = {
  label: string;
  onPress: () => void;
  testID?: string;
  /** `primary` is the one attention color. Other buttons stay on the surface. */
  emphasis?: 'primary' | 'quiet';
};

export function Button({
  label,
  onPress,
  testID,
  emphasis = 'quiet',
}: ButtonProps): React.JSX.Element {
  const { colors, spacing, radii } = useTheme();
  const primary = emphasis === 'primary';
  const reduceMotion = useReduceMotion();
  const [pressed, setPressed] = useState(false);
  const halo = useHalo(primary && reduceMotion === false);

  const face = (
    <Pressable
      accessibilityRole="button"
      testID={testID}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.base,
        {
          backgroundColor: primary ? colors.primary : colors.surface,
          borderColor: primary ? colors.primary : colors.border,
          borderRadius: radii.pill,
          paddingVertical: spacing.sm + spacing.xs,
          paddingHorizontal: primary ? spacing.lg + spacing.xs : spacing.lg,
          minWidth: primary ? 148 : undefined,
          opacity: !primary && pressed ? 0.7 : 1,
        },
      ]}
    >
      {primary ? <View pointerEvents="none" style={styles.highlight} /> : null}
      <AppText
        variant="button"
        color={primary ? 'textInverse' : 'textPrimary'}
        style={primary ? styles.playLabel : undefined}
      >
        {label}
      </AppText>
    </Pressable>
  );

  if (!primary) return face;

  return (
    <View style={[styles.lift, pressed ? styles.pressed : undefined]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.halo, { backgroundColor: withAlpha(colors.primary, 0.18), opacity: halo }]}
      />
      <View
        pointerEvents="none"
        style={[styles.slab, { backgroundColor: withAlpha(colors.textPrimary, 0.24) }]}
      />
      {face}
    </View>
  );
}

/** Pulses the cocoa ring. Stays still when the system asks for less motion. */
function useHalo(active: boolean): Animated.Value {
  const [halo] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!active) {
      halo.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(halo, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(halo, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, halo]);

  return halo;
}

function useReduceMotion(): boolean | null {
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    const apply = (value: boolean): void => {
      if (active) setReduceMotion(value);
    };
    void AccessibilityInfo.isReduceMotionEnabled().then(apply);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', apply);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}

function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', minHeight: 44, borderWidth: 2 },
  lift: { margin: 10, marginBottom: 18 },
  pressed: { transform: [{ scale: 0.96 }] },
  halo: { position: 'absolute', top: -10, right: -10, bottom: -10, left: -10, borderRadius: 999 },
  slab: { position: 'absolute', top: 8, right: 0, bottom: -8, left: 0, borderRadius: 999 },
  highlight: {
    position: 'absolute',
    top: 1,
    left: 18,
    right: 18,
    height: 7,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  playLabel: { letterSpacing: 1 },
});
