/** A wipe has no stored Nickname, so the next launch draws a new seed. */
export function freshNicknameSeed(): number {
  return Date.now();
}
