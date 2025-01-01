import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import VoiceControl from '@/components/VoiceControl/VoiceControl';
import { voiceCommandManager } from '@/utils/voiceCommands';

interface MockSpeechRecognition {
  start: jest.Mock;
  stop: jest.Mock;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  continuous: boolean;
  interimResults: boolean;
}

// Mock the SpeechRecognition API
const mockSpeechRecognition: MockSpeechRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onresult: null,
  onerror: null,
  continuous: true,
  interimResults: true,
};

const mockSpeechSynthesis = {
  speak: jest.fn(),
};

// Mock window objects
Object.defineProperty(window, 'SpeechRecognition', {
  value: jest.fn().mockImplementation(() => mockSpeechRecognition),
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: jest.fn().mockImplementation(() => mockSpeechRecognition),
});

Object.defineProperty(window, 'speechSynthesis', {
  value: mockSpeechSynthesis,
});

describe('VoiceControl', () => {
  const mockProps = {
    onAddReading: jest.fn(),
    onStartDrawing: jest.fn(),
    onStopDrawing: jest.fn(),
    onAddEquipment: jest.fn(),
    onMeasure: jest.fn(),
    onUndo: jest.fn(),
    onSave: jest.fn(),
    onCancel: jest.fn(),
    onSwitchTool: jest.fn(),
    onSetMaterial: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset event handlers
    mockSpeechRecognition.onresult = null;
    mockSpeechRecognition.onerror = null;
  });

  it('renders voice control buttons', () => {
    render(<VoiceControl {...mockProps} />);
    
    expect(screen.getByRole('button', { name: /start voice control/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show voice commands/i })).toBeInTheDocument();
  });

  it('toggles voice recognition on button click', () => {
    render(<VoiceControl {...mockProps} />);
    
    const toggleButton = screen.getByRole('button', { name: /start voice control/i });
    
    // Start listening
    fireEvent.click(toggleButton);
    expect(mockSpeechRecognition.start).toHaveBeenCalled();
    
    // Stop listening
    fireEvent.click(toggleButton);
    expect(mockSpeechRecognition.stop).toHaveBeenCalled();
  });

  it('shows help panel when help button is clicked', () => {
    render(<VoiceControl {...mockProps} />);
    
    const helpButton = screen.getByRole('button', { name: /show voice commands/i });
    fireEvent.click(helpButton);
    
    expect(screen.getByText('Available Voice Commands:')).toBeInTheDocument();
    expect(screen.getByText(/start drawing/i)).toBeInTheDocument();
    expect(screen.getByText(/add reading/i)).toBeInTheDocument();
  });

  it('processes voice commands correctly', () => {
    render(<VoiceControl {...mockProps} />);
    
    // Simulate voice command
    act(() => {
      if (mockSpeechRecognition.onresult) {
        const recognitionEvent = new Event('result');
        Object.defineProperty(recognitionEvent, 'results', {
          value: {
            0: {
              0: {
                transcript: 'start drawing',
                confidence: 0.9,
              },
              isFinal: true,
              length: 1,
            },
            length: 1,
          },
        });
        mockSpeechRecognition.onresult(recognitionEvent);
      }
    });
    
    expect(mockProps.onStartDrawing).toHaveBeenCalled();
  });

  it('handles reading input commands', () => {
    render(<VoiceControl {...mockProps} />);
    
    // Simulate voice command for reading
    act(() => {
      if (mockSpeechRecognition.onresult) {
        const recognitionEvent = new Event('result');
        Object.defineProperty(recognitionEvent, 'results', {
          value: {
            0: {
              0: {
                transcript: 'add reading of 15',
                confidence: 0.9,
              },
              isFinal: true,
              length: 1,
            },
            length: 1,
          },
        });
        mockSpeechRecognition.onresult(recognitionEvent);
      }
    });
    
    expect(mockProps.onAddReading).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 15,
      })
    );
  });

  it('handles material change commands', () => {
    render(<VoiceControl {...mockProps} />);
    
    // Simulate voice command for material change
    act(() => {
      if (mockSpeechRecognition.onresult) {
        const recognitionEvent = new Event('result');
        Object.defineProperty(recognitionEvent, 'results', {
          value: {
            0: {
              0: {
                transcript: 'set material to concrete',
                confidence: 0.9,
              },
              isFinal: true,
              length: 1,
            },
            length: 1,
          },
        });
        mockSpeechRecognition.onresult(recognitionEvent);
      }
    });
    
    expect(mockProps.onSetMaterial).toHaveBeenCalledWith('concrete');
  });

  it('provides feedback for unrecognized commands', () => {
    render(<VoiceControl {...mockProps} />);
    
    // Simulate unrecognized voice command
    act(() => {
      if (mockSpeechRecognition.onresult) {
        const recognitionEvent = new Event('result');
        Object.defineProperty(recognitionEvent, 'results', {
          value: {
            0: {
              0: {
                transcript: 'invalid command',
                confidence: 0.9,
              },
              isFinal: true,
              length: 1,
            },
            length: 1,
          },
        });
        mockSpeechRecognition.onresult(recognitionEvent);
      }
    });
    
    expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    expect(mockSpeechSynthesis.speak.mock.calls[0][0].text).toContain('not recognized');
  });

  it('handles speech recognition errors', () => {
    render(<VoiceControl {...mockProps} />);
    
    // Simulate error
    act(() => {
      if (mockSpeechRecognition.onerror) {
        const errorEvent = new Event('error');
        Object.defineProperty(errorEvent, 'error', {
          value: 'no-speech',
        });
        mockSpeechRecognition.onerror(errorEvent);
      }
    });
    
    expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    expect(mockSpeechSynthesis.speak.mock.calls[0][0].text).toContain('error');
  });

  it('cleans up speech recognition on unmount', () => {
    const { unmount } = render(<VoiceControl {...mockProps} />);
    
    // Start listening
    const toggleButton = screen.getByRole('button', { name: /start voice control/i });
    fireEvent.click(toggleButton);
    
    // Unmount
    unmount();
    
    expect(mockSpeechRecognition.stop).toHaveBeenCalled();
  });

  describe('Command Processing', () => {
    it('processes drawing commands', () => {
      render(<VoiceControl {...mockProps} />);
      
      // Test start drawing
      act(() => {
        voiceCommandManager['processCommand']('start drawing');
      });
      expect(mockProps.onStartDrawing).toHaveBeenCalled();
      
      // Test stop drawing
      act(() => {
        voiceCommandManager['processCommand']('stop drawing');
      });
      expect(mockProps.onStopDrawing).toHaveBeenCalled();
    });

    it('processes equipment commands', () => {
      render(<VoiceControl {...mockProps} />);
      
      act(() => {
        voiceCommandManager['processCommand']('add equipment');
      });
      expect(mockProps.onAddEquipment).toHaveBeenCalled();
    });

    it('processes measurement commands', () => {
      render(<VoiceControl {...mockProps} />);
      
      act(() => {
        voiceCommandManager['processCommand']('start measure');
      });
      expect(mockProps.onMeasure).toHaveBeenCalled();
    });

    it('processes undo command', () => {
      render(<VoiceControl {...mockProps} />);
      
      act(() => {
        voiceCommandManager['processCommand']('undo');
      });
      expect(mockProps.onUndo).toHaveBeenCalled();
    });
  });
});
