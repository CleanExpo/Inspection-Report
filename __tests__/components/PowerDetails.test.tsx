/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PowerDetails from '@/components/PowerDetails/PowerDetails';

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  TextField: function MockTextField({ label, value, onChange, error, helperText, select, children, ...rest }: any) {
    return (
      <div>
        <label>{label}</label>
        <input
          value={value}
          onChange={onChange}
          aria-label={label}
          data-testid={rest['data-testid'] || label}
        />
        {error && <span>{helperText}</span>}
        {select && children}
      </div>
    );
  },
  MenuItem: function MockMenuItem(props: any) {
    return <option value={props.value}>{props.children}</option>;
  },
  Button: function MockButton(props: any) {
    return (
      <button onClick={props.onClick} disabled={props.disabled}>
        {props.children}
      </button>
    );
  },
  CircularProgress: function MockProgress() {
    return <div data-testid="loading-spinner" />;
  },
  Alert: function MockAlert(props: any) {
    return <div role="alert" data-severity={props.severity}>{props.children}</div>;
  },
  Dialog: function MockDialog(props: any) {
    return props.open ? <div role="dialog">{props.children}</div> : null;
  },
  DialogTitle: function MockDialogTitle(props: any) {
    return <div>{props.children}</div>;
  },
  DialogContent: function MockDialogContent(props: any) {
    return <div>{props.children}</div>;
  },
  DialogActions: function MockDialogActions(props: any) {
    return <div>{props.children}</div>;
  },
  Paper: function MockPaper(props: any) {
    return <div className={props.className}>{props.children}</div>;
  },
  Typography: function MockTypography(props: any) {
    return <div data-variant={props.variant}>{props.children}</div>;
  },
  Grid: function MockGrid(props: any) {
    return (
      <div className={`${props.container ? 'container' : ''} ${props.item ? 'item' : ''} ${props.className || ''}`}>
        {props.children}
      </div>
    );
  },
  Box: function MockBox(props: any) {
    return <div className={props.className}>{props.children}</div>;
  },
  Tooltip: function MockTooltip(props: any) {
    return (
      <div data-tooltip={props.title}>
        {props.children}
      </div>
    );
  },
}));

// Mock the usePowerReadings hook
const mockUsePowerReadings = jest.fn();
jest.mock('../../hooks/usePowerReadings', () => ({
  usePowerReadings: (options: any) => mockUsePowerReadings(options)
}));

