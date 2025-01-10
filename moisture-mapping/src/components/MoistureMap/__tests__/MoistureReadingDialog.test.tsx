import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MoistureReadingDialog } from '../MoistureReadingDialog';

describe('MoistureReadingDialog', () => {
    const defaultProps = {
        open: true,
        onClose: jest.fn(),
        onSubmit: jest.fn(),
        position: { x: 100, y: 200 },
        criticalThreshold: 16
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders dialog with correct position', () => {
        render(<MoistureReadingDialog {...defaultProps} />);
        
        expect(screen.getByText('Position: (100, 200)')).toBeInTheDocument();
    });

    it('shows critical threshold warning when value exceeds threshold', async () => {
        render(<MoistureReadingDialog {...defaultProps} />);
        
        // Find the number input
        const input = screen.getByRole('spinbutton');
        
        // Enter a value above threshold
        await act(async () => {
            await userEvent.clear(input);
            await userEvent.type(input, '20');
        });
        
        expect(screen.getByText(/Warning: Reading exceeds critical threshold/)).toBeInTheDocument();
    });

    it('validates input range', async () => {
        render(<MoistureReadingDialog {...defaultProps} />);
        
        const input = screen.getByRole('spinbutton');
        const submitButton = screen.getByText('Add Reading');
        
        // Test negative value
        await act(async () => {
            await userEvent.clear(input);
            await userEvent.type(input, '-1');
            fireEvent.click(submitButton);
        });
        
        expect(screen.getByText('Moisture reading cannot be negative')).toBeInTheDocument();
        
        // Test value over 100
        await act(async () => {
            await userEvent.clear(input);
            await userEvent.type(input, '101');
            fireEvent.click(submitButton);
        });
        
        expect(screen.getByText('Moisture reading cannot exceed 100')).toBeInTheDocument();
    });

    it('handles notes input', async () => {
        render(<MoistureReadingDialog {...defaultProps} />);
        
        const notesInput = screen.getByLabelText('Notes');
        const testNote = 'Test observation';
        
        await act(async () => {
            await userEvent.type(notesInput, testNote);
        });
        
        expect(notesInput).toHaveValue(testNote);
    });

    it('submits reading with notes', async () => {
        render(<MoistureReadingDialog {...defaultProps} />);
        
        const valueInput = screen.getByRole('spinbutton');
        const notesInput = screen.getByLabelText('Notes');
        const submitButton = screen.getByText('Add Reading');
        
        await act(async () => {
            await userEvent.clear(valueInput);
            await userEvent.type(valueInput, '15');
            await userEvent.type(notesInput, 'Test note');
            fireEvent.click(submitButton);
        });
        
        expect(defaultProps.onSubmit).toHaveBeenCalledWith(15, 'Test note');
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('handles slider changes', async () => {
        render(<MoistureReadingDialog {...defaultProps} />);
        
        const slider = screen.getByRole('slider');
        
        await act(async () => {
            fireEvent.change(slider, { target: { value: 50 } });
        });
        
        const valueInput = screen.getByRole('spinbutton');
        expect(valueInput).toHaveValue(50);
    });

    it('resets form on close and reopen', async () => {
        const { rerender } = render(<MoistureReadingDialog {...defaultProps} />);
        
        // Enter some values
        const valueInput = screen.getByRole('spinbutton');
        const notesInput = screen.getByLabelText('Notes');
        
        await act(async () => {
            await userEvent.clear(valueInput);
            await userEvent.type(valueInput, '15');
            await userEvent.type(notesInput, 'Test note');
        });
        
        // Close dialog
        rerender(<MoistureReadingDialog {...defaultProps} open={false} />);
        
        // Reopen dialog
        rerender(<MoistureReadingDialog {...defaultProps} open={true} />);
        
        // Check if values are reset
        expect(screen.getByRole('spinbutton')).toHaveValue(0);
        expect(screen.getByLabelText('Notes')).toHaveValue('');
    });

    it('handles cancel action', () => {
        render(<MoistureReadingDialog {...defaultProps} />);
        
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
        
        expect(defaultProps.onClose).toHaveBeenCalled();
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('clears error when input becomes valid', async () => {
        render(<MoistureReadingDialog {...defaultProps} />);
        
        const input = screen.getByRole('spinbutton');
        const submitButton = screen.getByText('Add Reading');
        
        // First create an error
        await act(async () => {
            await userEvent.clear(input);
            await userEvent.type(input, '-1');
            fireEvent.click(submitButton);
        });
        
        expect(screen.getByText('Moisture reading cannot be negative')).toBeInTheDocument();
        
        // Then fix the input
        await act(async () => {
            await userEvent.clear(input);
            await userEvent.type(input, '15');
        });
        
        expect(screen.queryByText('Moisture reading cannot be negative')).not.toBeInTheDocument();
    });
});
