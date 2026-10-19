import { AppText, Screen } from '@/ui';

/** Level 1. Rule cards, the grid, and back arrive with the play tests. */
export function LevelScreen(): React.JSX.Element {
  return (
    <Screen testID="level-screen">
      <AppText variant="title">Level 1</AppText>
    </Screen>
  );
}
