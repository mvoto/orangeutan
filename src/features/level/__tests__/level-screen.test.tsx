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

  it('outlines every cell in a broken row', async () => {
    await renderWithTheme(<LevelScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Row 3, column 1, empty' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Row 3, column 2, empty' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Row 3, column 3, empty' }));

    for (const name of [
      'Row 3, column 1, monkey',
      'Row 3, column 2, monkey',
      'Row 3, column 3, monkey',
      'Row 3, column 4, empty',
    ]) {
      expect(screen.getByRole('button', { name })).toHaveProp('accessibilityHint', 'Breaks a rule');
    }
    expect(screen.getByRole('button', { name: 'Row 4, column 1, empty' })).not.toHaveProp(
      'accessibilityHint',
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Row 3, column 3, monkey' }));
    expect(screen.getByRole('button', { name: 'Row 3, column 1, monkey' })).not.toHaveProp(
      'accessibilityHint',
    );
  });

  it('outlines every cell in a broken column', async () => {
    await renderWithTheme(<LevelScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Row 2, column 1, empty' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Row 2, column 1, monkey' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Row 3, column 1, empty' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Row 3, column 1, monkey' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Row 4, column 1, empty' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Row 4, column 1, monkey' }));

    for (const name of [
      'Row 1, column 1, orange',
      'Row 2, column 1, orange',
      'Row 3, column 1, orange',
      'Row 4, column 1, orange',
    ]) {
      expect(screen.getByRole('button', { name })).toHaveProp('accessibilityHint', 'Breaks a rule');
    }
    expect(screen.getByRole('button', { name: 'Row 3, column 2, empty' })).not.toHaveProp(
      'accessibilityHint',
    );
  });
});
