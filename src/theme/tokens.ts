import { Platform } from 'react-native';

/**
 * PLACEHOLDER tokens. Neutral greys and the system font only.
 * The real identity (palette, fonts) is chosen in milestone 5 and must be
 * previewed and approved by the owner before replacing anything here.
 */

export type ColorTokens = {
  readonly background: string;
  readonly surface: string;
  readonly surfaceMuted: string;
  readonly border: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textInverse: string;
  readonly accent: string;
  readonly primary: string;
  readonly danger: string;
};

export const placeholderColors: ColorTokens = {
  background: '#F2F2F2',
  surface: '#FFFFFF',
  surfaceMuted: '#E4E4E4',
  border: '#C8C8C8',
  textPrimary: '#222222',
  textSecondary: '#6B6B6B',
  textInverse: '#FFFFFF',
  accent: '#555555',
  primary: '#555555',
  danger: '#9A3B3B',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export type FontWeight = '400' | '500' | '600' | '700';

export type TextStyleToken = {
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly fontWeight: FontWeight;
};

export type TypographyTokens = {
  readonly display: TextStyleToken;
  readonly title: TextStyleToken;
  readonly body: TextStyleToken;
  readonly caption: TextStyleToken;
  readonly button: TextStyleToken;
};

const systemFont = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });

export const placeholderTypography: TypographyTokens = {
  display: { fontFamily: systemFont, fontSize: 34, lineHeight: 40, fontWeight: '700' },
  title: { fontFamily: systemFont, fontSize: 22, lineHeight: 28, fontWeight: '600' },
  body: { fontFamily: systemFont, fontSize: 16, lineHeight: 22, fontWeight: '400' },
  caption: { fontFamily: systemFont, fontSize: 13, lineHeight: 18, fontWeight: '400' },
  button: { fontFamily: systemFont, fontSize: 16, lineHeight: 20, fontWeight: '600' },
};
