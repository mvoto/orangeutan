import { acceptedNickname, nicknameFromSeed } from '../nickname';

describe('nicknameFromSeed', () => {
  it('builds the same Nickname from the same seed', () => {
    expect(nicknameFromSeed(0)).toBe('Calm Orangutan');
    expect(nicknameFromSeed(1)).toBe('Sunny Orangutan');
    expect(nicknameFromSeed(10)).toBe('Calm Orange');
  });
});

describe('acceptedNickname', () => {
  it('rejects an empty Nickname', () => {
    expect(acceptedNickname('')).toBeNull();
    expect(acceptedNickname('   ')).toBeNull();
  });

  it('rejects a Nickname longer than 24 characters', () => {
    expect(acceptedNickname('ABCDEFGHIJKLMNOPQRSTUVWXY')).toBeNull();
  });

  it('rejects anything other than letters and single spaces', () => {
    expect(acceptedNickname('Calm Orangutan!')).toBeNull();
    expect(acceptedNickname('Calm  Orangutan')).toBeNull();
    expect(acceptedNickname('Calm Orangutan 2')).toBeNull();
  });

  it('accepts a generated Nickname and a normal rename', () => {
    expect(acceptedNickname(nicknameFromSeed(0))).toBe('Calm Orangutan');
    expect(acceptedNickname('  Sunny Grove  ')).toBe('Sunny Grove');
  });
});
