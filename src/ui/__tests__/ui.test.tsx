import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTheme } from '@/test/render-with-theme';
import { placeholderTheme, treehouseTheme } from '@/theme';

import { AppText, Button, ErrorFallback } from '../index';

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

describe('<Button />', () => {
  it('uses the cocoa primary color only when that emphasis is requested', async () => {
    await renderWithTheme(
      <>
        <Button label="PLAY" emphasis="primary" onPress={jest.fn()} />
        <Button label="Try again" onPress={jest.fn()} />
      </>,
      { theme: treehouseTheme },
    );

    expect(screen.getByRole('button', { name: 'PLAY' })).toHaveStyle({
      backgroundColor: '#7A5340',
    });
    expect(screen.getByRole('button', { name: 'Try again' })).not.toHaveStyle({
      backgroundColor: '#7A5340',
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
