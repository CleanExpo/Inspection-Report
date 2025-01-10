import React from 'react';
import { render, screen } from '@testing-library/react';
import { TouchFeedback } from '../TouchFeedback';
import { Point2D } from '../../../types/canvas';

describe('TouchFeedback', () => {
    const defaultProps = {
        scale: 1,
        rotation: 0,
        touchPoints: [],
        isGesturing: false
    };

    let mockContext: {
        clearRect: jest.Mock;
        beginPath: jest.Mock;
        arc: jest.Mock;
        stroke: jest.Mock;
        moveTo: jest.Mock;
        lineTo: jest.Mock;
        fill: jest.Mock;
    };

    beforeEach(() => {
        // Mock canvas context
        mockContext = {
            clearRect: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            stroke: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            fill: jest.fn()
        };

        // Mock getContext
        const getContextMock = jest.fn().mockReturnValue(mockContext);
        HTMLCanvasElement.prototype.getContext = getContextMock;

        // Mock requestAnimationFrame
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
            cb(1000); // Mock timestamp
            return 1;
        });
    });

    afterEach(() => {
        (window.requestAnimationFrame as jest.Mock).mockRestore();
        jest.clearAllMocks();
    });

    describe('touch point visualization', () => {
        it('draws ripple effect for single touch point', () => {
            render(
                <TouchFeedback
                    {...defaultProps}
                    touchPoints={[{ x: 100, y: 100 }]}
                    isGesturing={true}
                />
            );

            expect(mockContext.beginPath).toHaveBeenCalled();
            expect(mockContext.arc).toHaveBeenCalledWith(
                100, 100, // center
                expect.any(Number), // radius
                0, Math.PI * 2 // full circle
            );
            expect(mockContext.stroke).toHaveBeenCalled();
        });

        it('draws gesture guides for multiple touch points', () => {
            const touchPoints: Point2D[] = [
                { x: 100, y: 100 },
                { x: 200, y: 200 }
            ];

            render(
                <TouchFeedback
                    {...defaultProps}
                    touchPoints={touchPoints}
                    isGesturing={true}
                />
            );

            // Should draw line between points
            expect(mockContext.moveTo).toHaveBeenCalledWith(100, 100);
            expect(mockContext.lineTo).toHaveBeenCalledWith(200, 200);

            // Should draw center point
            expect(mockContext.arc).toHaveBeenCalledWith(
                150, 150, // center point
                5, // radius
                0, Math.PI * 2 // full circle
            );
        });

        it('cleans up animations when unmounting', () => {
            const { unmount } = render(
                <TouchFeedback
                    {...defaultProps}
                    touchPoints={[{ x: 100, y: 100 }]}
                    isGesturing={true}
                />
            );

            unmount();

            expect(mockContext.clearRect).toHaveBeenCalled();
        });
    });

    describe('transform state display', () => {
        it('shows scale and rotation during gestures', () => {
            render(
                <TouchFeedback
                    {...defaultProps}
                    scale={2}
                    rotation={Math.PI / 4}
                    isGesturing={true}
                />
            );

            expect(screen.getByText('Scale: 2.00x')).toBeInTheDocument();
            expect(screen.getByText('Rotation: 45.0°')).toBeInTheDocument();
        });

        it('hides transform state when not gesturing', () => {
            render(
                <TouchFeedback
                    {...defaultProps}
                    scale={2}
                    rotation={Math.PI / 4}
                    isGesturing={false}
                />
            );

            expect(screen.queryByText('Scale:')).not.toBeInTheDocument();
            expect(screen.queryByText('Rotation:')).not.toBeInTheDocument();
        });
    });

    describe('double tap hint', () => {
        it('shows hint when view is transformed', () => {
            render(
                <TouchFeedback
                    {...defaultProps}
                    scale={2}
                    rotation={0}
                    isGesturing={false}
                />
            );

            expect(screen.getByText('Double tap to reset view')).toBeInTheDocument();
        });

        it('hides hint during gestures', () => {
            render(
                <TouchFeedback
                    {...defaultProps}
                    scale={2}
                    rotation={0}
                    isGesturing={true}
                />
            );

            expect(screen.queryByText('Double tap to reset view')).not.toBeInTheDocument();
        });

        it('hides hint when view is not transformed', () => {
            render(
                <TouchFeedback
                    {...defaultProps}
                    scale={1}
                    rotation={0}
                    isGesturing={false}
                />
            );

            expect(screen.queryByText('Double tap to reset view')).not.toBeInTheDocument();
        });
    });

    describe('canvas setup', () => {
        it('sets canvas size to match container', () => {
            const { container } = render(
                <TouchFeedback {...defaultProps} />
            );

            const canvas = container.querySelector('canvas');
            expect(canvas).toHaveStyle({
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none'
            });
        });

        it('applies custom className', () => {
            const { container } = render(
                <TouchFeedback {...defaultProps} className="custom-class" />
            );

            const canvas = container.querySelector('canvas');
            expect(canvas).toHaveClass('custom-class');
        });
    });
});
