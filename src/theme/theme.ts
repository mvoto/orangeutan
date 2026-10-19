import { treehouseLight, treehouseType } from './treehouse';
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

/** Approved Treehouse light palette and Soft type pairing, used by the live app. */
export const treehouseTheme: Theme = {
  name: 'treehouse',
  colors: {
    background: treehouseLight.background,
    surface: treehouseLight.surface,
    surfaceMuted: treehouseLight.surface,
    textPrimary: treehouseLight.text,
    textSecondary: treehouseLight.text,
    textInverse: '#FFFFFF',
    accent: treehouseLight.accent,
    primary: treehouseLight.primary,
    border: treehouseLight.text,
    // No approved error color yet, so failures stay in the text color rather than a new hue.
    danger: treehouseLight.text,
  },
  typography: {
    display: { ...placeholderTypography.display, fontFamily: treehouseType.display },
    title: { ...placeholderTypography.title, fontFamily: treehouseType.display },
    body: { ...placeholderTypography.body, fontFamily: treehouseType.body },
    caption: { ...placeholderTypography.caption, fontFamily: treehouseType.body },
    button: { ...placeholderTypography.button, fontFamily: treehouseType.body },
  },
  spacing,
  radii,
};
