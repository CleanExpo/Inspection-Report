import { render, screen } from '@testing-library/react';
import { LoadingState } from '../components/LoadingState';
import { ThemeProvider } from '../components/ThemeProvider';

// Mock the useBreakpoint hook
jest.mock('../hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({
    breakpoint: 'md',
    isMobile: false,
    isTablet: true,
    isDesktop: false,
  }),
}));

describe('LoadingState', () => {
  const renderWithTheme = (component: React.ReactNode) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  it('renders with default props', () => {
    renderWithTheme(<LoadingState />);
    
    const spinner = screen.getByRole('status');
    const text = screen.getByText('Loading...');
    
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-8 h-8'); // medium size
    expect(text).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    renderWithTheme(<LoadingState size="large" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-12 h-12');
  });

  it('renders with custom text', () => {
    const customText = 'Please wait...';
    renderWithTheme(<LoadingState text={customText} />);
    
    expect(screen.getByText(customText)).toBeInTheDocument();
  });

  it('renders in fullScreen mode', () => {
    renderWithTheme(<LoadingState fullScreen />);
    
    const container = screen.getByRole('status').parentElement?.parentElement;
    expect(container).toHaveClass('fixed inset-0');
  });

  it('applies correct accessibility attributes', () => {
    renderWithTheme(<LoadingState />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });
});
