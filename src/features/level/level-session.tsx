import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import type { PropsWithChildren } from 'react';

import { isSolved } from '@/engine';
import type { Cell, Puzzle } from '@/engine';
import type { Foreground } from '@/services/foreground';
import type { PlayClock } from '@/services/play-clock';
import type { SaveStore } from '@/services/save-store';

import { levelSessionReducer, startingState } from './level-session-state';
import type { LevelSessionAction, LevelSessionState } from './level-session-state';
import type { RememberedRules, RuleId } from './rules';
import { encodeSave, openSave } from './save';
import { levelNumber, nextLevel } from './sequence';

type StoredSession = LevelSessionState & { readonly preserveDocument: boolean };

type LevelSession = {
  readonly puzzle: Puzzle;
  readonly cells: readonly Cell[];
  readonly solved: boolean;
  /** True when the current Puzzle is solved. The Celebration is the only way forward. */
  readonly celebrate: boolean;
  /** True when the solved Puzzle is the last Level. */
  readonly finished: boolean;
  /** How many Levels are solved. Present only when every Level is solved. */
  readonly score: number | null;
  /** 1-based place of the open Puzzle in the sequence. */
  readonly level: number;
  /** Whole seconds on the open Level. */
  readonly playSeconds: number;
  /** Sum of Play time across every Level reached. */
  readonly playTime: number;
  readonly remembered: RememberedRules;
  readonly remember: (rule: RuleId) => void;
  readonly cycle: (index: number) => void;
  readonly clear: () => void;
  readonly advance: () => void;
  readonly setLevelOpen: (open: boolean) => void;
};

const LevelSessionContext = createContext<LevelSession | null>(null);

function readSession(store: SaveStore): StoredSession {
  try {
    const opened = openSave(store.read());
    return { ...opened.state, preserveDocument: opened.preserveDocument };
  } catch {
    return { ...startingState(), preserveDocument: false };
  }
}

function storedSessionReducer(state: StoredSession, action: LevelSessionAction): StoredSession {
  return { ...levelSessionReducer(state, action), preserveDocument: state.preserveDocument };
}

/** Placed Symbols live here so leaving the app does not clear the grid. */
export function LevelSessionProvider({
  children,
  store,
  clock,
  foreground,
}: PropsWithChildren<{
  readonly store: SaveStore;
  readonly clock: PlayClock;
  readonly foreground: Foreground;
}>): React.JSX.Element {
  const [state, dispatch] = useReducer(storedSessionReducer, store, readSession);
  const [levelOpen, setLevelOpenState] = useState(false);
  const [inForeground, setInForeground] = useState(() => foreground.now());
  const levelOpenRef = useRef(false);
  const stopClock = useRef<(() => void) | null>(null);
  const stop = useCallback(() => {
    stopClock.current?.();
    stopClock.current = null;
  }, []);

  const setLevelOpen = useCallback(
    (open: boolean) => {
      levelOpenRef.current = open;
      if (!open) stop();
      setLevelOpenState(open);
    },
    [stop],
  );

  useEffect(
    () =>
      foreground.subscribe((active) => {
        if (!active) stop();
        setInForeground(active);
      }),
    [foreground, stop],
  );

  const solved = isSolved(state.puzzle, state.cells);
  useEffect(() => {
    if (!levelOpen || !inForeground || solved) return;
    const stopTicking = clock.start(() => {
      // A second already in flight must not count after Back or after leaving the foreground.
      if (!levelOpenRef.current || !foreground.now()) return;
      dispatch({ type: 'tick' });
    });
    stopClock.current = stopTicking;
    return () => {
      stopTicking();
      if (stopClock.current === stopTicking) stopClock.current = null;
    };
  }, [clock, foreground, levelOpen, inForeground, solved]);

  useEffect(() => {
    if (state.preserveDocument) return;
    try {
      store.write(encodeSave(state));
    } catch {
      // The session keeps running when the device cannot store it.
    }
  }, [state, store]);
  const remember = useCallback((rule: RuleId) => {
    dispatch({ type: 'remember', rule });
  }, []);
  const cycle = useCallback((index: number) => {
    dispatch({ type: 'cycle', index });
  }, []);
  const clear = useCallback(() => {
    dispatch({ type: 'clear' });
  }, []);
  const advance = useCallback(() => {
    dispatch({ type: 'advance' });
  }, []);
  const finished = solved && nextLevel(state.puzzle) === null;
  const celebrate = solved;
  const level = levelNumber(state.puzzle);
  const score = finished ? level : null;
  const playSeconds = state.seconds[state.seconds.length - 1] ?? 0;
  const playTime = state.seconds.reduce((sum, value) => sum + value, 0);
  const session = useMemo(
    () => ({
      puzzle: state.puzzle,
      cells: state.cells,
      solved,
      celebrate,
      finished,
      score,
      level,
      playSeconds,
      playTime,
      remembered: state.remembered,
      remember,
      cycle,
      clear,
      advance,
      setLevelOpen,
    }),
    [
      state.puzzle,
      state.cells,
      solved,
      celebrate,
      finished,
      score,
      level,
      playSeconds,
      playTime,
      state.remembered,
      remember,
      cycle,
      clear,
      advance,
      setLevelOpen,
    ],
  );

  return <LevelSessionContext.Provider value={session}>{children}</LevelSessionContext.Provider>;
}

export function useLevelSession(): LevelSession {
  const session = useContext(LevelSessionContext);
  if (session === null) {
    throw new Error('LevelSessionProvider is missing');
  }
  return session;
}
