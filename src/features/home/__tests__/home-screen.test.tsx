import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithTheme } from '@/test/render-with-theme';

import { HomeScreen } from '../home-screen';

describe('<HomeScreen />', () => {
  it('offers a PLAY button', async () => {
    await renderWithTheme(<HomeScreen level={1} playTime={0} />);

    expect(screen.getByRole('button', { name: 'PLAY' })).toBeOnTheScreen();
    expect(screen.queryByText('Score')).not.toBeOnTheScreen();
  });

  it('opens the privacy policy from the gear', async () => {
    await renderWithTheme(<HomeScreen level={1} playTime={0} />);

    expect(screen.queryByText('Play time and progress stay on the device.')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Privacy and Support' }));

    expect(screen.getByText('Play time and progress stay on the device.')).toBeOnTheScreen();
    expect(screen.getByText('Deleting the app deletes them.')).toBeOnTheScreen();
    expect(screen.getByText('The game collects no name.')).toBeOnTheScreen();
    expect(screen.getByText('The game is not directed to children under 13.')).toBeOnTheScreen();
  });

  it('opens Support from Home in the app', async () => {
    await renderWithTheme(<HomeScreen level={1} playTime={0} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Privacy and Support' }));

    expect(screen.queryByText('There is no published support address yet.')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Support' }));

    expect(screen.getByText('There is no published support address yet.')).toBeOnTheScreen();
    expect(screen.queryByRole('link')).not.toBeOnTheScreen();
  });

  it("does not ask the player's age or offer preferences", async () => {
    await renderWithTheme(<HomeScreen level={1} playTime={0} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Privacy and Support' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Support' }));

    expect(screen.queryByText(/your age/i)).not.toBeOnTheScreen();
    expect(screen.queryByText(/how old/i)).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /age/i })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /sound/i })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /haptics/i })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /language/i })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /appearance/i })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /reset/i })).not.toBeOnTheScreen();
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
