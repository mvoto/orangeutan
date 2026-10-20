import Storage from 'expo-sqlite/kv-store';

export const saveKey = 'orangeutan.session';

export type SaveStore = {
  read(): string | null;
  write(value: string): void;
};

/** Expo's SQLite key-value store. A throw is an unreadable save, handled by the caller. */
export const deviceSaveStore: SaveStore = {
  read: () => Storage.getItemSync(saveKey),
  write: (value) => {
    Storage.setItemSync(saveKey, value);
  },
};
