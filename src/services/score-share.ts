import { Share } from 'react-native';

export type ScoreShare = {
  share(score: number): Promise<void>;
};

/**
 * Hands the Score to the system share sheet.
 * expo-sharing shares a file. The Score is a number, so the sheet takes the text.
 */
export const deviceScoreShare: ScoreShare = {
  async share(score) {
    await Share.share({ message: String(score) });
  },
};
