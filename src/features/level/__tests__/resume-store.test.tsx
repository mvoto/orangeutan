import { fireEvent, render, screen } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { deviceForeground } from '@/services/foreground';
import { devicePlayClock } from '@/services/play-clock';
import type { SaveStore } from '@/services/save-store';

import { LevelSessionProvider, useLevelSession } from '../level-session';

function memoryStore(
  initial: string | null = null,
): SaveStore & { readonly raw: () => string | null } {
  let value = initial;
  return {
    read: () => value,
    write: (next) => {
      value = next;
    },
    raw: () => value,
  };
}

function Probe() {
  const { cells, cycle, puzzle } = useLevelSession();
  return (
    <>
      <Text>{`cell:${cells[2] ?? 'missing'}`}</Text>
      <Text>{`size:${puzzle.size}`}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="place" onPress={() => cycle(2)}>
        <Text>place</Text>
      </Pressable>
    </>
  );
}

describe('resume store', () => {
  it('opens the same Symbols after the session is closed', async () => {
    const store = memoryStore();
    const first = await render(
      <LevelSessionProvider store={store} clock={devicePlayClock} foreground={deviceForeground}>
        <Probe />
      </LevelSessionProvider>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'place' }));
    expect(screen.getByText('cell:monkey')).toBeOnTheScreen();
    await first.unmount();

    await render(
      <LevelSessionProvider store={store} clock={devicePlayClock} foreground={deviceForeground}>
        <Probe />
      </LevelSessionProvider>,
    );

    expect(screen.getByText('cell:monkey')).toBeOnTheScreen();
    expect(screen.getByText('size:4')).toBeOnTheScreen();
  });

  it('does not replace a newer save', async () => {
    const newer = '{"version":4,"level":4,"cells":["orange"]}';
    const store = memoryStore(newer);

    await render(
      <LevelSessionProvider store={store} clock={devicePlayClock} foreground={deviceForeground}>
        <Probe />
      </LevelSessionProvider>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'place' }));

    expect(store.raw()).toBe(newer);
    expect(screen.getByText('size:4')).toBeOnTheScreen();
  });
});
