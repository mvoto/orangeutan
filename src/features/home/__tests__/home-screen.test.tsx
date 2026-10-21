import { screen } from '@testing-library/react-native';

import { renderWithTheme } from '@/test/render-with-theme';

import { HomeScreen } from '../home-screen';

describe('<HomeScreen />', () => {
  it('offers a PLAY button', async () => {
    await renderWithTheme(<HomeScreen level={1} playTime={0} />);

    expect(screen.getByRole('button', { name: 'PLAY' })).toBeOnTheScreen();
    expect(screen.queryByText('Score')).not.toBeOnTheScreen();
  });

  it('shows a Settings control', async () => {
    await renderWithTheme(<HomeScreen level={1} playTime={0} />);

    expect(screen.getByRole('button', { name: 'Settings' })).toBeOnTheScreen();
  });

  it('shows the orangutan holding an orange', async () => {
    await renderWithTheme(<HomeScreen level={1} playTime={0} />);

    expect(screen.getByRole('image', { name: 'Orangutan holding an orange' })).toBeOnTheScreen();
  });

  it('sizes the drawing to its frame so PLAY stays on screen', async () => {
    await renderWithTheme(<HomeScreen level={1} playTime={0} />);

    expect(screen.getByTestId('mascot-frame')).toHaveStyle({
      maxWidth: 320,
      aspectRatio: 768 / 1152,
      flexShrink: 1,
    });
    expect(screen.getByRole('image', { name: 'Orangutan holding an orange' })).toHaveStyle({
      width: '100%',
      height: '100%',
    });
  });
});