describe('PowerDetails', () => {
  const defaultProps = {
    jobNumber: '123456-01',
    totalEquipmentPower: 5000,
    onSave: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock implementation
    mockUsePowerReadings.mockImplementation(() => ({
      readings: [],
      fieldErrors: {},
      error: null,
      isLoading: false,
      addReading: jest.fn(),
      updateReading: jest.fn(),
      removeReading: jest.fn(),
      validateAndSaveReadings: jest.fn(),
      getTotalPower: jest.fn(() => 0),
    }));
  });

  it('renders with job number', () => {
    render(<PowerDetails {...defaultProps} />);
    expect(screen.getByText(`Power Details - Job #${defaultProps.jobNumber}`)).toBeInTheDocument();
  });

  it('displays total power information', () => {
    render(<PowerDetails {...defaultProps} />);
    expect(screen.getByText(/Total Power: 0W \/ 5000W/)).toBeInTheDocument();
  });

  it('shows add reading button', () => {
    render(<PowerDetails {...defaultProps} />);
    expect(screen.getByText('Add Reading')).toBeInTheDocument();
  });

  it('shows save button', () => {
    render(<PowerDetails {...defaultProps} />);
    expect(screen.getByText('Save Readings')).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    mockUsePowerReadings.mockImplementation(() => ({
      readings: [],
      fieldErrors: {},
      error: 'Test error message',
      isLoading: false,
      addReading: jest.fn(),
      updateReading: jest.fn(),
      removeReading: jest.fn(),
      validateAndSaveReadings: jest.fn(),
      getTotalPower: jest.fn(() => 0),
    }));

    render(<PowerDetails {...defaultProps} />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('shows loading state during save', () => {
    mockUsePowerReadings.mockImplementation(() => ({
      readings: [],
      fieldErrors: {},
      error: null,
      isLoading: true,
      addReading: jest.fn(),
      updateReading: jest.fn(),
      removeReading: jest.fn(),
      validateAndSaveReadings: jest.fn(),
      getTotalPower: jest.fn(() => 0),
    }));

    render(<PowerDetails {...defaultProps} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays power readings with validation errors', () => {
    mockUsePowerReadings.mockImplementation(() => ({
      readings: [
        {
          equipmentId: 'dehu-1',
          equipmentName: 'Dehumidifier 1',
          watts: 2000,
          amps: 10,
          voltage: 120,
          timestamp: new Date().toISOString(),
        }
      ],
      fieldErrors: {
        '0-watts': 'Power readings are inconsistent (W = A × V)',
      },
      error: null,
      isLoading: false,
      addReading: jest.fn(),
      updateReading: jest.fn(),
      removeReading: jest.fn(),
      validateAndSaveReadings: jest.fn(),
      getTotalPower: jest.fn(() => 2000),
    }));

    render(<PowerDetails {...defaultProps} />);
    expect(screen.getByText('Power readings are inconsistent (W = A × V)')).toBeInTheDocument();
  });

  it('shows delete confirmation dialog', async () => {
    const mockRemoveReading = jest.fn();
    mockUsePowerReadings.mockImplementation(() => ({
      readings: [
        {
          equipmentId: 'dehu-1',
          equipmentName: 'Dehumidifier 1',
          watts: 1200,
          amps: 10,
          voltage: 120,
          timestamp: new Date().toISOString(),
        }
      ],
      fieldErrors: {},
      error: null,
      isLoading: false,
      addReading: jest.fn(),
      updateReading: jest.fn(),
      removeReading: mockRemoveReading,
      validateAndSaveReadings: jest.fn(),
      getTotalPower: jest.fn(() => 1200),
    }));

    render(<PowerDetails {...defaultProps} />);
    
    // Click remove button
    fireEvent.click(screen.getByText('Remove'));
    
    // Check if dialog is shown
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to remove this power reading?')).toBeInTheDocument();
    
    // Confirm deletion
    fireEvent.click(screen.getByText('Delete'));
    
    expect(mockRemoveReading).toHaveBeenCalledWith(0);
  });

  it('calls onSave when save button is clicked', async () => {
    const mockValidateAndSave = jest.fn();
    mockUsePowerReadings.mockImplementation(() => ({
      readings: [
        {
          equipmentId: 'dehu-1',
          equipmentName: 'Dehumidifier 1',
          watts: 1200,
          amps: 10,
          voltage: 120,
          timestamp: new Date().toISOString(),
        }
      ],
      fieldErrors: {},
      error: null,
      isLoading: false,
      addReading: jest.fn(),
      updateReading: jest.fn(),
      removeReading: jest.fn(),
      validateAndSaveReadings: mockValidateAndSave,
      getTotalPower: jest.fn(() => 1200),
    }));

    render(<PowerDetails {...defaultProps} />);
    
    // Click save button
    fireEvent.click(screen.getByText('Save Readings'));
    
    expect(mockValidateAndSave).toHaveBeenCalledWith(defaultProps.onSave);
  });

  it('updates reading when equipment is selected', async () => {
    const mockUpdateReading = jest.fn();
    mockUsePowerReadings.mockImplementation(() => ({
      readings: [
        {
          equipmentId: '',
          equipmentName: '',
          watts: 0,
          amps: 0,
          voltage: 0,
          timestamp: new Date().toISOString(),
        }
      ],
      fieldErrors: {},
      error: null,
      isLoading: false,
      addReading: jest.fn(),
      updateReading: mockUpdateReading,
      removeReading: jest.fn(),
      validateAndSaveReadings: jest.fn(),
      getTotalPower: jest.fn(() => 0),
    }));

    render(<PowerDetails {...defaultProps} />);
    
    // Open equipment select
    const select = screen.getByLabelText('Equipment');
    fireEvent.mouseDown(select);
    
    // Select an equipment
    const option = screen.getByText('Dehumidifier 1 (max 1500W)');
    fireEvent.click(option);
    
    // Check first call
    expect(mockUpdateReading).toHaveBeenNthCalledWith(1, 0, "equipmentId", "dehu-1");
    // Check second call
    expect(mockUpdateReading).toHaveBeenNthCalledWith(2, 0, "equipmentName", "Dehumidifier 1");
  });
});
