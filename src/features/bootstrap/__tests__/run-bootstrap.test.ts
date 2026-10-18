import type { BootstrapTask } from '../run-bootstrap';
import { runBootstrap } from '../run-bootstrap';

const task = (name: string, run: () => Promise<void> = async () => {}): BootstrapTask => ({
  name,
  run,
});

describe('runBootstrap', () => {
  it('succeeds with no tasks', async () => {
    await expect(runBootstrap([])).resolves.toEqual({ ok: true });
  });

  it('runs tasks in order', async () => {
    const order: string[] = [];
    const tasks = ['a', 'b', 'c'].map((name) =>
      task(name, async () => {
        order.push(name);
      }),
    );

    await expect(runBootstrap(tasks)).resolves.toEqual({ ok: true });
    expect(order).toEqual(['a', 'b', 'c']);
  });

  it('stops at the first failing task and reports it without rejecting', async () => {
    const error = new Error('boom');
    const after = jest.fn(async () => {});

    const result = await runBootstrap([
      task('fonts'),
      task('storage', async () => {
        throw error;
      }),
      task('after', after),
    ]);

    expect(result).toEqual({ ok: false, failedTask: 'storage', error });
    expect(after).not.toHaveBeenCalled();
  });

  it('waits for the minimum duration in parallel with tasks', async () => {
    const sleep = jest.fn(async () => {});

    await runBootstrap([task('a')], { minDurationMs: 600, sleep });

    expect(sleep).toHaveBeenCalledWith(600);
  });

  it('skips sleeping when no minimum duration is set', async () => {
    const sleep = jest.fn(async () => {});

    await runBootstrap([task('a')], { sleep });

    expect(sleep).not.toHaveBeenCalled();
  });

  it('uses a real timer by default', async () => {
    jest.useFakeTimers();
    try {
      let settled = false;
      const pending = runBootstrap([], { minDurationMs: 600 }).then(() => {
        settled = true;
      });

      await jest.advanceTimersByTimeAsync(599);
      expect(settled).toBe(false);
      await jest.advanceTimersByTimeAsync(1);
      await pending;
      expect(settled).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });
});
