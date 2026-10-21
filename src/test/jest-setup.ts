import { installManualForeground } from '@/services/foreground';
import { installManualPlayClock } from '@/services/play-clock';

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
  installManualPlayClock();
  installManualForeground();
});
