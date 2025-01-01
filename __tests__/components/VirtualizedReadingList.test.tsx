import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import VirtualizedReadingList from '@/components/MoistureReadingHistory/VirtualizedReadingList';
import { MoistureReading } from '@/types/moisture';

describe('VirtualizedReadingList', () => {
  // Mock readings data
  const generateMockReadings = (count: number): MoistureReading[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `reading-${i}`,
      position: { x: 100, y: 100 },
      value: 15 + (i % 10),
      materialType: i % 2 === 0 ? 'drywall' : 'wood',
      timestamp: new Date().toISOString(),
      locationDescription: `Location ${i + 1}`,
    }));
  };

  const mockGetReadingStatus = (reading: MoistureReading) => {
    if (reading.value <= 12) return 'dry';
    if (reading.value <= 15) return 'drying';
    return 'concern';
  };

  const defaultProps = {
    readings: generateMockReadings(100),
    getReadingStatus: mockGetReadingStatus,
    onViewTrend: jest.fn(),
  };

  const createMockDOMRect = (dimensions: {
    width: number;
    height: number;
    top?: number;
    left?: number;
  }): DOMRect => {
    const rect = {
      width: dimensions.width,
      height: dimensions.height,
      top: dimensions.top || 0,
      left: dimensions.left || 0,
      right: (dimensions.left || 0) + dimensions.width,
      bottom: (dimensions.top || 0) + dimensions.height,
      x: dimensions.left || 0,
      y: dimensions.top || 0,
      toJSON: () => rect,
    };
    return rect as DOMRect;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock element dimensions since they're used for virtualization
    Element.prototype.getBoundingClientRect = jest.fn(() => 
      createMockDOMRect({
        width: 800,
        height: 400,
      })
    );
  });

  it('renders initial visible items', () => {
    render(<VirtualizedReadingList {...defaultProps} />);
    
    // Check if first few items are rendered
    expect(screen.getByText('Location 1')).toBeInTheDocument();
    expect(screen.getByText('Location 2')).toBeInTheDocument();
    expect(screen.getByText('Location 3')).toBeInTheDocument();
  });

  it('shows loading indicator for large datasets', () => {
    const manyReadings = generateMockReadings(1500);
    render(
      <VirtualizedReadingList
        {...defaultProps}
        readings={manyReadings}
      />
    );
    
    expect(screen.getByText(/Showing 1-/)).toBeInTheDocument();
    expect(screen.getByText(/of 1500 readings/)).toBeInTheDocument();
  });

  it('handles scroll events', async () => {
    const { container } = render(<VirtualizedReadingList {...defaultProps} />);
    
    // Get the scrollable container
    const virtualList = container.firstChild as HTMLElement;
    
    // Simulate scroll
    await act(async () => {
      fireEvent.scroll(virtualList, { target: { scrollTop: 500 } });
    });
    
    // Check if items further down are rendered
    // Exact indices depend on item height and container size
    expect(screen.queryByText('Location 1')).not.toBeInTheDocument();
    expect(screen.getByText(/Location \d+/)).toBeInTheDocument();
  });

  it('calls onViewTrend when trend button is clicked', () => {
    render(<VirtualizedReadingList {...defaultProps} />);
    
    const trendButtons = screen.getAllByText('View Trend');
    fireEvent.click(trendButtons[0]);
    
    expect(defaultProps.onViewTrend).toHaveBeenCalledWith('reading-0');
  });

  it('displays correct status chips', () => {
    render(<VirtualizedReadingList {...defaultProps} />);
    
    // Check status chips are rendered with correct status
    expect(screen.getAllByText('Concern')).toHaveLength(expect.any(Number));
    expect(screen.getAllByText('Drying')).toHaveLength(expect.any(Number));
    expect(screen.getAllByText('Dry')).toHaveLength(expect.any(Number));
  });

  it('handles window resize', async () => {
    render(<VirtualizedReadingList {...defaultProps} />);
    
    // Simulate window resize
    await act(async () => {
      // Change mock dimensions
      Element.prototype.getBoundingClientRect = jest.fn(() =>
        createMockDOMRect({
          width: 400,
          height: 300,
        })
      );
      
      // Trigger resize event
      global.dispatchEvent(new Event('resize'));
    });
    
    // Wait for debounced resize handler
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Component should still be functional
    expect(screen.getByText('Location 1')).toBeInTheDocument();
  });

  it('maintains scroll position when data updates', () => {
    const { rerender } = render(<VirtualizedReadingList {...defaultProps} />);
    
    // Get initial rendered items
    const initialItems = screen.getAllByText(/Location \d+/);
    
    // Update readings prop
    const updatedReadings = [
      ...defaultProps.readings,
      ...generateMockReadings(5).map(r => ({
        ...r,
        id: `new-${r.id}`,
      })),
    ];
    
    rerender(
      <VirtualizedReadingList
        {...defaultProps}
        readings={updatedReadings}
      />
    );
    
    // Check that initially visible items are still visible
    initialItems.forEach(item => {
      expect(screen.getByText(item.textContent || '')).toBeInTheDocument();
    });
  });

  it('handles empty readings array', () => {
    render(
      <VirtualizedReadingList
        {...defaultProps}
        readings={[]}
      />
    );
    
    // Should render empty container without errors
    expect(screen.queryByText(/Location/)).not.toBeInTheDocument();
  });

  // Test accessibility
  it('meets accessibility requirements', () => {
    const { container } = render(<VirtualizedReadingList {...defaultProps} />);
    
    // Check that status chips have appropriate ARIA labels
    const chips = screen.getAllByText(/(Dry|Drying|Concern)/);
    chips.forEach(chip => {
      expect(chip).toHaveAttribute('role', 'status');
    });
    
    // Check that trend buttons are keyboard accessible
    const trendButtons = screen.getAllByText('View Trend');
    trendButtons.forEach(button => {
      expect(button).toHaveAttribute('tabindex', '0');
    });
  });
});
