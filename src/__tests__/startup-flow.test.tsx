import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import HomeRoute from '@/app/home';
import LoadingRoute from '@/app/index';
import RootLayout from '@/app/_layout';

describe('app startup', () => {
  it('shows the loading screen, then lands on home', async () => {
    const router = await renderRouter(
      { _layout: RootLayout, index: LoadingRoute, home: HomeRoute },
      { initialUrl: '/' },
    );

    expect(screen.getByTestId('loading-screen')).toBeOnTheScreen();

    expect(await screen.findByTestId('home-screen', {}, { timeout: 3000 })).toBeOnTheScreen();
    expect(router.getPathname()).toBe('/home');
  });

  it('stays on home when PLAY or Settings is pressed', async () => {
    const router = await renderRouter(
      { _layout: RootLayout, index: LoadingRoute, home: HomeRoute },
      { initialUrl: '/' },
    );

    await screen.findByRole('button', { name: 'PLAY' }, { timeout: 3000 });
    fireEvent.press(screen.getByRole('button', { name: 'PLAY' }));
    fireEvent.press(screen.getByRole('button', { name: 'Settings' }));

    expect(router.getPathname()).toBe('/home');
  });
});
