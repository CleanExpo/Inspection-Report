import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AuthorityToCommenceRestoration from '@/components/AuthorityForms/AuthorityToCommenceRestoration';

// Mock SignaturePad
jest.mock('react-signature-canvas', () => {
  return function MockSignaturePad({ onEnd }: { onEnd: () => void }) {
    return (
      <div data-testid="signature-pad" onClick={onEnd}>
        Mock Signature Pad
      </div>
    );
  };
});

describe('AuthorityToCommenceRestoration', () => {
  const mockPrefillData = {
    name: '',
    address: '',
    claimNumber: '',
    date: '',
  };

  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(
      <AuthorityToCommenceRestoration
        prefillData={mockPrefillData}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByLabelText(/name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/claim number:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date:/i)).toBeInTheDocument();
    expect(screen.getByTestId('signature-pad')).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    render(
      <AuthorityToCommenceRestoration
        prefillData={mockPrefillData}
        onSave={mockOnSave}
      />
    );

    fireEvent.click(screen.getByText(/save form/i));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/address is required/i)).toBeInTheDocument();
      expect(screen.getByText(/claim number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/signature is required/i)).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('validates future dates', async () => {
    render(
      <AuthorityToCommenceRestoration
        prefillData={mockPrefillData}
        onSave={mockOnSave}
      />
    );

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];

    const dateInput = screen.getByLabelText(/date:/i);
    fireEvent.change(dateInput, { target: { value: futureDateString } });

    fireEvent.click(screen.getByText(/save form/i));

    await waitFor(() => {
      expect(screen.getByText(/date cannot be in the future/i)).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('handles form submission with valid data', async () => {
    render(
      <AuthorityToCommenceRestoration
        prefillData={mockPrefillData}
        onSave={mockOnSave}
      />
    );

    // Fill in form fields
    await userEvent.type(screen.getByLabelText(/name:/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/address:/i), '123 Test St');
    await userEvent.type(screen.getByLabelText(/claim number:/i), 'CLM123');
    
    const today = new Date().toISOString().split('T')[0];
    fireEvent.change(screen.getByLabelText(/date:/i), {
      target: { value: today },
    });

    // Simulate signature
    fireEvent.click(screen.getByTestId('signature-pad'));

    // Submit form
    fireEvent.click(screen.getByText(/save form/i));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        name: 'John Doe',
        address: '123 Test St',
        claimNumber: 'CLM123',
        date: today,
      }));
    });

    expect(screen.getByText(/form saved successfully/i)).toBeInTheDocument();
  });

  it('pre-fills form data when provided', () => {
    const prefillData = {
      name: 'John Doe',
      address: '123 Test St',
      claimNumber: 'CLM123',
      date: '2024-01-01',
    };

    render(
      <AuthorityToCommenceRestoration
        prefillData={prefillData}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByLabelText(/name:/i)).toHaveValue('John Doe');
    expect(screen.getByLabelText(/address:/i)).toHaveValue('123 Test St');
    expect(screen.getByLabelText(/claim number:/i)).toHaveValue('CLM123');
    expect(screen.getByLabelText(/date:/i)).toHaveValue('2024-01-01');
  });

  it('handles signature pad clear button', async () => {
    render(
      <AuthorityToCommenceRestoration
        prefillData={mockPrefillData}
        onSave={mockOnSave}
      />
    );

    // Simulate signature
    fireEvent.click(screen.getByTestId('signature-pad'));

    // Clear signature
    fireEvent.click(screen.getByText(/clear signature/i));

    // Try to submit form
    fireEvent.click(screen.getByText(/save form/i));

    await waitFor(() => {
      expect(screen.getByText(/signature is required/i)).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });
});
