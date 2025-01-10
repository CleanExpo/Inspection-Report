import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GestureTutorial } from '../GestureTutorial';

describe('GestureTutorial', () => {
    const mockOnComplete = jest.fn();

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        jest.clearAllMocks();
        // Mock timers for auto-advance
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('tutorial flow', () => {
        it('shows tutorial steps in sequence', () => {
            render(<GestureTutorial onComplete={mockOnComplete} />);

            // First step
            expect(screen.getByText('Pan')).toBeInTheDocument();
            expect(screen.getByText(/Touch and drag with one finger/)).toBeInTheDocument();

            // Advance to second step
            act(() => {
                jest.advanceTimersByTime(5000);
            });
            expect(screen.getByText('Zoom')).toBeInTheDocument();
            expect(screen.getByText(/Pinch with two fingers/)).toBeInTheDocument();

            // Advance to third step
            act(() => {
                jest.advanceTimersByTime(5000);
            });
            expect(screen.getByText('Rotate')).toBeInTheDocument();
            expect(screen.getByText(/Use two fingers to rotate/)).toBeInTheDocument();

            // Advance to final step
            act(() => {
                jest.advanceTimersByTime(5000);
            });
            expect(screen.getByText('Double Tap')).toBeInTheDocument();
            expect(screen.getByText(/Double tap anywhere/)).toBeInTheDocument();
        });

        it('completes tutorial after all steps', () => {
            render(<GestureTutorial onComplete={mockOnComplete} />);

            // Advance through all steps
            act(() => {
                jest.advanceTimersByTime(20000); // 4 steps * 5000ms
            });

            expect(mockOnComplete).toHaveBeenCalled();
            expect(localStorage.getItem('gestureTutorialCompleted')).toBe('true');
        });

        it('shows progress indicator', () => {
            render(<GestureTutorial onComplete={mockOnComplete} />);

            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toBeInTheDocument();

            // Check step counter
            expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();

            // Advance to second step
            act(() => {
                jest.advanceTimersByTime(5000);
            });
            expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
        });
    });

    describe('user interactions', () => {
        it('can be dismissed with close button', () => {
            render(<GestureTutorial onComplete={mockOnComplete} />);

            const closeButton = screen.getByRole('button', { name: /close tutorial/i });
            fireEvent.click(closeButton);

            expect(mockOnComplete).toHaveBeenCalled();
            expect(localStorage.getItem('gestureTutorialCompleted')).toBe('true');
        });

        it('skips tutorial if previously completed', () => {
            // Mark tutorial as completed
            localStorage.setItem('gestureTutorialCompleted', 'true');

            render(<GestureTutorial onComplete={mockOnComplete} />);

            // Tutorial should not be visible
            expect(screen.queryByText('Pan')).not.toBeInTheDocument();
            expect(mockOnComplete).toHaveBeenCalled();
        });
    });

    describe('accessibility', () => {
        it('has correct ARIA attributes', () => {
            render(<GestureTutorial onComplete={mockOnComplete} />);

            // Check dialog role and label
            const dialog = screen.getByRole('dialog');
            expect(dialog).toHaveAttribute('aria-label', 'Gesture tutorial');

            // Check progress bar
            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toHaveAttribute('aria-label', 'Tutorial progress');

            // Check close button
            const closeButton = screen.getByRole('button', { name: /close tutorial/i });
            expect(closeButton).toBeInTheDocument();
        });

        it('maintains focus management', () => {
            render(<GestureTutorial onComplete={mockOnComplete} />);

            const closeButton = screen.getByRole('button', { name: /close tutorial/i });
            closeButton.focus();
            expect(document.activeElement).toBe(closeButton);
        });
    });

    describe('animations', () => {
        it('applies correct animation for each step', () => {
            render(<GestureTutorial onComplete={mockOnComplete} />);

            // Check pan animation
            let iconContainer = screen.getByRole('dialog').querySelector('.MuiBox-root');
            expect(iconContainer).toHaveStyle({ animation: expect.stringContaining('panAnimation') });

            // Advance to zoom step
            act(() => {
                jest.advanceTimersByTime(5000);
            });
            iconContainer = screen.getByRole('dialog').querySelector('.MuiBox-root');
            expect(iconContainer).toHaveStyle({ animation: expect.stringContaining('pinchAnimation') });

            // Advance to rotate step
            act(() => {
                jest.advanceTimersByTime(5000);
            });
            iconContainer = screen.getByRole('dialog').querySelector('.MuiBox-root');
            expect(iconContainer).toHaveStyle({ animation: expect.stringContaining('rotateAnimation') });

            // Advance to double tap step
            act(() => {
                jest.advanceTimersByTime(5000);
            });
            iconContainer = screen.getByRole('dialog').querySelector('.MuiBox-root');
            expect(iconContainer).toHaveStyle({ animation: expect.stringContaining('tapAnimation') });
        });
    });
});
