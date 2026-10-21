type Tick = () => void;

export type PlayClock = {
  start(onSecond: Tick): () => void;
};

/** Production timer. Tests replace this module. */
export const devicePlayClock: PlayClock = {
  start(onSecond) {
    const id = setInterval(onSecond, 1000);
    return () => {
      clearInterval(id);
    };
  },
};

/** Present so tests can import it. The test build replaces this module. */
export function advancePlayClock(): void {
  throw new Error('The play clock advances only in tests');
}
