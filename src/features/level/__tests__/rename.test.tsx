import { fireEvent, render, screen } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { deviceForeground } from '@/services/foreground';
import { deviceNicknameSeed } from '@/services/nickname-seed';
import { devicePlayClock } from '@/services/play-clock';
import type { SaveStore } from '@/services/save-store';

import { LevelSessionProvider, useLevelSession } from '../level-session';

const memory: SaveStore = {
  read: () => null,
  write: () => undefined,
};

function Probe({ next }: { readonly next: string }) {
  const { nickname, rename } = useLevelSession();
  return (
    <>
      <Text>{nickname}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="rename"
        onPress={() => rename(next)}
      >
        <Text>rename</Text>
      </Pressable>
    </>
  );
}

function renderNickname(next: string): ReturnType<typeof render> {
  return render(
    <LevelSessionProvider
      store={memory}
      clock={devicePlayClock}
      foreground={deviceForeground}
      seed={deviceNicknameSeed}
    >
      <Probe next={next} />
    </LevelSessionProvider>,
  );
}

describe('rename', () => {
  it('replaces the Nickname when the new name is accepted', async () => {
    await renderNickname('Sunny Grove');

    expect(screen.getByText('Calm Orangutan')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'rename' }));
    expect(screen.getByText('Sunny Grove')).toBeOnTheScreen();
  });

  it('leaves the Nickname when the new name is empty', async () => {
    await renderNickname('   ');

    await fireEvent.press(screen.getByRole('button', { name: 'rename' }));
    expect(screen.getByText('Calm Orangutan')).toBeOnTheScreen();
  });

  it('leaves the Nickname when the new name is longer than 24 characters', async () => {
    await renderNickname('ABCDEFGHIJKLMNOPQRSTUVWXY');

    await fireEvent.press(screen.getByRole('button', { name: 'rename' }));
    expect(screen.getByText('Calm Orangutan')).toBeOnTheScreen();
  });

  it('leaves the Nickname when the new name has a character other than letters and spaces', async () => {
    await renderNickname('Nope!');

    await fireEvent.press(screen.getByRole('button', { name: 'rename' }));
    expect(screen.getByText('Calm Orangutan')).toBeOnTheScreen();
  });
});
