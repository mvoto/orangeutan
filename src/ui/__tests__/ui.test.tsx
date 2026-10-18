import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTheme } from '@/test/render-with-theme';
import { placeholderTheme } from '@/theme';

import { AppText, ErrorFallback } from '../index';

describe('<AppText />', () => {
  it('applies the typography and color tokens for its variant', async () => {
    await renderWithTheme(
      <AppText variant="title" color="textSecondary">
        Hello
      </AppText>,
    );

    expect(screen.getByText('Hello')).toHaveStyle({
      fontSize: placeholderTheme.typography.title.fontSize,
      color: placeholderTheme.colors.textSecondary,
    });
  });
});

describe('<ErrorFallback />', () => {
  it('shows a friendly message and retries', async () => {
    const onRetry = jest.fn();
    await renderWithTheme(<ErrorFallback onRetry={onRetry} />);

    expect(screen.getByText('Something went wrong.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
