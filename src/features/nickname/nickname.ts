const adjectives = [
  'Calm',
  'Sunny',
  'Gentle',
  'Cozy',
  'Bright',
  'Soft',
  'Quiet',
  'Merry',
  'Warm',
  'Tiny',
] as const;

const nouns = [
  'Orangutan',
  'Orange',
  'Leaf',
  'Nest',
  'Breeze',
  'Pebble',
  'Grove',
  'Mango',
  'Cloud',
  'Lantern',
] as const;

const maxNicknameLength = 24;

/** Trimmed Nickname, or null when the rename must leave the current one in place. */
export function acceptedNickname(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > maxNicknameLength) return null;
  if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(trimmed)) return null;
  return trimmed;
}

/** Adjective + Noun. The same seed always picks the same pair from the lists in this file. */
export function nicknameFromSeed(seed: number): string {
  const index = Math.trunc(Math.abs(seed));
  const adjective = adjectives[index % adjectives.length] ?? 'Calm';
  const noun = nouns[Math.floor(index / adjectives.length) % nouns.length] ?? 'Orangutan';
  return `${adjective} ${noun}`;
}
