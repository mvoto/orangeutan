import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import Storage from 'expo-sqlite/kv-store';
import { Share } from 'react-native';

import CelebrationRoute from '@/app/celebration';
import HomeRoute from '@/app/home';
import LevelRoute from '@/app/level';
import RootLayout from '@/app/_layout';
import { logicalSolution } from '@/engine';
import type { Puzzle } from '@/engine';
import { deviceForeground } from '@/services/foreground';
import { devicePlayClock } from '@/services/play-clock';
import { deviceSaveStore, saveKey } from '@/services/save-store';
import { renderWithTheme } from '@/test/render-with-theme';
import type { Theme } from '@/theme';
import { treehouseTheme } from '@/theme';

import { LevelScreen } from '../level-screen';
import { LevelSessionProvider } from '../level-session';
import { levelSessionReducer, startingState } from '../level-session-state';
import { encodeSave } from '../save';
import { levelSequence } from '../sequence';

type CelebrationPlayer = {
  muted: boolean;
  loop: boolean;
  source: number;
  play: jest.Mock;
};

const mockCelebrationPlayer: CelebrationPlayer = {
  muted: false,
  loop: false,
  source: 0,
  play: jest.fn(),
};

jest.mock('expo-video', () => ({
  useVideoPlayer: (
    source: number,
    setup?: (player: { muted: boolean; loop: boolean; source: number; play: jest.Mock }) => void,
  ) => {
    mockCelebrationPlayer.source = source;
    setup?.(mockCelebrationPlayer);
    return mockCelebrationPlayer;
  },
  VideoView: () => null,
}));

function renderLevel(theme?: Theme): ReturnType<typeof renderWithTheme> {
  return renderWithTheme(
    <LevelSessionProvider
      store={deviceSaveStore}
      clock={devicePlayClock}
      foreground={deviceForeground}
    >
      <LevelScreen onBack={() => undefined} />
    </LevelSessionProvider>,
    theme === undefined ? {} : { theme },
  );
}

