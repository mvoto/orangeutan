import { renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import type { Theme } from '../index';
import { placeholderTheme, ThemeProvider, useTheme } from '../index';

describe('useTheme', () => {
  it('falls back to the placeholder theme without a provider', async () => {
    const { result } = await renderHook(() => useTheme());

    expect(result.current).toBe(placeholderTheme);
  });

  it('returns the theme supplied by the provider', async () => {
    const custom: Theme = {
      ...placeholderTheme,
      name: 'custom',
      colors: { ...placeholderTheme.colors, background: '#000000' },
    };
    const wrapper = ({ children }: PropsWithChildren): React.JSX.Element => (
      <ThemeProvider theme={custom}>{children}</ThemeProvider>
    );

    const { result } = await renderHook(() => useTheme(), { wrapper });

    expect(result.current.name).toBe('custom');
    expect(result.current.colors.background).toBe('#000000');
  });
});

describe('placeholderTheme', () => {
  it('uses only neutral greys (no identity colors before approval)', () => {
    const neutral = /^#([0-9A-F]{2})\1\1$/i;
    const { danger, ...rest } = placeholderTheme.colors;

    expect(danger).toMatch(/^#[0-9A-F]{6}$/i);
    for (const value of Object.values(rest)) {
      expect(value).toMatch(neutral);
    }
  });
});
