import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MoistureReadingHistory from '@/components/MoistureReadingHistory/MoistureReadingHistory';

// Mock Chart.js to avoid canvas errors in tests
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-chart">Chart</div>,
}));

describe('MoistureReadingHistory', () => {
  const mockInitialReadings = [
    {
      id: 'reading-1',
      position: { x: 100, y: 100 },
      value: 15,
      materialType: 'drywall',
      timestamp: new Date().toISOString(),
      locationDescription: 'North Wall',
    },
    {
      id: 'reading-2',
      position: { x: 200, y: 200 },
      value: 8,
      materialType: 'wood',
      timestamp: new Date().toISOString(),
      locationDescription: 'South Wall',
    },
  ];

  const defaultProps = {
    jobId: '123456',
    initialReadings: mockInitialReadings,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial readings', () => {
    render(<MoistureReadingHistory {...defaultProps} />);
    
    expect(screen.getByText('North Wall')).toBeInTheDocument();
    expect(screen.getByText('South Wall')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText('8%')).toBeInTheDocument();
  });

  it('shows correct status for readings', () => {
    render(<MoistureReadingHistory {...defaultProps} />);
    
    // Drywall reading (15%) is above benchmark (12%)
    expect(screen.getByText('Drying')).toBeInTheDocument();
    
    // Wood reading (8%) is below benchmark (10%)
    expect(screen.getByText('Dry')).toBeInTheDocument();
  });

  it('shows trend dialog when clicking view trend', async () => {
    render(<MoistureReadingHistory {...defaultProps} />);
    
    // Click view trend button for first reading
    const trendButtons = screen.getAllByText('View Trend');
    fireEvent.click(trendButtons[0]);
    
    // Check dialog content
    expect(screen.getByText(/Moisture Level Trend/)).toBeInTheDocument();
    expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
    expect(screen.getByText(/Benchmark for drywall/)).toBeInTheDocument();
  });

  it('calculates overall progress correctly', () => {
    render(<MoistureReadingHistory {...defaultProps} />);
    
    // One out of two readings is dry (50%)
    expect(screen.getByText('50% Dry')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<MoistureReadingHistory jobId="123456" />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows empty state when no readings', () => {
    render(<MoistureReadingHistory jobId="123456" initialReadings={[]} />);
    
    expect(screen.getByText(/No moisture readings recorded yet/)).toBeInTheDocument();
  });

  it('handles reading updates', async () => {
    const mockUpdate = jest.fn();
    render(
      <MoistureReadingHistory
        {...defaultProps}
        onUpdate={mockUpdate}
      />
    );
    
    // Future implementation: Test reading updates
    // This will be implemented when the update functionality is added
  });

  it('shows material benchmarks in trend view', async () => {
    render(<MoistureReadingHistory {...defaultProps} />);
    
    // Click view trend button
    const trendButtons = screen.getAllByText('View Trend');
    fireEvent.click(trendButtons[0]);
    
    // Check for benchmark information
    expect(screen.getByText(/Benchmark for drywall: 12%/)).toBeInTheDocument();
    expect(screen.getByText(/Expected to dry within 5 days/)).toBeInTheDocument();
  });

  it('handles dialog close', () => {
    render(<MoistureReadingHistory {...defaultProps} />);
    
    // Open dialog
    const trendButtons = screen.getAllByText('View Trend');
    fireEvent.click(trendButtons[0]);
    
    // Close dialog
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    // Dialog should be closed
    expect(screen.queryByText(/Moisture Level Trend/)).not.toBeInTheDocument();
  });

  it('displays correct material types', () => {
    render(<MoistureReadingHistory {...defaultProps} />);
    
    expect(screen.getByText('drywall')).toBeInTheDocument();
    expect(screen.getByText('wood')).toBeInTheDocument();
  });

  it('shows table headers', () => {
    render(<MoistureReadingHistory {...defaultProps} />);
    
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Material')).toBeInTheDocument();
    expect(screen.getByText('Reading')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Trend')).toBeInTheDocument();
  });
});
