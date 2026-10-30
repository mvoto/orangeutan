export type NicknameSeed = {
  next(): number;
};

/** A wipe has no stored Nickname, so the next launch draws a new seed. */
export const deviceNicknameSeed: NicknameSeed = {
  next: () => Date.now(),
};
