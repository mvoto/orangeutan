import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { BootstrapTask } from '../run-bootstrap';
import { useBootstrap } from '../use-bootstrap';

const noTasks: readonly BootstrapTask[] = [];

describe('useBootstrap', () => {
  it('starts loading and becomes ready', async () => {
    const { result } = await renderHook(() => useBootstrap(noTasks));

    await waitFor(() => expect(result.current.status).toBe('ready'));
  });

  it('reports errors and recovers on retry', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    let shouldFail = true;
    const tasks: readonly BootstrapTask[] = [
      {
        name: 'flaky',
        run: async () => {
          if (shouldFail) throw new Error('flaky');
        },
      },
    ];

    const { result } = await renderHook(() => useBootstrap(tasks));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(consoleError).toHaveBeenCalled();

    shouldFail = false;
    await act(() => result.current.retry());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    consoleError.mockRestore();
  });

  it('ignores results that arrive after unmount', async () => {
    let finish: () => void = () => {};
    const tasks: readonly BootstrapTask[] = [
      { name: 'slow', run: () => new Promise<void>((resolve) => (finish = resolve)) },
    ];

    const { result, unmount } = await renderHook(() => useBootstrap(tasks));
    await unmount();
    await act(async () => finish());

    expect(result.current.status).toBe('loading');
  });
});
