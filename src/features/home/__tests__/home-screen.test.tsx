import { fireEvent, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import * as Linking from 'expo-linking';

import HomeRoute from '@/app/home';
import NicknameRoute from '@/app/nickname';
import PrivacyRoute from '@/app/privacy';
import SettingsRoute from '@/app/settings';
import RootLayout from '@/app/_layout';
import { renderWithTheme } from '@/test/render-with-theme';

import { HomeScreen } from '../home-screen';

const supportUrl = 'https://github.com/mvoto/orangeutan/issues';

const routes = {
  _layout: RootLayout,
  home: HomeRoute,
  settings: SettingsRoute,
  nickname: NicknameRoute,
  privacy: PrivacyRoute,
};

async function openHome(): Promise<void> {
  await renderRouter(routes, { initialUrl: '/home' });
  await screen.findByRole('button', { name: 'PLAY' }, { timeout: 3000 });
}

describe('<HomeScreen />', () => {
  it('greets the player with the Nickname', async () => {
    await renderWithTheme(<HomeScreen level={1} playTime={0} nickname="Calm Orangutan" />);

    expect(screen.getByText('Hi, Calm Orangutan')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Nickname')).not.toBeOnTheScreen();
  });

  it('keeps a saved Nickname on the greeting and drops a rejected one', async () => {
    const router = await renderRouter(routes, { initialUrl: '/home' });
    await screen.findByRole('button', { name: 'PLAY' }, { timeout: 3000 });
    expect(screen.getByText('Hi, Calm Orangutan')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Settings' }));
    expect(router.getPathname()).toBe('/settings');
    await fireEvent.press(screen.getByRole('button', { name: 'Nickname, Calm Orangutan' }));
    expect(router.getPathname()).toBe('/nickname');

    const input = screen.getByLabelText('Nickname');
    await fireEvent.changeText(input, 'Nope!');
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText('That Nickname was not kept.')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('Calm Orangutan')).toBeOnTheScreen();
    expect(router.getPathname()).toBe('/nickname');

    await fireEvent.changeText(input, 'Sunny Grove');
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    expect(router.getPathname()).toBe('/settings');
    expect(screen.getByText('Sunny Grove')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(await screen.findByText('Hi, Sunny Grove', {}, { timeout: 3000 })).toBeOnTheScreen();
    expect(router.getPathname()).toBe('/home');
  });

  it('offers a PLAY button', async () => {
    await renderWithTheme(<HomeScreen level={1} playTime={0} nickname="Calm Orangutan" />);

    expect(screen.getByRole('button', { name: 'PLAY' })).toBeOnTheScreen();
    expect(screen.queryByText('Score')).not.toBeOnTheScreen();
  });

  it('opens the privacy policy from the gear and returns Home', async () => {
    const router = await renderRouter(routes, { initialUrl: '/home' });
    await screen.findByRole('button', { name: 'PLAY' }, { timeout: 3000 });

    expect(screen.getByRole('image', { name: 'Orangutan holding an orange' })).toBeOnTheScreen();
    expect(screen.queryByText('Play time and progress stay on the device.')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Settings' }));
    expect(router.getPathname()).toBe('/settings');
    await fireEvent.press(screen.getByRole('button', { name: 'Privacy and Support' }));

    expect(router.getPathname()).toBe('/privacy');
    expect(screen.queryByTestId('home-screen')).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'PLAY' })).not.toBeOnTheScreen();
    expect(
      screen.queryByRole('image', { name: 'Orangutan holding an orange' }),
    ).not.toBeOnTheScreen();
    expect(screen.getByText('Play time and progress stay on the device.')).toBeOnTheScreen();
    expect(screen.getByText('Deleting the app deletes Play time and progress.')).toBeOnTheScreen();
    expect(screen.getByText('The game collects no name.')).toBeOnTheScreen();
    expect(screen.getByText('The game is not directed to children under 13.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Back' })).toBeOnTheScreen();
    expect(screen.queryByText('Back')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByTestId('settings-screen')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));

    expect(await screen.findByTestId('home-screen', {}, { timeout: 3000 })).toBeOnTheScreen();
    expect(router.getPathname()).toBe('/home');
    expect(screen.getByRole('button', { name: 'PLAY' })).toBeOnTheScreen();
    expect(screen.getByRole('image', { name: 'Orangutan holding an orange' })).toBeOnTheScreen();
  });

  it('opens the project issues from Support', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await openHome();

    await fireEvent.press(screen.getByRole('button', { name: 'Settings' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Privacy and Support' }));

    expect(screen.getByText('Support')).toBeOnTheScreen();
    expect(screen.getByRole('link', { name: supportUrl })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('link', { name: supportUrl }));

    expect(openURL).toHaveBeenCalledWith(supportUrl);
    openURL.mockRestore();
  });

  it("does not ask the player's age or offer preferences", async () => {
    await openHome();

    expect(screen.queryByText(/your age/i)).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /sound/i })).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Settings' }));

    expect(screen.queryByRole('button', { name: /sound/i })).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Privacy and Support' }));

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
    await renderWithTheme(<HomeScreen level={1} playTime={0} nickname="Calm Orangutan" />);

    expect(screen.getByRole('image', { name: 'Orangutan holding an orange' })).toBeOnTheScreen();
  });

  it('sizes the drawing to its frame so PLAY stays on screen', async () => {
    await renderWithTheme(<HomeScreen level={1} playTime={0} nickname="Calm Orangutan" />);

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
