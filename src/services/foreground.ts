import { AppState } from 'react-native';

type Listener = (active: boolean) => void;

export type Foreground = {
  now(): boolean;
  subscribe(listener: Listener): () => void;
};

const listeners = new Set<Listener>();
let active = true;

const manualForeground: Foreground = {
  now: () => active,
  subscribe(listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

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

let foreground: Foreground = deviceForeground;

/** The foreground signal the root passes into the level session. Tests replace it. */
export function currentForeground(): Foreground {
  return foreground;
}

export function installManualForeground(): void {
  active = true;
  listeners.clear();
  foreground = manualForeground;
}

export function setForegroundForTest(next: boolean): void {
  active = next;
  for (const listener of [...listeners]) listener(next);
}
