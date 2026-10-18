import { useMemo } from 'react';
import type { TextProps } from 'react-native';
import { Text } from 'react-native';

import type { ColorTokens, TypographyTokens } from '@/theme';
import { useTheme } from '@/theme';

type AppTextProps = TextProps & {
  variant?: keyof TypographyTokens;
  color?: keyof ColorTokens;
  align?: 'auto' | 'left' | 'center' | 'right';
};

export function AppText({
  variant = 'body',
  color = 'textPrimary',
  align = 'auto',
  style,
  ...rest
}: AppTextProps): React.JSX.Element {
  const { typography, colors } = useTheme();
  const themed = useMemo(
    () => ({ ...typography[variant], color: colors[color], textAlign: align }),
    [typography, colors, variant, color, align],
  );

  return <Text {...rest} style={[themed, style]} />;
}
