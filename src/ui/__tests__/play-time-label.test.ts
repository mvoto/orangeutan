import { playTimeLabel } from '../play-time-label';

describe('play time label', () => {
  it('writes whole seconds as timer: mm:ss', () => {
    expect(playTimeLabel(0)).toBe('timer: 00:00');
    expect(playTimeLabel(1)).toBe('timer: 00:01');
    expect(playTimeLabel(61)).toBe('timer: 01:01');
    expect(playTimeLabel(3600)).toBe('timer: 60:00');
    expect(playTimeLabel(30, 'total')).toBe('total timer: 00:30');
  });
});
