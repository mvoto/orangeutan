import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithTheme } from '@/test/render-with-theme';

import { LevelScreen } from '../level-screen';

describe('Level 1', () => {
  it('shows cards for no three in a row and balance', async () => {
    await renderWithTheme(<LevelScreen />);

    expect(screen.getByText('No three in a row')).toBeOnTheScreen();
    expect(screen.getByText('Balance')).toBeOnTheScreen();
  });

  it('cycles an empty cell through monkey and orange', async () => {
    await renderWithTheme(<LevelScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Row 1, column 3, empty' }));
    expect(screen.getByRole('button', { name: 'Row 1, column 3, monkey' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Row 1, column 3, monkey' }));
    expect(screen.getByRole('button', { name: 'Row 1, column 3, orange' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Row 1, column 3, orange' }));
    expect(screen.getByRole('button', { name: 'Row 1, column 3, empty' })).toBeOnTheScreen();
  });
});
