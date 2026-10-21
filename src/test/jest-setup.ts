import { setForegroundForTest } from '@/services/foreground';

jest.mock('@/services/play-clock', () => {
  const listeners = new Set<() => void>();
  return {
    devicePlayClock: {
      start(onSecond: () => void) {
        listeners.add(onSecond);
        return () => {
          listeners.delete(onSecond);
        };
      },
    },
    advancePlayClock() {
      for (const tick of [...listeners]) tick();
    },
  };
});

jest.mock('@/services/foreground', () => {
  const listeners = new Set<(active: boolean) => void>();
  let active = true;
  return {
    deviceForeground: {
      now: () => active,
      subscribe(listener: (active: boolean) => void) {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
    },
    setForegroundForTest(next: boolean) {
      active = next;
      for (const listener of [...listeners]) listener(next);
    },
  };
});

jest.mock('expo-sqlite/kv-store', () => {
  const memory = new Map<string, string>();
  Object.assign(globalThis, { __orangeutanSaveMemory: memory });
  return {
    __esModule: true,
    default: {
      getItemSync: (key: string) => memory.get(key) ?? null,
      setItemSync: (key: string, value: string) => {
        memory.set(key, value);
      },
    },
  };
});

beforeEach(() => {
  const memory = (globalThis as { __orangeutanSaveMemory?: Map<string, string> })
    .__orangeutanSaveMemory;
  memory?.clear();
  setForegroundForTest(true);
});
