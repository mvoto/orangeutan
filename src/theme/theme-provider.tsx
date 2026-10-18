import type { PropsWithChildren } from 'react';
import { createContext, useContext } from 'react';

import type { Theme } from './theme';
import { placeholderTheme } from './theme';

// Defaulting to the placeholder theme lets fallback UIs (like the root error
// boundary) render safely even outside the provider.
const ThemeContext = createContext<Theme>(placeholderTheme);

type ThemeProviderProps = PropsWithChildren<{ theme?: Theme }>;

export function ThemeProvider({
  theme = placeholderTheme,
  children,
}: ThemeProviderProps): React.JSX.Element {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