describe('Level 1', () => {
  it('shows cards for no three in a row and balance', async () => {
    await renderLevel();

    expect(screen.getByText('No three in a row')).toBeOnTheScreen();
    expect(screen.getByText('Balance')).toBeOnTheScreen();
  });

  it('uses the approved tile washes and symbols instead of letters', async () => {
    await renderLevel(treehouseTheme);

    expect(screen.getByRole('button', { name: 'Row 1, column 1, orange' })).toHaveStyle({
      backgroundColor: '#E07030',
    });
    expect(screen.getByRole('button', { name: 'Row 2, column 3, monkey' })).toHaveStyle({
      backgroundColor: '#4E6A78',
    });
    expect(screen.getAllByTestId('symbol-orange')).toHaveLength(2);
    expect(screen.getAllByTestId('symbol-monkey')).toHaveLength(2);
    expect(screen.queryByText('O')).not.toBeOnTheScreen();
    expect(screen.queryByText('M')).not.toBeOnTheScreen();
  });

  it('cycles an empty cell through monkey and orange', async () => {
    await renderLevel();

    await fireEvent.press(screen.getByRole('button', { name: 'Row 1, column 3, empty' }));
    expect(screen.getByRole('button', { name: 'Row 1, column 3, monkey' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Row 1, column 3, monkey' }));
    expect(screen.getByRole('button', { name: 'Row 1, column 3, orange' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Row 1, column 3, orange' }));
    expect(screen.getByRole('button', { name: 'Row 1, column 3, empty' })).toBeOnTheScreen();
  });

  it('clears the board and leaves the Level timer', async () => {
    const played = levelSessionReducer(
      { ...startingState(), seconds: [7] },
      { type: 'cycle', index: 2 },
    );
    Storage.setItemSync(saveKey, encodeSave(played));
    await renderLevel();

    expect(screen.getByRole('button', { name: 'Row 1, column 3, monkey' })).toBeOnTheScreen();
    expect(screen.getByLabelText('timer: 00:07')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Clear' }));

    expect(screen.getByRole('button', { name: 'Row 1, column 3, empty' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Row 1, column 1, orange' })).toBeOnTheScreen();
    expect(screen.getByLabelText('timer: 00:07')).toBeOnTheScreen();
  });

  it('outlines every cell in a broken row', async () => {
    expect(treehouseTheme.colors.border).toBe(treehouseTheme.colors.textPrimary);
    await renderLevel(treehouseTheme);

    await fireEvent.press(screen.getByRole('button', { name: 'Row 3, column 1, empty' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Row 3, column 2, empty' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Row 3, column 3, empty' }));

    for (const name of [
      'Row 3, column 1, monkey',
      'Row 3, column 2, monkey',
      'Row 3, column 3, monkey',
      'Row 3, column 4, empty',
    ]) {
      expect(screen.getByRole('button', { name })).toHaveStyle({ borderStyle: 'dashed' });
    }
    expect(screen.getByRole('button', { name: 'Row 4, column 1, empty' })).toHaveStyle({
      borderStyle: 'solid',
    });

    await fireEvent.press(screen.getByRole('button', { name: 'Row 3, column 3, monkey' }));
    expect(screen.getByRole('button', { name: 'Row 3, column 1, monkey' })).toHaveStyle({
      borderStyle: 'solid',
    });
  });

  it('outlines every cell in a broken column', async () => {
    expect(treehouseTheme.colors.border).toBe(treehouseTheme.colors.textPrimary);
    await renderLevel(treehouseTheme);

    await fireEvent.press(screen.getByRole('button', { name: 'Row 2, column 1, empty' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Row 2, column 1, monkey' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Row 3, column 1, empty' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Row 3, column 1, monkey' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Row 4, column 1, empty' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Row 4, column 1, monkey' }));

    for (const name of [
      'Row 1, column 1, orange',
      'Row 2, column 1, orange',
      'Row 3, column 1, orange',
      'Row 4, column 1, orange',
    ]) {
      expect(screen.getByRole('button', { name })).toHaveStyle({ borderStyle: 'dashed' });
    }
    expect(screen.getByRole('button', { name: 'Row 3, column 2, empty' })).toHaveStyle({
      borderStyle: 'solid',
    });
  });

  it('returns to the PLAY screen and keeps placed Symbols for the session', async () => {
    const router = await renderRouter(
      { _layout: RootLayout, home: HomeRoute, level: LevelRoute },
      { initialUrl: '/home' },
    );

    await screen.findByRole('button', { name: 'PLAY' }, { timeout: 3000 });
    expect(screen.getByText('Level 1')).toBeOnTheScreen();
    expect(screen.queryByText('Score')).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'PLAY' }));
    await screen.findByTestId('level-screen', {}, { timeout: 3000 });
    expect(screen.getByRole('button', { name: 'Back' })).toBeOnTheScreen();
    expect(screen.queryByText('Back')).not.toBeOnTheScreen();
    expect(screen.getByText('Level 1')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Row 1, column 3, empty' }));
    expect(screen.getByRole('button', { name: 'Row 1, column 3, monkey' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));

    expect(await screen.findByTestId('home-screen', {}, { timeout: 3000 })).toBeOnTheScreen();
    expect(router.getPathname()).toBe('/home');
    expect(screen.getByText('Level 1')).toBeOnTheScreen();
    expect(screen.queryByText('Score')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'PLAY' }));
    expect(
      await screen.findByRole('button', { name: 'Row 1, column 3, monkey' }, { timeout: 3000 }),
    ).toBeOnTheScreen();
    expect(screen.getByText('Level 1')).toBeOnTheScreen();
  });

  it('celebrates a solved Level 1 and opens Level 2 instead of replaying it', async () => {
    mockCelebrationPlayer.muted = false;
    mockCelebrationPlayer.play.mockClear();

    await renderRouter(
      {
        _layout: RootLayout,
        home: HomeRoute,
        level: LevelRoute,
        celebration: CelebrationRoute,
      },
      { initialUrl: '/home' },
    );

    await screen.findByRole('button', { name: 'PLAY' }, { timeout: 3000 });
    await fireEvent.press(screen.getByRole('button', { name: 'PLAY' }));
    await screen.findByTestId('level-screen', {}, { timeout: 3000 });
    expect(screen.queryByText('Edge clues')).not.toBeOnTheScreen();

    await fillLevelOne();

    expect(await screen.findByTestId('celebration-screen', {}, { timeout: 3000 })).toHaveStyle({
      backgroundColor: '#FDBF4E',
    });
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeOnTheScreen();
    expect(screen.getByText('Level 1')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Next' })).toBeOnTheScreen();
    expect(mockCelebrationPlayer.muted).toBe(true);
    expect(mockCelebrationPlayer.play).toHaveBeenCalled();
    expect(screen.queryByTestId('level-screen')).not.toBeOnTheScreen();
    expect(screen.queryByText('Edge clues')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));
    const levelTwo = levelSequence[1];
    if (levelTwo === undefined) throw new Error('Level 2 is missing');
    const given = givenCell(levelTwo);
    expect(await screen.findByText('Edge clues', {}, { timeout: 3000 })).toBeOnTheScreen();
    expect(screen.getByText('Level 2')).toBeOnTheScreen();
    expect(screen.queryByText('Level 1')).not.toBeOnTheScreen();
    expect(screen.getAllByText('=')).toHaveLength(2);
    expect(screen.getByRole('button', { name: given })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    await screen.findByRole('button', { name: 'PLAY' }, { timeout: 3000 });
    expect(screen.getByText('Level 2')).toBeOnTheScreen();
    expect(screen.queryByText('Score')).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'PLAY' }));

    expect(await screen.findByRole('button', { name: given }, { timeout: 3000 })).toBeOnTheScreen();
    expect(screen.getByText('Edge clues')).toBeOnTheScreen();

    await fillOpenCells(levelTwo);

    expect(
      await screen.findByTestId('celebration-screen', {}, { timeout: 3000 }),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Next' })).toBeOnTheScreen();
    expect(screen.getByText('Level 2')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Home' })).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByTestId('level-screen', {}, { timeout: 3000 })).toBeOnTheScreen();
    expect(screen.getByText('Level 3')).toBeOnTheScreen();
    expect(screen.queryByText('Score')).not.toBeOnTheScreen();
  });
});

describe('the last Level', () => {
  it('offers Home and the Score after the last Level', async () => {
    const share = jest
      .spyOn(Share, 'share')
      .mockResolvedValue({ action: Share.sharedAction, activityType: undefined });
    const last = levelSequence[levelSequence.length - 1];
    if (last === undefined) throw new Error('The sequence has no last Level');
    const solution = logicalSolution(last);
    const open = last.givens.findIndex((given) => given === null);
    const symbol = solution.ok ? solution.value.cells[open] : undefined;
    if (!solution.ok || open < 0 || symbol === undefined || symbol === 'empty') {
      throw new Error('The last Level has no open cell');
    }
    const cells = solution.value.cells.map((cell, index) => (index === open ? 'empty' : cell));
    Storage.setItemSync(saveKey, encodeSave({ puzzle: last, cells, seconds: [0] }));

    await renderRouter(
      {
        _layout: RootLayout,
        home: HomeRoute,
        level: LevelRoute,
        celebration: CelebrationRoute,
      },
      { initialUrl: '/home' },
    );

    await screen.findByRole('button', { name: 'PLAY' }, { timeout: 3000 });
    await fireEvent.press(screen.getByRole('button', { name: 'PLAY' }));
    expect(
      await screen.findByText(`Level ${levelSequence.length}`, {}, { timeout: 3000 }),
    ).toBeOnTheScreen();
    const row = Math.floor(open / last.size) + 1;
    const column = (open % last.size) + 1;
    const marks = ['empty', 'monkey', 'orange'] as const;
    const taps = symbol === 'monkey' ? 1 : 2;
    for (let tap = 0; tap < taps; tap += 1) {
      await fireEvent.press(
        await screen.findByRole(
          'button',
          { name: `Row ${row}, column ${column}, ${marks[tap]}` },
          { timeout: 3000 },
        ),
      );
    }

    expect(
      await screen.findByTestId('celebration-screen', {}, { timeout: 3000 }),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Home' })).toBeOnTheScreen();
    expect(screen.getByText(`Level ${levelSequence.length}`)).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Home' }));

    expect(await screen.findByTestId('home-screen', {}, { timeout: 3000 })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'PLAY' })).not.toBeOnTheScreen();
    expect(screen.queryByText(`Level ${levelSequence.length}`)).not.toBeOnTheScreen();
    expect(screen.getByText('Score')).toBeOnTheScreen();
    expect(screen.getByText(String(levelSequence.length))).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Share' }));
    expect(share).toHaveBeenCalledWith({ message: String(levelSequence.length) });
  });
});

function givenCell(puzzle: Puzzle): string {
  const index = puzzle.givens.findIndex((given) => given !== null);
  const row = Math.floor(index / puzzle.size) + 1;
  const column = (index % puzzle.size) + 1;
  return `Row ${row}, column ${column}, ${puzzle.givens[index]}`;
}

async function fillOpenCells(puzzle: Puzzle): Promise<void> {
  const solution = logicalSolution(puzzle);
  if (!solution.ok) throw new Error('The Level has no solution');
  const marks = ['empty', 'monkey', 'orange'] as const;
  for (let index = 0; index < puzzle.givens.length; index += 1) {
    if (puzzle.givens[index] !== null) continue;
    const symbol = solution.value.cells[index];
    if (symbol !== 'monkey' && symbol !== 'orange') throw new Error('Open cell has no Symbol');
    const taps = symbol === 'monkey' ? 1 : 2;
    const row = Math.floor(index / puzzle.size) + 1;
    const column = (index % puzzle.size) + 1;
    for (let tap = 0; tap < taps; tap += 1) {
      await fireEvent.press(
        screen.getByRole('button', { name: `Row ${row}, column ${column}, ${marks[tap]}` }),
      );
    }
  }
}

/** Level 1's known solution, counted in taps from empty: monkey, then orange. */
async function fillLevelOne(): Promise<void> {
  const tapsByIndex = [0, 0, 1, 1, 2, 2, 0, 0, 1, 1, 2, 2, 1, 1, 2, 2];
  const marks = ['empty', 'monkey', 'orange'] as const;

  for (let index = 0; index < tapsByIndex.length; index += 1) {
    const taps = tapsByIndex[index] ?? 0;
    const row = Math.floor(index / 4) + 1;
    const column = (index % 4) + 1;
    for (let tap = 0; tap < taps; tap += 1) {
      await fireEvent.press(
        screen.getByRole('button', { name: `Row ${row}, column ${column}, ${marks[tap]}` }),
      );
    }
  }
}
