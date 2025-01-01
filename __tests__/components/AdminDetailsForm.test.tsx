import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AdminDetailsForm from '@/components/AdminDetailsForm';
import { formatPhoneNumber } from '@/utils/adminHelpers';

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  } as Response)
);

describe('AdminDetailsForm', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders all form sections', () => {
    render(<AdminDetailsForm />);

    // Check for section headings
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Site Information')).toBeInTheDocument();
    expect(screen.getByText('Staff Members')).toBeInTheDocument();
    expect(screen.getByText('Claim Information')).toBeInTheDocument();
    expect(screen.getByText('Additional Notes')).toBeInTheDocument();
  });

  it('shows validation errors for required fields when submitting empty form', async () => {
    render(<AdminDetailsForm />);

    // Try to submit the empty form
    fireEvent.click(screen.getByRole('button', { name: 'Review Details' }));

    // Check for required field error messages
    await waitFor(() => {
      expect(screen.getByText('Job supplier is required')).toBeInTheDocument();
      expect(screen.getByText('Order number is required')).toBeInTheDocument();
      expect(screen.getByText('Date contacted is required')).toBeInTheDocument();
      expect(screen.getByText('Client name is required')).toBeInTheDocument();
      expect(screen.getByText('Site address is required')).toBeInTheDocument();
    });
  });

  it('validates phone number format', async () => {
    render(<AdminDetailsForm />);

    // Enter invalid phone number
    const primaryPhoneInput = screen.getByPlaceholderText('Enter Primary Phone');
    await userEvent.type(primaryPhoneInput, '123');

    // Try to submit
    fireEvent.click(screen.getByRole('button', { name: 'Review Details' }));

    // Check for phone number validation error
    await waitFor(() => {
      expect(screen.getByText('Invalid phone number format')).toBeInTheDocument();
    });

    // Enter valid phone number
    await userEvent.clear(primaryPhoneInput);
    await userEvent.type(primaryPhoneInput, '1234567890');

    // Try to submit again
    fireEvent.click(screen.getByRole('button', { name: 'Review Details' }));

    // Check that phone number error is gone
    await waitFor(() => {
      expect(screen.queryByText('Invalid phone number format')).not.toBeInTheDocument();
    });
  });

  it('handles staff member addition and removal', async () => {
    render(<AdminDetailsForm />);

    // Add staff member
    fireEvent.click(screen.getByText('Add Staff Member'));
    
    // Check if input field appears
    const staffInput = screen.getByPlaceholderText('Enter Staff Member Name');
    expect(staffInput).toBeInTheDocument();

    // Enter staff member name
    await userEvent.type(staffInput, 'John Doe');
    expect(staffInput).toHaveValue('John Doe');

    // Remove staff member
    fireEvent.click(screen.getByText('Remove'));
    
    // Check if input field is removed
    expect(screen.queryByPlaceholderText('Enter Staff Member Name')).not.toBeInTheDocument();
  });

  it('shows preview modal when form is valid', async () => {
    render(<AdminDetailsForm />);

    // Fill in required fields
    await userEvent.type(screen.getByPlaceholderText('Enter Job Supplier'), 'Test Supplier');
    await userEvent.type(screen.getByPlaceholderText('Enter Order Number'), '12345');
    await userEvent.type(screen.getByPlaceholderText('Enter Client Name'), 'John Doe');
    await userEvent.type(screen.getByPlaceholderText('Enter Primary Phone'), '1234567890');
    await userEvent.type(screen.getByPlaceholderText('Enter Site Address'), '123 Test St');
    
    const dateContactedInput = screen.getByLabelText('Date Contacted:');
    fireEvent.change(dateContactedInput, { target: { value: '2024-01-01' } });

    const timeContactedInput = screen.getByLabelText('Time Contacted:');
    fireEvent.change(timeContactedInput, { target: { value: '09:00' } });

    const claimDateInput = screen.getByLabelText('Claim Date:');
    fireEvent.change(claimDateInput, { target: { value: '2024-01-01' } });

    const claimTypeSelect = screen.getByLabelText('Claim Type:');
    fireEvent.change(claimTypeSelect, { target: { value: 'water' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Review Details' }));

    // Check if preview modal appears
    await waitFor(() => {
      // Look for the preview modal heading specifically
      expect(screen.getByRole('heading', { name: 'Review Details', level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm & Save' })).toBeInTheDocument();
    });
  });

  it('successfully submits form data', async () => {
    // Mock successful API response
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          message: 'Details saved successfully',
          data: { id: '123' }
        })
      })
    );

    render(<AdminDetailsForm />);

    // Fill in required fields (same as previous test)
    await userEvent.type(screen.getByPlaceholderText('Enter Job Supplier'), 'Test Supplier');
    await userEvent.type(screen.getByPlaceholderText('Enter Order Number'), '12345');
    await userEvent.type(screen.getByPlaceholderText('Enter Client Name'), 'John Doe');
    await userEvent.type(screen.getByPlaceholderText('Enter Primary Phone'), '1234567890');
    await userEvent.type(screen.getByPlaceholderText('Enter Site Address'), '123 Test St');
    
    const dateContactedInput = screen.getByLabelText('Date Contacted:');
    fireEvent.change(dateContactedInput, { target: { value: '2024-01-01' } });

    const timeContactedInput = screen.getByLabelText('Time Contacted:');
    fireEvent.change(timeContactedInput, { target: { value: '09:00' } });

    const claimDateInput = screen.getByLabelText('Claim Date:');
    fireEvent.change(claimDateInput, { target: { value: '2024-01-01' } });

    const claimTypeSelect = screen.getByLabelText('Claim Type:');
    fireEvent.change(claimTypeSelect, { target: { value: 'water' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Review Details' }));

    // Confirm in preview modal
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Confirm & Save' }));
    });

    // Check if success message appears
    await waitFor(() => {
      expect(screen.getByText('Details saved successfully!')).toBeInTheDocument();
    });

    // Verify API call
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/save-details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.any(String),
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock API error response
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          error: 'Failed to save details'
        })
      })
    );

    render(<AdminDetailsForm />);

    // Fill in required fields (same as previous tests)
    await userEvent.type(screen.getByPlaceholderText('Enter Job Supplier'), 'Test Supplier');
    await userEvent.type(screen.getByPlaceholderText('Enter Order Number'), '12345');
    await userEvent.type(screen.getByPlaceholderText('Enter Client Name'), 'John Doe');
    await userEvent.type(screen.getByPlaceholderText('Enter Primary Phone'), '1234567890');
    await userEvent.type(screen.getByPlaceholderText('Enter Site Address'), '123 Test St');
    
    const dateContactedInput = screen.getByLabelText('Date Contacted:');
    fireEvent.change(dateContactedInput, { target: { value: '2024-01-01' } });

    const timeContactedInput = screen.getByLabelText('Time Contacted:');
    fireEvent.change(timeContactedInput, { target: { value: '09:00' } });

    const claimDateInput = screen.getByLabelText('Claim Date:');
    fireEvent.change(claimDateInput, { target: { value: '2024-01-01' } });

    const claimTypeSelect = screen.getByLabelText('Claim Type:');
    fireEvent.change(claimTypeSelect, { target: { value: 'water' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Review Details' }));

    // Confirm in preview modal
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Confirm & Save' }));
    });

    // Check if error message appears
    await waitFor(() => {
      expect(screen.getByText('Failed to save details')).toBeInTheDocument();
    });
  });
});
