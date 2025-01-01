import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AuthorityForms from '@/components/AuthorityForms';

// Mock the AuthorityToCommenceRestoration component
jest.mock('@/components/AuthorityForms/AuthorityToCommenceRestoration', () => {
  return function MockAuthorityToCommenceRestoration({ onSave }: any) {
    return (
      <div data-testid="mock-authority-form">
        <button
          onClick={() => onSave({
            name: 'John Doe',
            address: '123 Test St',
            claimNumber: 'CLM123',
            date: '2024-01-01',
            signature: 'data:image/png;base64,test'
          })}
        >
          Mock Save Form
        </button>
      </div>
    );
  };
});

// Mock fetch
global.fetch = jest.fn();

describe('AuthorityForms', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders the authority forms section', () => {
    render(<AuthorityForms />);
    
    expect(screen.getByText('Authority Forms')).toBeInTheDocument();
    expect(screen.getByTestId('mock-authority-form')).toBeInTheDocument();
  });

  it('handles successful form submission', async () => {
    // Mock successful API response
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          message: 'Authority form saved successfully',
          data: {
            id: 'test-id',
            name: 'John Doe',
            address: '123 Test St',
            claimNumber: 'CLM123',
            date: '2024-01-01',
            signature: 'data:image/png;base64,test'
          }
        })
      })
    );

    render(<AuthorityForms />);

    // Click the mock save button
    fireEvent.click(screen.getByText('Mock Save Form'));

    // Wait for the saved form to appear
    await waitFor(() => {
      expect(screen.getByText('Saved Forms')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('CLM123')).toBeInTheDocument();
      expect(screen.getByText('Signed')).toBeInTheDocument();
    });

    // Verify API call
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/api/authority/save-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.any(String),
    });
  });

  it('handles API errors', async () => {
    // Mock API error response
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          error: 'Failed to save form'
        })
      })
    );

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<AuthorityForms />);

    // Click the mock save button
    fireEvent.click(screen.getByText('Mock Save Form'));

    // Wait for error handling
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error saving form:',
        expect.any(Error)
      );
    });

    // Verify no saved forms are displayed
    expect(screen.queryByText('Saved Forms')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('displays multiple saved forms', async () => {
    // Mock two successful form submissions
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            message: 'Authority form saved successfully',
            data: {
              id: 'test-id-1',
              name: 'John Doe',
              claimNumber: 'CLM123',
              date: '2024-01-01',
            }
          })
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            message: 'Authority form saved successfully',
            data: {
              id: 'test-id-2',
              name: 'Jane Smith',
              claimNumber: 'CLM456',
              date: '2024-01-02',
            }
          })
        })
      );

    render(<AuthorityForms />);

    // Submit first form
    fireEvent.click(screen.getByText('Mock Save Form'));

    // Wait for first saved form
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('CLM123')).toBeInTheDocument();
    });

    // Submit second form
    fireEvent.click(screen.getByText('Mock Save Form'));

    // Wait for second saved form
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('CLM456')).toBeInTheDocument();
    });

    // Verify both forms are displayed
    expect(screen.getAllByText('Signed')).toHaveLength(2);
  });

  it('formats dates correctly in saved forms', async () => {
    // Mock successful API response with a specific date
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          message: 'Authority form saved successfully',
          data: {
            id: 'test-id',
            name: 'John Doe',
            claimNumber: 'CLM123',
            date: '2024-01-15', // Specific test date
          }
        })
      })
    );

    render(<AuthorityForms />);

    // Submit form
    fireEvent.click(screen.getByText('Mock Save Form'));

    // Wait for the saved form and check date formatting
    await waitFor(() => {
      // This assumes the date is formatted using toLocaleDateString()
      // The exact format might vary depending on the user's locale
      expect(screen.getByText('1/15/2024')).toBeInTheDocument();
    });
  });
});
