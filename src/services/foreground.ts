import { AppState } from 'react-native';

type Listener = (active: boolean) => void;

export type Foreground = {
  now(): boolean;
  subscribe(listener: Listener): () => void;
};

/** Platform foreground. `inactive` and `background` do not count. Tests replace this module. */
export const deviceForeground: Foreground = {
  now: () => AppState.currentState === 'active',
  subscribe(listener) {
    const subscription = AppState.addEventListener('change', (next) => {
      listener(next === 'active');
    });
    return () => {
      subscription.remove();
    };
  },
};

/** Present so tests can import it. The test build replaces this module. */
export function setForegroundForTest(_active: boolean): void {
  throw new Error('The foreground signal changes only in tests');
}
