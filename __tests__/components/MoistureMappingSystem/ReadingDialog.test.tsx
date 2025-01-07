import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { MaterialType } from '@prisma/client';
import { ReadingDialog } from '../../../app/components/MoistureMappingSystem/ReadingDialog';

describe('ReadingDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockPosition = { x: 100, y: 200 };

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    position: mockPosition,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    render(
      <ReadingDialog
        {...defaultProps}
        isOpen={false}
      />
    );

    expect(screen.queryByText('Add Moisture Reading')).not.toBeInTheDocument();
  });

  it('renders dialog with position coordinates', () => {
    render(<ReadingDialog {...defaultProps} />);

    expect(screen.getByText('Add Moisture Reading')).toBeInTheDocument();
    expect(screen.getByText(`(${mockPosition.x}, ${mockPosition.y})`)).toBeInTheDocument();
  });

  it('renders form inputs with correct labels', () => {
    render(<ReadingDialog {...defaultProps} />);

    expect(screen.getByLabelText('Reading Value (%)')).toBeInTheDocument();
    expect(screen.getByLabelText('Material Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
  });

  it('includes all material types in dropdown', () => {
    render(<ReadingDialog {...defaultProps} />);

    const select = screen.getByLabelText('Material Type');
    const options = Array.from(select.getElementsByTagName('option'));
    const materialTypes = Object.values(MaterialType);

    expect(options).toHaveLength(materialTypes.length);
    materialTypes.forEach(type => {
      expect(screen.getByText(type)).toBeInTheDocument();
    });
  });

  it('calls onSubmit with form values when submitted', () => {
    render(<ReadingDialog {...defaultProps} />);

    // Fill out form
    fireEvent.change(screen.getByLabelText('Reading Value (%)'), {
      target: { value: '15.5' },
    });
    fireEvent.change(screen.getByLabelText('Material Type'), {
      target: { value: MaterialType.Wood },
    });
    fireEvent.change(screen.getByLabelText('Notes'), {
      target: { value: 'Test notes' },
    });

    // Submit form
    fireEvent.click(screen.getByText('Add Reading'));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      15.5,
      MaterialType.Wood,
      'Test notes'
    );
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<ReadingDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('validates reading value is a number', () => {
    render(<ReadingDialog {...defaultProps} />);

    // Try to submit with invalid value
    fireEvent.change(screen.getByLabelText('Reading Value (%)'), {
      target: { value: 'invalid' },
    });
    fireEvent.click(screen.getByText('Add Reading'));

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('resets form after successful submission', () => {
    render(<ReadingDialog {...defaultProps} />);

    // Fill and submit form
    fireEvent.change(screen.getByLabelText('Reading Value (%)'), {
      target: { value: '15.5' },
    });
    fireEvent.change(screen.getByLabelText('Notes'), {
      target: { value: 'Test notes' },
    });
    fireEvent.click(screen.getByText('Add Reading'));

    // Dialog should be closed
    expect(mockOnClose).toHaveBeenCalled();

    // Reopen dialog
    render(<ReadingDialog {...defaultProps} />);

    // Form should be reset
    expect(screen.getByLabelText('Reading Value (%)')).toHaveValue('');
    expect(screen.getByLabelText('Material Type')).toHaveValue(MaterialType.Drywall);
    expect(screen.getByLabelText('Notes')).toHaveValue('');
  });

  it('enforces min and max values for reading input', () => {
    render(<ReadingDialog {...defaultProps} />);

    const input = screen.getByLabelText('Reading Value (%)');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
  });

  it('uses step of 0.1 for reading value input', () => {
    render(<ReadingDialog {...defaultProps} />);

    expect(screen.getByLabelText('Reading Value (%)')).toHaveAttribute('step', '0.1');
  });

  it('autofocuses reading value input', () => {
    render(<ReadingDialog {...defaultProps} />);

    expect(screen.getByLabelText('Reading Value (%)')).toHaveFocus();
  });
});
