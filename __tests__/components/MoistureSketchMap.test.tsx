import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MoistureSketchMap from '@/components/MoistureSketchMap/MoistureSketchMap';

// Mock canvas context
const mockContext = {
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  clearRect: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fillText: jest.fn(),
  strokeStyle: '',
  fillStyle: '',
  globalAlpha: 1,
  font: '',
  textAlign: 'left' as CanvasTextAlign,
  textBaseline: 'alphabetic' as CanvasTextBaseline,
};

// Mock getContext with proper type handling
const getContextMock = jest.fn((contextId: string) => {
  if (contextId === '2d') {
    return mockContext;
  }
  return null;
});

// Apply mock to HTMLCanvasElement
beforeAll(() => {
  // @ts-ignore - Mocking prototype method
  HTMLCanvasElement.prototype.getContext = getContextMock;
  
  // @ts-ignore - Mocking prototype method
  HTMLCanvasElement.prototype.getBoundingClientRect = jest.fn(() => ({
    width: 800,
    height: 600,
    top: 0,
    left: 0,
    right: 800,
    bottom: 600,
    x: 0,
    y: 0,
    toJSON: () => {}
  }));
});

describe('MoistureSketchMap', () => {
  const defaultProps = {
    jobId: '123456',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all tools', () => {
    render(<MoistureSketchMap {...defaultProps} />);
    
    expect(screen.getByText('Draw Damage')).toBeInTheDocument();
    expect(screen.getByText('Measure')).toBeInTheDocument();
    expect(screen.getByText('Add Equipment')).toBeInTheDocument();
    expect(screen.getByText('Add Reading')).toBeInTheDocument();
    expect(screen.getByText('Add Note')).toBeInTheDocument();
    expect(screen.getByText('Set Dimensions')).toBeInTheDocument();
  });

  it('shows dimensions dialog when button clicked', () => {
    render(<MoistureSketchMap {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Set Dimensions'));
    
    expect(screen.getByText('Set Room Dimensions')).toBeInTheDocument();
    expect(screen.getByLabelText('Width')).toBeInTheDocument();
    expect(screen.getByLabelText('Height')).toBeInTheDocument();
  });

  it('shows reading dialog when adding moisture reading', () => {
    render(<MoistureSketchMap {...defaultProps} />);
    
    // Select moisture tool
    fireEvent.click(screen.getByText('Add Reading'));
    
    // Click canvas to add reading
    const canvas = screen.getByRole('presentation');
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    
    expect(screen.getByText('Add Moisture Reading')).toBeInTheDocument();
    expect(screen.getByLabelText('Reading Value')).toBeInTheDocument();
  });

  it('allows material selection', () => {
    render(<MoistureSketchMap {...defaultProps} />);
    
    expect(screen.getByLabelText('Material')).toBeInTheDocument();
  });

  it('saves sketch data when save button clicked', async () => {
    const mockSave = jest.fn().mockResolvedValue(undefined);
    render(<MoistureSketchMap {...defaultProps} onSave={mockSave} />);
    
    fireEvent.click(screen.getByText('Save Sketch'));
    
    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
        room: expect.any(Object),
        damageAreas: expect.any(Array),
        equipment: expect.any(Array),
        measurements: expect.any(Array),
        notes: expect.any(Array),
        moistureReadings: expect.any(Array),
      }));
    });
  });

  it('adds equipment when using equipment tool', () => {
    render(<MoistureSketchMap {...defaultProps} />);
    
    // Select equipment tool
    fireEvent.click(screen.getByText('Add Equipment'));
    
    // Click canvas to add equipment
    const canvas = screen.getByRole('presentation');
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    
    // Equipment should be added at the clicked position
    expect(mockContext.translate).toHaveBeenCalledWith(100, 100);
    expect(mockContext.fillText).toHaveBeenCalled();
  });

  it('draws damage area when using draw tool', () => {
    render(<MoistureSketchMap {...defaultProps} />);
    
    // Select draw tool
    fireEvent.click(screen.getByText('Draw Damage'));
    
    const canvas = screen.getByRole('presentation');
    
    // Start drawing
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    
    // Move mouse
    fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
    fireEvent.mouseMove(canvas, { clientX: 200, clientY: 200 });
    
    // End drawing
    fireEvent.mouseUp(canvas);
    
    // Should have drawn the path
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.moveTo).toHaveBeenCalled();
    expect(mockContext.lineTo).toHaveBeenCalled();
    expect(mockContext.fill).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  it('updates room dimensions when set', async () => {
    render(<MoistureSketchMap {...defaultProps} />);
    
    // Open dimensions dialog
    fireEvent.click(screen.getByText('Set Dimensions'));
    
    // Set dimensions
    fireEvent.change(screen.getByLabelText('Width'), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText('Height'), { target: { value: '15' } });
    
    // Apply dimensions
    fireEvent.click(screen.getByText('Apply'));
    
    // Should redraw with new dimensions
    await waitFor(() => {
      expect(mockContext.clearRect).toHaveBeenCalled();
      expect(mockContext.beginPath).toHaveBeenCalled();
    });
  });

  it('adds moisture reading with correct material type', async () => {
    render(<MoistureSketchMap {...defaultProps} />);
    
    // Select moisture tool
    fireEvent.click(screen.getByText('Add Reading'));
    
    // Select material
    fireEvent.mouseDown(screen.getByLabelText('Material'));
    fireEvent.click(screen.getByText('Drywall'));
    
    // Add reading
    const canvas = screen.getByRole('presentation');
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    
    // Enter reading value
    fireEvent.change(screen.getByLabelText('Reading Value'), { target: { value: '15' } });
    
    // Save reading
    fireEvent.click(screen.getByText('Add Reading'));
    
    // Should draw reading indicator
    await waitFor(() => {
      expect(mockContext.arc).toHaveBeenCalled();
      expect(mockContext.fillText).toHaveBeenCalledWith('15', expect.any(Number), expect.any(Number));
    });
  });

  it('handles keyboard shortcuts', () => {
    render(<MoistureSketchMap {...defaultProps} />);
    
    // Simulate Ctrl+S
    fireEvent.keyDown(document, { key: 's', ctrlKey: true });
    
    // Should trigger save
    expect(screen.getByText('Save Sketch')).toHaveAttribute('disabled', '');
  });
});
