type Tick = () => void;

export type PlayClock = {
  start(onSecond: Tick): () => void;
};

const listeners = new Set<Tick>();

const manualClock: PlayClock = {
  start(onSecond) {
    listeners.add(onSecond);
    return () => {
      listeners.delete(onSecond);
    };
  },
};

export const devicePlayClock: PlayClock = {
  start(onSecond) {
    const id = setInterval(onSecond, 1000);
    return () => {
      clearInterval(id);
    };
  },
};

let clock: PlayClock = devicePlayClock;

/** The clock the root passes into the level session. Tests replace it. */
export function currentPlayClock(): PlayClock {
  return clock;
}

export function installManualPlayClock(): void {
  listeners.clear();
  clock = manualClock;
}

export function advancePlayClock(): void {
  for (const tick of [...listeners]) tick();
}
