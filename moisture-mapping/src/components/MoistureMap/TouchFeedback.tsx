import React, { useEffect, useRef } from 'react';
import { Point2D } from '../../types/canvas';

interface TouchFeedbackProps {
    scale: number;
    rotation: number;
    touchPoints: Point2D[];
    isGesturing: boolean;
    className?: string;
}

export const TouchFeedback: React.FC<TouchFeedbackProps> = ({
    scale,
    rotation,
    touchPoints,
    isGesturing,
    className
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Draw touch feedback
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw touch points
        touchPoints.forEach(point => {
            // Ripple effect
            const ripple = (timestamp: number) => {
                ctx.clearRect(point.x - 50, point.y - 50, 100, 100);
                
                const progress = (timestamp % 1000) / 1000;
                const radius = 20 + progress * 30;
                const opacity = 1 - progress;

                ctx.beginPath();
                ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(76, 175, 80, ${opacity})`;
                ctx.lineWidth = 2;
                ctx.stroke();

                if (isGesturing) {
                    requestAnimationFrame(ripple);
                }
            };

            requestAnimationFrame(ripple);
        });

        // Draw gesture guides if multiple touch points
        if (touchPoints.length > 1) {
            // Connect touch points
            ctx.beginPath();
            ctx.moveTo(touchPoints[0].x, touchPoints[0].y);
            ctx.lineTo(touchPoints[1].x, touchPoints[1].y);
            ctx.strokeStyle = 'rgba(76, 175, 80, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw center point
            const center = {
                x: (touchPoints[0].x + touchPoints[1].x) / 2,
                y: (touchPoints[0].y + touchPoints[1].y) / 2
            };
            ctx.beginPath();
            ctx.arc(center.x, center.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(76, 175, 80, 0.8)';
            ctx.fill();
        }

        return () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
    }, [touchPoints, isGesturing]);

    return (
        <>
            <canvas
                ref={canvasRef}
                className={className}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none'
                }}
            />
            {/* Transform state indicator */}
            {isGesturing && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '8px 16px',
                        borderRadius: 20,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16
                    }}
                >
                    <div>
                        Scale: {scale.toFixed(2)}x
                    </div>
                    <div>
                        Rotation: {(rotation * 180 / Math.PI).toFixed(1)}°
                    </div>
                </div>
            )}
            {/* Double tap hint */}
            {(scale !== 1 || rotation !== 0) && !isGesturing && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '8px 16px',
                        borderRadius: 20,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        fontSize: 14,
                        opacity: 0.7
                    }}
                >
                    Double tap to reset view
                </div>
            )}
        </>
    );
};
