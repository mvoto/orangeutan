import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import HomeRoute from '@/app/home';
import LevelRoute from '@/app/level';
import RootLayout from '@/app/_layout';
import { renderWithTheme } from '@/test/render-with-theme';

import { LevelScreen } from '../level-screen';
import { LevelSessionProvider } from '../level-session';

function renderLevel(): ReturnType<typeof renderWithTheme> {
  return renderWithTheme(
    <LevelSessionProvider>
      <LevelScreen />
    </LevelSessionProvider>,
  );
}

describe('Level 1', () => {
  it('shows cards for no three in a row and balance', async () => {
    await renderLevel();

    expect(screen.getByText('No three in a row')).toBeOnTheScreen();
    expect(screen.getByText('Balance')).toBeOnTheScreen();
  });

  it('cycles an empty cell through monkey and orange', async () => {
    await renderLevel();

    await fireEvent.press(screen.getByRole('button', { name: 'Row 1, column 3, empty' }));
    expect(screen.getByRole('button', { name: 'Row 1, column 3, monkey' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Row 1, column 3, monkey' }));
    expect(screen.getByRole('button', { name: 'Row 1, column 3, orange' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Row 1, column 3, orange' }));
    expect(screen.getByRole('button', { name: 'Row 1, column 3, empty' })).toBeOnTheScreen();
  });

  it('outlines every cell in a broken row', async () => {
    await renderLevel();

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
    await renderLevel();

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

  it('returns to the PLAY screen and keeps placed Symbols for the session', async () => {
    const router = await renderRouter(
      { _layout: RootLayout, home: HomeRoute, level: LevelRoute },
      { initialUrl: '/home' },
    );

    await screen.findByRole('button', { name: 'PLAY' }, { timeout: 3000 });
    await fireEvent.press(screen.getByRole('button', { name: 'PLAY' }));
    await screen.findByTestId('level-screen', {}, { timeout: 3000 });

    await fireEvent.press(screen.getByRole('button', { name: 'Row 1, column 3, empty' }));
    expect(screen.getByRole('button', { name: 'Row 1, column 3, monkey' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));

    expect(await screen.findByTestId('home-screen', {}, { timeout: 3000 })).toBeOnTheScreen();
    expect(router.getPathname()).toBe('/home');

    await fireEvent.press(screen.getByRole('button', { name: 'PLAY' }));
    expect(
      await screen.findByRole('button', { name: 'Row 1, column 3, monkey' }, { timeout: 3000 }),
    ).toBeOnTheScreen();
  });
});
