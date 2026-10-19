import { screen } from '@testing-library/react-native';

import { renderWithTheme } from '@/test/render-with-theme';

import { LevelScreen } from '../level-screen';

describe('Level 1', () => {
  it('shows cards for no three in a row and balance', async () => {
    await renderWithTheme(<LevelScreen />);

    expect(screen.getByText('No three in a row')).toBeOnTheScreen();
    expect(screen.getByText('Balance')).toBeOnTheScreen();
  });
});
