export type BootstrapTask = {
  readonly name: string;
  readonly run: () => Promise<void>;
};

export type BootstrapResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly failedTask: string; readonly error: unknown };

export type BootstrapOptions = {
  /** Keeps the loading screen up long enough to avoid a jarring flash. */
  readonly minDurationMs?: number;
  readonly sleep?: (ms: number) => Promise<void>;
};

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

async function runSequentially(tasks: readonly BootstrapTask[]): Promise<BootstrapResult> {
  for (const task of tasks) {
    try {
      await task.run();
    } catch (error: unknown) {
      return { ok: false, failedTask: task.name, error };
    }
  }
  return { ok: true };
}

/** Runs startup tasks in order. Never rejects: failures come back as a result. */
export async function runBootstrap(
  tasks: readonly BootstrapTask[],
  { minDurationMs = 0, sleep = defaultSleep }: BootstrapOptions = {},
): Promise<BootstrapResult> {
  const [result] = await Promise.all([
    runSequentially(tasks),
    minDurationMs > 0 ? sleep(minDurationMs) : Promise.resolve(),
  ]);
  return result;
}
