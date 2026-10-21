import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import Storage from 'expo-sqlite/kv-store';
import { act } from 'react';
import { Share } from 'react-native';

import CelebrationRoute from '@/app/celebration';
import HomeRoute from '@/app/home';
import LevelRoute from '@/app/level';
import RootLayout from '@/app/_layout';
import { levelOne, logicalSolution } from '@/engine';
import { setForegroundForTest } from '@/services/foreground';
import { advancePlayClock } from '@/services/play-clock';
import { saveKey } from '@/services/save-store';

import type { LevelSessionState } from '../level-session-state';
import { levelSessionReducer, startingState } from '../level-session-state';
import { encodeSave } from '../save';
import { levelSequence } from '../sequence';

const solvedLevelOne: LevelSessionState = {
  puzzle: levelOne,
  cells: [
    'orange',
    'orange',
    'monkey',
    'monkey',
    'orange',
    'orange',
    'monkey',
    'monkey',
    'monkey',
    'monkey',
    'orange',
    'orange',
    'monkey',
    'monkey',
    'orange',
    'orange',
  ],
  seconds: [0],
};

const routes = { _layout: RootLayout, home: HomeRoute, level: LevelRoute };

describe('resume', () => {
  it('keeps placed Symbols when the app leaves', async () => {
    await renderRouter(routes, { initialUrl: '/home' });
    await screen.findByRole('button', { name: 'PLAY' }, { timeout: 3000 });
    await fireEvent.press(screen.getByRole('button', { name: 'PLAY' }));
    await screen.findByTestId('level-screen', {}, { timeout: 3000 });
    await fireEvent.press(screen.getByRole('button', { name: 'Row 1, column 3, empty' }));

    expect(screen.getByRole('button', { name: 'Row 1, column 3, monkey' })).toBeOnTheScreen();
    expect(Storage.getItemSync(saveKey)).toBe(
      '{"version":3,"level":1,"cells":["orange","orange","monkey","empty","empty","empty","monkey","monkey","empty","empty","empty","empty","empty","empty","empty","empty"],"seconds":[0]}',
    );
    expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Levels' })).not.toBeOnTheScreen();
  });

  it('counts a second on the open Level and stores that second', async () => {
    await renderRouter(routes, { initialUrl: '/home' });
    await screen.findByRole('button', { name: 'PLAY' }, { timeout: 3000 });
    await fireEvent.press(screen.getByRole('button', { name: 'PLAY' }));
    expect(
      await screen.findByLabelText('0 seconds on this Level', {}, { timeout: 3000 }),
    ).toBeOnTheScreen();

    await act(() => {
      advancePlayClock();
    });

    expect(screen.getByLabelText('1 seconds on this Level')).toBeOnTheScreen();
    expect(Storage.getItemSync(saveKey)).toContain('"seconds":[1]');
  });

  it('opens the stored second on the next launch', async () => {
    Storage.setItemSync(
      saveKey,
      '{"version":3,"level":1,"cells":["orange","orange","empty","empty","empty","empty","monkey","monkey","empty","empty","empty","empty","empty","empty","empty","empty"],"seconds":[1]}',
    );

    await renderRouter(routes, { initialUrl: '/level' });

    expect(
      await screen.findByLabelText('1 seconds on this Level', {}, { timeout: 3000 }),
    ).toBeOnTheScreen();
  });

  it('shows the Home total and pauses off the Level and in the background', async () => {
    await renderRouter(routes, { initialUrl: '/home' });
    await screen.findByRole('button', { name: 'PLAY' }, { timeout: 3000 });
    expect(screen.getByLabelText('0 total seconds across Levels')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'PLAY' }));
    await screen.findByLabelText('0 seconds on this Level', {}, { timeout: 3000 });
    await act(() => {
      advancePlayClock();
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));

    expect(
      await screen.findByLabelText('1 total seconds across Levels', {}, { timeout: 3000 }),
    ).toBeOnTheScreen();
    await act(() => {
      advancePlayClock();
    });
    expect(screen.getByLabelText('1 total seconds across Levels')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'PLAY' }));
    expect(
      await screen.findByLabelText('1 seconds on this Level', {}, { timeout: 3000 }),
    ).toBeOnTheScreen();
    await act(() => {
      setForegroundForTest(false);
    });
    await act(() => {
      advancePlayClock();
    });
    expect(screen.getByLabelText('1 seconds on this Level')).toBeOnTheScreen();
    await act(() => {
      setForegroundForTest(true);
    });
    await act(() => {
      advancePlayClock();
    });
    expect(screen.getByLabelText('2 seconds on this Level')).toBeOnTheScreen();
  });

  it('keeps solved seconds and starts the next Level at zero', async () => {
    const cells = solvedLevelOne.cells.map((cell, index) => (index === 2 ? 'empty' : cell));
    Storage.setItemSync(saveKey, encodeSave({ puzzle: levelOne, cells, seconds: [0] }));

    await renderRouter({ ...routes, celebration: CelebrationRoute }, { initialUrl: '/home' });
    await screen.findByRole('button', { name: 'PLAY' }, { timeout: 3000 });
    await fireEvent.press(screen.getByRole('button', { name: 'PLAY' }));
    await screen.findByLabelText('0 seconds on this Level', {}, { timeout: 3000 });
    await act(() => {
      for (let second = 0; second < 10; second += 1) advancePlayClock();
    });
    expect(screen.getByLabelText('10 seconds on this Level')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Row 1, column 3, empty' }));
    expect(
      await screen.findByTestId('celebration-screen', {}, { timeout: 3000 }),
    ).toBeOnTheScreen();
    await act(() => {
      advancePlayClock();
    });
    expect(Storage.getItemSync(saveKey)).toContain('"seconds":[10]');

    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));
    expect(
      await screen.findByLabelText('0 seconds on this Level', {}, { timeout: 3000 }),
    ).toBeOnTheScreen();
    expect(screen.getByText('Level 2')).toBeOnTheScreen();
    await act(() => {
      for (let second = 0; second < 20; second += 1) advancePlayClock();
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(
      await screen.findByLabelText('30 total seconds across Levels', {}, { timeout: 3000 }),
    ).toBeOnTheScreen();
  });

  it('opens the saved Level with the same Symbols', async () => {
    Storage.setItemSync(
      saveKey,
      encodeSave(levelSessionReducer(startingState(), { type: 'cycle', index: 2 })),
    );

    await renderRouter(routes, { initialUrl: '/home' });
    await screen.findByRole('button', { name: 'PLAY' }, { timeout: 3000 });
    await fireEvent.press(screen.getByRole('button', { name: 'PLAY' }));

    expect(
      await screen.findByRole('button', { name: 'Row 1, column 3, monkey' }, { timeout: 3000 }),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Row 1, column 1, orange' })).toBeOnTheScreen();
  });

  it('opens an older save at zero seconds with the same Symbols', async () => {
    Storage.setItemSync(
      saveKey,
      '{"version":2,"level":1,"cells":["orange","orange","monkey","empty","empty","empty","monkey","monkey","empty","empty","empty","empty","empty","empty","empty","empty"]}',
    );

    await renderRouter(routes, { initialUrl: '/level' });

    expect(
      await screen.findByRole('button', { name: 'Row 1, column 3, monkey' }, { timeout: 3000 }),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('0 seconds on this Level')).toBeOnTheScreen();
  });

  it('keeps the grid when the saved seconds cannot be read', async () => {
    Storage.setItemSync(
      saveKey,
      '{"version":3,"level":1,"cells":["orange","orange","monkey","empty","empty","empty","monkey","monkey","empty","empty","empty","empty","empty","empty","empty","empty"],"seconds":[-1]}',
    );

    await renderRouter(routes, { initialUrl: '/level' });

    expect(
      await screen.findByRole('button', { name: 'Row 1, column 3, monkey' }, { timeout: 3000 }),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('0 seconds on this Level')).toBeOnTheScreen();
  });

  it('leaves a newer save untouched', async () => {
    const newer = '{"version":4,"level":9,"cells":["orange"]}';
    Storage.setItemSync(saveKey, newer);

    await renderRouter(routes, { initialUrl: '/level' });
    await screen.findByLabelText('0 seconds on this Level', {}, { timeout: 3000 });
    await act(() => {
      advancePlayClock();
    });

    expect(Storage.getItemSync(saveKey)).toBe(newer);
  });

  it('shows Play time beside the Score and shares only the Score', async () => {
    const share = jest
      .spyOn(Share, 'share')
      .mockResolvedValue({ action: Share.sharedAction, activityType: undefined });
    const last = levelSequence[levelSequence.length - 1];
    if (last === undefined) throw new Error('The last Level has no solution');
    const solution = logicalSolution(last);
    if (!solution.ok) throw new Error('The last Level has no solution');
    const seconds = Array.from({ length: levelSequence.length }, () => 0);
    seconds[0] = 4;
    Storage.setItemSync(
      saveKey,
      encodeSave({ puzzle: last, cells: solution.value.cells, seconds }),
    );

    await renderRouter(routes, { initialUrl: '/home' });

    expect(await screen.findByText('Score', {}, { timeout: 3000 })).toBeOnTheScreen();
    expect(screen.getByText(String(levelSequence.length))).toBeOnTheScreen();
    expect(screen.getByLabelText('4 total seconds across Levels')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Share' }));
    expect(share).toHaveBeenCalledWith({ message: String(levelSequence.length) });
  });

  it('starts Level 1 when the save cannot be read', async () => {
    Storage.setItemSync(saveKey, 'not json');

    await renderRouter(routes, { initialUrl: '/home' });
    await screen.findByRole('button', { name: 'PLAY' }, { timeout: 3000 });
    await fireEvent.press(screen.getByRole('button', { name: 'PLAY' }));

    expect(
      await screen.findByRole('button', { name: 'Row 1, column 1, orange' }, { timeout: 3000 }),
    ).toBeOnTheScreen();
    expect(screen.queryByText('Edge clues')).not.toBeOnTheScreen();
  });

  it('does not reopen a finished Level', async () => {
    const last = levelSequence[levelSequence.length - 1];
    if (last === undefined) throw new Error('The last Level has no solution');
    const solution = logicalSolution(last);
    if (!solution.ok) throw new Error('The last Level has no solution');
    Storage.setItemSync(
      saveKey,
      encodeSave({ puzzle: last, cells: solution.value.cells, seconds: [0] }),
    );

    await renderRouter(routes, { initialUrl: '/home' });

    expect(await screen.findByText('Score', {}, { timeout: 3000 })).toBeOnTheScreen();
    expect(screen.getByText(String(levelSequence.length))).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'PLAY' })).not.toBeOnTheScreen();
    expect(screen.queryByTestId('level-screen')).not.toBeOnTheScreen();
  });

  it('does not open a solved Level 1', async () => {
    Storage.setItemSync(saveKey, encodeSave(solvedLevelOne));

    await renderRouter(routes, { initialUrl: '/home' });
    await screen.findByRole('button', { name: 'PLAY' }, { timeout: 3000 });
    await fireEvent.press(screen.getByRole('button', { name: 'PLAY' }));

    const levelTwo = levelSequence[1];
    if (levelTwo === undefined) throw new Error('Level 2 is missing');
    const givenIndex = levelTwo.givens.findIndex((given) => given !== null);
    const row = Math.floor(givenIndex / levelTwo.size) + 1;
    const column = (givenIndex % levelTwo.size) + 1;

    expect(await screen.findByText('Edge clues', {}, { timeout: 3000 })).toBeOnTheScreen();
    expect(
      screen.getByRole('button', {
        name: `Row ${row}, column ${column}, ${levelTwo.givens[givenIndex]}`,
      }),
    ).toBeOnTheScreen();
  });
});
