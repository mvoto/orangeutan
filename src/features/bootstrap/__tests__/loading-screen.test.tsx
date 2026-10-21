import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithTheme } from '@/test/render-with-theme';

import { LoadingScreen } from '../loading-screen';

describe('<LoadingScreen />', () => {
  it('shows the logo and a spinner while loading', async () => {
    await renderWithTheme(<LoadingScreen status="loading" onRetry={jest.fn()} />);

    expect(screen.getByLabelText('Orangeutan')).toBeOnTheScreen();
    expect(screen.getByTestId('loading-indicator')).toBeOnTheScreen();
    expect(screen.queryByTestId('bootstrap-retry')).not.toBeOnTheScreen();
  });

  it('offers a retry when startup fails', async () => {
    const onRetry = jest.fn();
    await renderWithTheme(<LoadingScreen status="error" onRetry={onRetry} />);

    expect(screen.queryByTestId('loading-indicator')).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('notifies once laid out so the native splash can hide', async () => {
    const onLayout = jest.fn();
    await renderWithTheme(
      <LoadingScreen status="loading" onRetry={jest.fn()} onLayout={onLayout} />,
    );

    await fireEvent(screen.getByTestId('loading-content'), 'layout');

    expect(onLayout).toHaveBeenCalled();
  });
});
