import type { ColorTokens, TypographyTokens } from './tokens';
import { placeholderColors, placeholderTypography, radii, spacing } from './tokens';

export type Theme = {
  readonly name: string;
  readonly colors: ColorTokens;
  readonly typography: TypographyTokens;
  readonly spacing: typeof spacing;
  readonly radii: typeof radii;
};

export const placeholderTheme: Theme = {
  name: 'placeholder',
  colors: placeholderColors,
  typography: placeholderTypography,
  spacing,
  radii,
};
