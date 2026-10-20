import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import Storage from 'expo-sqlite/kv-store';

import HomeRoute from '@/app/home';
import LevelRoute from '@/app/level';
import RootLayout from '@/app/_layout';
import { levelOne, logicalSolution } from '@/engine';
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
      '{"version":1,"level":1,"cells":["orange","orange","monkey","empty","empty","empty","monkey","monkey","empty","empty","empty","empty","empty","empty","empty","empty"]}',
    );
    expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Levels' })).not.toBeOnTheScreen();
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
    Storage.setItemSync(saveKey, encodeSave({ puzzle: last, cells: solution.value.cells }));

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

    expect(await screen.findByText('Edge clues', {}, { timeout: 3000 })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Row 1, column 1, monkey' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Row 1, column 1, orange' })).not.toBeOnTheScreen();
  });
});
