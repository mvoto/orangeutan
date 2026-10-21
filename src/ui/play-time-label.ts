/** Visible Play time. Stored time stays whole seconds. Home names the sum. */
export function playTimeLabel(seconds: number, scope: 'level' | 'total' = 'level'): string {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(whole / 60);
  const remainder = whole % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(remainder).padStart(2, '0');
  const name = scope === 'total' ? 'total timer' : 'timer';
  return `${name}: ${mm}:${ss}`;
}
