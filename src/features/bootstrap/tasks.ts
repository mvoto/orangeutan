import type { BootstrapTask } from './run-bootstrap';

/** Startup work (font loading, save-data hydration, ...) is registered here. */
export const bootstrapTasks: readonly BootstrapTask[] = [];

export const MIN_LOADING_MS = 600;
