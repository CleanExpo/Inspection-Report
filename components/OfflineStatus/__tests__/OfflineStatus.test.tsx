import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../app/theme';
import OfflineStatus from '../OfflineStatus';

interface OfflineStatusType {
  isOnline: boolean;
  hasPendingSync: boolean;
  lastSyncAttempt: string | null;
}

type SubscribeCallback = (status: OfflineStatusType) => void;
type UnsubscribeFunction = () => void;
type SubscribeFunction = (callback: SubscribeCallback) => UnsubscribeFunction;

// Mock the offlineService
const mockOfflineService = {
  subscribeToStatus: jest.fn().mockImplementation((callback: SubscribeCallback) => {
    callback({ isOnline: true, hasPendingSync: false, lastSyncAttempt: null });
    return () => {}; // Unsubscribe function
  }),
  syncOfflineData: jest.fn().mockResolvedValue(undefined),
  skipWaiting: jest.fn().mockResolvedValue(undefined),
};

jest.mock('../../../services/offlineService', () => ({
  offlineService: mockOfflineService,
}));

describe('OfflineStatus', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithTheme(<OfflineStatus />);
  });

  it('shows offline message when network is offline', () => {
    mockOfflineService.subscribeToStatus.mockImplementation((callback: SubscribeCallback) => {
      callback({ isOnline: false, hasPendingSync: false, lastSyncAttempt: null });
      return () => {};
    });

    renderWithTheme(<OfflineStatus />);
    expect(screen.getByText(/you're offline/i)).toBeInTheDocument();
  });

  it('shows sync message when there are pending changes', () => {
    mockOfflineService.subscribeToStatus.mockImplementation((callback: SubscribeCallback) => {
      callback({
        isOnline: true,
        hasPendingSync: true,
        lastSyncAttempt: new Date().toISOString(),
      });
      return () => {};
    });

    renderWithTheme(<OfflineStatus />);
    expect(screen.getByText(/changes pending sync/i)).toBeInTheDocument();
  });

  it('handles sync button click', async () => {
    mockOfflineService.subscribeToStatus.mockImplementation((callback: SubscribeCallback) => {
      callback({
        isOnline: true,
        hasPendingSync: true,
        lastSyncAttempt: new Date().toISOString(),
      });
      return () => {};
    });

    renderWithTheme(<OfflineStatus />);
    
    const syncButton = screen.getByText(/sync now/i);
    expect(syncButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(syncButton);
    });

    expect(mockOfflineService.syncOfflineData).toHaveBeenCalled();
  });

  it('handles update available', async () => {
    renderWithTheme(<OfflineStatus />);

    // Simulate update available event
    await act(async () => {
      window.dispatchEvent(new CustomEvent('swUpdateAvailable'));
    });

    expect(screen.getByText(/update available/i)).toBeInTheDocument();

    const updateButton = screen.getByText(/update now/i);
    expect(updateButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(updateButton);
    });

    expect(mockOfflineService.skipWaiting).toHaveBeenCalled();
  });

  it('unsubscribes from status updates on unmount', () => {
    const unsubscribe = jest.fn();
    mockOfflineService.subscribeToStatus.mockReturnValue(unsubscribe);

    const { unmount } = renderWithTheme(<OfflineStatus />);
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
