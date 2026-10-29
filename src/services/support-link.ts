import * as Linking from 'expo-linking';

/** Public issue tracker. The project has no separate support inbox. */
export const supportIssuesUrl = 'https://github.com/mvoto/orangeutan/issues';

export type SupportLink = {
  open(): Promise<void>;
};

/** Opens the project issues in the platform handler for https links. */
export const deviceSupportLink: SupportLink = {
  async open() {
    await Linking.openURL(supportIssuesUrl);
  },
};
