import { screen } from '@testing-library/react-native';

import { renderWithTheme } from '@/test/render-with-theme';

import { HomeScreen } from '../home-screen';

describe('<HomeScreen />', () => {
  it('offers a PLAY button', async () => {
    await renderWithTheme(<HomeScreen />);

    expect(screen.getByRole('button', { name: 'PLAY' })).toBeOnTheScreen();
  });

  it('shows a Settings control', async () => {
    await renderWithTheme(<HomeScreen />);

    expect(screen.getByRole('button', { name: 'Settings' })).toBeOnTheScreen();
  });

  it('shows the orangutan holding an orange', async () => {
    await renderWithTheme(<HomeScreen />);

    expect(screen.getByRole('image', { name: 'Orangutan holding an orange' })).toBeOnTheScreen();
  });
});
