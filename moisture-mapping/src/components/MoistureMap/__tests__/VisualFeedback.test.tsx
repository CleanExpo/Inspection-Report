import React from 'react';
import { render, screen } from '@testing-library/react';
import { VisualFeedback } from '../VisualFeedback';

describe('VisualFeedback', () => {
    const defaultProps = {
        mode: 'wall' as const,
        isDrawing: false,
        isLoading: false
    };

    it('displays current mode', () => {
        render(<VisualFeedback {...defaultProps} />);
        expect(screen.getByText('Wall Mode')).toBeInTheDocument();
    });

    it('shows drawing indicator when drawing', () => {
        render(<VisualFeedback {...defaultProps} isDrawing={true} />);
        expect(screen.getByText('Drawing wall...')).toBeInTheDocument();
    });

    it('shows loading indicator when loading', () => {
        render(<VisualFeedback {...defaultProps} isLoading={true} />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    describe('validation feedback', () => {
        it('shows error message', () => {
            render(
                <VisualFeedback
                    {...defaultProps}
                    validationError="Invalid operation"
                />
            );
            expect(screen.getByText('Error')).toBeInTheDocument();
            expect(screen.getByText('Invalid operation')).toBeInTheDocument();
        });

        it('shows warning message', () => {
            render(
                <VisualFeedback
                    {...defaultProps}
                    validationWarning="Operation may have issues"
                />
            );
            expect(screen.getByText('Warning')).toBeInTheDocument();
            expect(screen.getByText('Operation may have issues')).toBeInTheDocument();
        });

        it('prioritizes error over warning', () => {
            render(
                <VisualFeedback
                    {...defaultProps}
                    validationError="Error message"
                    validationWarning="Warning message"
                />
            );
            expect(screen.getByText('Error')).toBeInTheDocument();
            expect(screen.getByText('Error message')).toBeInTheDocument();
            expect(screen.queryByText('Warning')).not.toBeInTheDocument();
        });
    });

    describe('mode indicator', () => {
        it('shows different modes correctly', () => {
            const { rerender } = render(<VisualFeedback {...defaultProps} mode="wall" />);
            expect(screen.getByText('Wall Mode')).toBeInTheDocument();

            rerender(<VisualFeedback {...defaultProps} mode="door" />);
            expect(screen.getByText('Door Mode')).toBeInTheDocument();

            rerender(<VisualFeedback {...defaultProps} mode="window" />);
            expect(screen.getByText('Window Mode')).toBeInTheDocument();

            rerender(<VisualFeedback {...defaultProps} mode="reading" />);
            expect(screen.getByText('Reading Mode')).toBeInTheDocument();
        });

        it('changes indicator color based on drawing state', () => {
            const { container, rerender } = render(<VisualFeedback {...defaultProps} isDrawing={false} />);
            const indicator = container.querySelector('div > div'); // Get the inner Box
            expect(indicator).toHaveStyle({ backgroundColor: '#9e9e9e' });

            rerender(<VisualFeedback {...defaultProps} isDrawing={true} />);
            expect(indicator).toHaveStyle({ backgroundColor: '#4caf50' });
        });
    });

    describe('drawing progress', () => {
        it('shows different drawing states', () => {
            const { rerender } = render(
                <VisualFeedback {...defaultProps} mode="wall" isDrawing={true} />
            );
            expect(screen.getByText('Drawing wall...')).toBeInTheDocument();

            rerender(
                <VisualFeedback {...defaultProps} mode="door" isDrawing={true} />
            );
            expect(screen.getByText('Drawing door...')).toBeInTheDocument();

            rerender(
                <VisualFeedback {...defaultProps} mode="window" isDrawing={true} />
            );
            expect(screen.getByText('Drawing window...')).toBeInTheDocument();

            rerender(
                <VisualFeedback {...defaultProps} mode="reading" isDrawing={true} />
            );
            expect(screen.getByText('Drawing reading...')).toBeInTheDocument();
        });
    });
});
