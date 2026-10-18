import { useCallback, useEffect, useState } from 'react';

import type { BootstrapOptions, BootstrapTask } from './run-bootstrap';
import { runBootstrap } from './run-bootstrap';

export type BootstrapStatus = 'loading' | 'ready' | 'error';

export type UseBootstrapResult = {
  readonly status: BootstrapStatus;
  readonly retry: () => void;
};

export function useBootstrap(
  tasks: readonly BootstrapTask[],
  options: BootstrapOptions = {},
): UseBootstrapResult {
  const [status, setStatus] = useState<BootstrapStatus>('loading');
  const [attempt, setAttempt] = useState(0);
  const { minDurationMs, sleep } = options;

  useEffect(() => {
    let active = true;

    void runBootstrap(tasks, { minDurationMs, sleep }).then((result) => {
      if (!active) return;
      if (!result.ok) {
        console.error(`Bootstrap task "${result.failedTask}" failed`, result.error);
      }
      setStatus(result.ok ? 'ready' : 'error');
    });

    return () => {
      active = false;
    };
  }, [tasks, minDurationMs, sleep, attempt]);

  const retry = useCallback(() => {
    setStatus('loading');
    setAttempt((n) => n + 1);
  }, []);

  return { status, retry };
}
