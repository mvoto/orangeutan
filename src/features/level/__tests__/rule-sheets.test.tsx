import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import Storage from 'expo-sqlite/kv-store';

import HomeRoute from '@/app/home';
import LevelRoute from '@/app/level';
import RootLayout from '@/app/_layout';
import { cellsFromGivens } from '@/engine';
import { deviceForeground } from '@/services/foreground';
import { devicePlayClock } from '@/services/play-clock';
import { deviceSaveStore, saveKey } from '@/services/save-store';
import { renderWithTheme } from '@/test/render-with-theme';

import { LevelScreen } from '../level-screen';
import { LevelSessionProvider } from '../level-session';
import { encodeSave } from '../save';
import { levelSequence } from '../sequence';

const noThree = 'Three monkeys in a row, not allowed. Three oranges in a column, not allowed.';
const balanceDiagram =
  'A row that is half monkeys and half oranges, with the monkeys grouped together. A column that is half monkeys and half oranges, with the monkeys grouped together.';
const edgeDiagram = 'An equals sign between two monkeys. A cross between a monkey and an orange.';
const routes = { _layout: RootLayout, home: HomeRoute, level: LevelRoute };

async function renderLevel(): Promise<void> {
  await renderWithTheme(
    <LevelSessionProvider
      store={deviceSaveStore}
      clock={devicePlayClock}
      foreground={deviceForeground}
    >
      <LevelScreen onBack={() => undefined} />
    </LevelSessionProvider>,
  );
}

