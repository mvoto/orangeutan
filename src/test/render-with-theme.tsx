import type { RenderOptions } from '@testing-library/react-native';
import { render } from '@testing-library/react-native';
import type { PropsWithChildren, ReactElement } from 'react';

import type { Theme } from '@/theme';
import { placeholderTheme, ThemeProvider } from '@/theme';

export function renderWithTheme(
  ui: ReactElement,
  { theme = placeholderTheme, ...options }: RenderOptions & { theme?: Theme } = {},
): ReturnType<typeof render> {
  function Wrapper({ children }: PropsWithChildren): React.JSX.Element {
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
  }
  return render(ui, { ...options, wrapper: Wrapper });
}
