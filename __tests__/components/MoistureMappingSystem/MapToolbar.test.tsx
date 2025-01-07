import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { MapToolbar, DrawingMode } from '../../../app/components/MoistureMappingSystem/MapToolbar';

describe('MapToolbar', () => {
  const mockOnModeChange = jest.fn();
  const mockOnUndo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all drawing mode buttons', () => {
    render(
      <MapToolbar
        mode="wall"
        onModeChange={mockOnModeChange}
      />
    );

    expect(screen.getByTitle('Draw Walls')).toBeInTheDocument();
    expect(screen.getByTitle('Place Doors')).toBeInTheDocument();
    expect(screen.getByTitle('Place Windows')).toBeInTheDocument();
    expect(screen.getByTitle('Add Moisture Reading')).toBeInTheDocument();
  });

  it('highlights the active mode button', () => {
    const modes: DrawingMode[] = ['wall', 'door', 'window', 'reading'];

    const { rerender } = render(
      <MapToolbar
        mode="wall"
        onModeChange={mockOnModeChange}
      />
    );

    // Test each mode
    modes.forEach(mode => {
      rerender(
        <MapToolbar
          mode={mode}
          onModeChange={mockOnModeChange}
        />
      );

      const activeButton = screen.getByTitle(
        mode === 'wall' ? 'Draw Walls' :
        mode === 'door' ? 'Place Doors' :
        mode === 'window' ? 'Place Windows' :
        'Add Moisture Reading'
      );

      expect(activeButton).toHaveClass('bg-blue-100', 'text-blue-700');
    });
  });

  it('calls onModeChange when clicking mode buttons', () => {
    render(
      <MapToolbar
        mode="wall"
        onModeChange={mockOnModeChange}
      />
    );

    // Test clicking each mode button
    fireEvent.click(screen.getByTitle('Place Doors'));
    expect(mockOnModeChange).toHaveBeenCalledWith('door');

    fireEvent.click(screen.getByTitle('Place Windows'));
    expect(mockOnModeChange).toHaveBeenCalledWith('window');

    fireEvent.click(screen.getByTitle('Add Moisture Reading'));
    expect(mockOnModeChange).toHaveBeenCalledWith('reading');

    fireEvent.click(screen.getByTitle('Draw Walls'));
    expect(mockOnModeChange).toHaveBeenCalledWith('wall');
  });

  it('renders undo button when onUndo is provided', () => {
    render(
      <MapToolbar
        mode="wall"
        onModeChange={mockOnModeChange}
        onUndo={mockOnUndo}
      />
    );

    expect(screen.getByTitle('Undo')).toBeInTheDocument();
  });

  it('calls onUndo when clicking undo button', () => {
    render(
      <MapToolbar
        mode="wall"
        onModeChange={mockOnModeChange}
        onUndo={mockOnUndo}
        canUndo={true}
      />
    );

    fireEvent.click(screen.getByTitle('Undo'));
    expect(mockOnUndo).toHaveBeenCalled();
  });

  it('disables undo button when canUndo is false', () => {
    render(
      <MapToolbar
        mode="wall"
        onModeChange={mockOnModeChange}
        onUndo={mockOnUndo}
        canUndo={false}
      />
    );

    expect(screen.getByTitle('Undo')).toBeDisabled();
  });

  it('disables all buttons when readOnly is true', () => {
    render(
      <MapToolbar
        mode="wall"
        onModeChange={mockOnModeChange}
        onUndo={mockOnUndo}
        canUndo={true}
        readOnly={true}
      />
    );

    expect(screen.getByTitle('Draw Walls')).toBeDisabled();
    expect(screen.getByTitle('Place Doors')).toBeDisabled();
    expect(screen.getByTitle('Place Windows')).toBeDisabled();
    expect(screen.getByTitle('Add Moisture Reading')).toBeDisabled();
    expect(screen.getByTitle('Undo')).toBeDisabled();
  });

  it('applies correct styles to buttons', () => {
    render(
      <MapToolbar
        mode="wall"
        onModeChange={mockOnModeChange}
        onUndo={mockOnUndo}
        canUndo={true}
      />
    );

    // Active button should have blue background
    const activeButton = screen.getByTitle('Draw Walls');
    expect(activeButton).toHaveClass('bg-blue-100', 'text-blue-700');

    // Inactive buttons should have gray text and hover styles
    const inactiveButton = screen.getByTitle('Place Doors');
    expect(inactiveButton).toHaveClass('text-gray-700', 'hover:bg-gray-100');

    // Undo button should have consistent styling
    const undoButton = screen.getByTitle('Undo');
    expect(undoButton).toHaveClass(
      'text-gray-700',
      'hover:bg-gray-100',
      'transition-colors'
    );
  });
});