describe('rule sheets', () => {
  it('opens No three in a row when Level 1 starts', async () => {
    await renderLevel();

    expect(screen.getByRole('button', { name: 'No three in a row' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Balance' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Edge clues' })).not.toBeOnTheScreen();
    expect(screen.getByText('Not three of the same in a row or a column.')).toBeOnTheScreen();
    expect(screen.getByRole('image', { name: noThree })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Close' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Row 1, column 3, empty' }));

    expect(screen.getByRole('button', { name: 'Row 1, column 3, empty' })).toBeOnTheScreen();
  });

  it('introduces Balance after No three in a row, then leaves the Level', async () => {
    await renderLevel();

    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));

    expect(screen.getByText('Each row and each column is half and half.')).toBeOnTheScreen();
    expect(screen.getByRole('image', { name: balanceDiagram })).toBeOnTheScreen();
    expect(screen.queryByText('Not three of the same in a row or a column.')).not.toBeOnTheScreen();
    expect(screen.queryByText('2')).not.toBeOnTheScreen();
    expect(screen.queryByText('4')).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeOnTheScreen();
    expect(screen.queryByText('Each row and each column is half and half.')).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'No three in a row' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Balance' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Back' })).toBeOnTheScreen();
  });

  it('opens a rule again after the introduction, and Close stops there', async () => {
    await renderLevel();
    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));

    await fireEvent.press(screen.getByRole('button', { name: 'No three in a row' }));

    expect(screen.getByText('Not three of the same in a row or a column.')).toBeOnTheScreen();
    expect(screen.getByRole('image', { name: noThree })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeOnTheScreen();
    expect(screen.queryByText('Each row and each column is half and half.')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Balance' }));

    expect(screen.getByText('Each row and each column is half and half.')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeOnTheScreen();
  });

  it('keeps the open sheet when its card is tapped again', async () => {
    await renderLevel();

    await fireEvent.press(screen.getByRole('button', { name: 'No three in a row' }));

    expect(screen.getByText('Not three of the same in a row or a column.')).toBeOnTheScreen();
    expect(screen.queryByText('Each row and each column is half and half.')).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Close' })).toBeOnTheScreen();
  });

  it('remembers a rule only when its sheet is closed', async () => {
    await renderLevel();

    await fireEvent.press(screen.getByRole('button', { name: 'Balance' }));

    expect(screen.getByText('Each row and each column is half and half.')).toBeOnTheScreen();
    expect(screen.queryByText('Not three of the same in a row or a column.')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));

    expect(screen.getByText('Not three of the same in a row or a column.')).toBeOnTheScreen();
    expect(screen.queryByText('Each row and each column is half and half.')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeOnTheScreen();
  });

  it('opens only Balance when the player left during that sheet', async () => {
    const first = await renderRouter(
      { _layout: RootLayout, home: HomeRoute, level: LevelRoute },
      { initialUrl: '/level' },
    );
    expect(
      await screen.findByText('Not three of the same in a row or a column.', {}, { timeout: 3000 }),
    ).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    expect(screen.getByText('Each row and each column is half and half.')).toBeOnTheScreen();
    await first.unmount();

    await renderRouter(
      { _layout: RootLayout, home: HomeRoute, level: LevelRoute },
      { initialUrl: '/level' },
    );

    expect(
      await screen.findByText('Each row and each column is half and half.', {}, { timeout: 3000 }),
    ).toBeOnTheScreen();
    expect(screen.queryByText('Not three of the same in a row or a column.')).not.toBeOnTheScreen();
  });

  it('stays quiet when a finished introduction is resumed', async () => {
    const first = await renderRouter(routes, { initialUrl: '/home' });
    await screen.findByRole('button', { name: 'PLAY' }, { timeout: 3000 });
    await fireEvent.press(screen.getByRole('button', { name: 'PLAY' }));
    await screen.findByRole('button', { name: 'Close' }, { timeout: 3000 });
    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(await screen.findByTestId('home-screen', {}, { timeout: 3000 })).toBeOnTheScreen();
    expect(screen.queryByText('Not three of the same in a row or a column.')).not.toBeOnTheScreen();
    await first.unmount();

    await renderRouter(routes, { initialUrl: '/level' });

    expect(await screen.findByTestId('level-screen', {}, { timeout: 3000 })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeOnTheScreen();
    expect(screen.queryByText('Not three of the same in a row or a column.')).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Back' })).toBeOnTheScreen();
  });

  it('introduces only Edge clues on the first Puzzle that has them', async () => {
    const levelTwo = levelSequence[1];
    if (levelTwo === undefined) throw new Error('Level 2 is missing');
    Storage.setItemSync(
      saveKey,
      encodeSave({
        puzzle: levelTwo,
        cells: cellsFromGivens(levelTwo),
        seconds: [0, 0],
        remembered: { 'no-three-in-a-row': true, balance: true, 'edge-clues': false },
      }),
    );

    await renderRouter(routes, { initialUrl: '/level' });

    expect(
      await screen.findByText('= means the same. × means different.', {}, { timeout: 3000 }),
    ).toBeOnTheScreen();
    expect(screen.getByRole('image', { name: edgeDiagram })).toBeOnTheScreen();
    expect(screen.queryByText('Not three of the same in a row or a column.')).not.toBeOnTheScreen();
    expect(screen.queryByText('Each row and each column is half and half.')).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Edge clues' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Back' })).toBeOnTheScreen();
  });

  it('stays quiet on a later Puzzle and still opens any card', async () => {
    const later = levelSequence[2];
    if (later === undefined) throw new Error('Level 3 is missing');
    Storage.setItemSync(
      saveKey,
      encodeSave({
        puzzle: later,
        cells: cellsFromGivens(later),
        seconds: [0, 0, 0],
        remembered: { 'no-three-in-a-row': true, balance: true, 'edge-clues': true },
      }),
    );

    await renderRouter(routes, { initialUrl: '/level' });

    expect(await screen.findByText('Level 3', {}, { timeout: 3000 })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'No three in a row' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Balance' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Edge clues' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Edge clues' }));
    expect(screen.getByText('= means the same. × means different.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'No three in a row' }));
    expect(screen.getByText('Not three of the same in a row or a column.')).toBeOnTheScreen();
    expect(screen.queryByText('= means the same. × means different.')).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Balance' }));
    expect(screen.getByText('Each row and each column is half and half.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeOnTheScreen();
  });

  it('introduces the rules of an older saved Level without dropping its Symbols', async () => {
    Storage.setItemSync(
      saveKey,
      '{"version":3,"level":1,"cells":["orange","orange","monkey","empty","empty","empty","monkey","monkey","empty","empty","empty","empty","empty","empty","empty","empty"],"seconds":[4]}',
    );

    await renderRouter(routes, { initialUrl: '/level' });

    expect(
      await screen.findByRole('button', { name: 'Row 1, column 3, monkey' }, { timeout: 3000 }),
    ).toBeOnTheScreen();
    expect(screen.getByText('Not three of the same in a row or a column.')).toBeOnTheScreen();
    expect(screen.getByLabelText('timer: 00:04')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Edge clues' })).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));

    expect(screen.getByText('Each row and each column is half and half.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Row 1, column 3, monkey' })).toBeOnTheScreen();
  });
});
