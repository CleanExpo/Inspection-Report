import React, { useEffect, useRef } from 'react';
import { Point2D } from '../../types/canvas';
import { motion, AnimatePresence } from 'framer-motion';

interface TouchFeedbackAnimationProps {
    touchPoints: Point2D[];
    isGesturing: boolean;
    scale: number;
    rotation: number;
    className?: string;
}

interface TouchTrail {
    id: number;
    points: Point2D[];
    timestamp: number;
}

export const TouchFeedbackAnimation: React.FC<TouchFeedbackAnimationProps> = ({
    touchPoints,
    isGesturing,
    scale,
    rotation,
    className
}) => {
    const trailsRef = useRef<TouchTrail[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lastPointsRef = useRef<Point2D[]>([]);

    // Update touch trails
    useEffect(() => {
        if (touchPoints.length === 0) {
            trailsRef.current = [];
            return;
        }

        const now = Date.now();
        
        // Update existing trails or create new ones
        touchPoints.forEach((point, index) => {
            const existingTrail = trailsRef.current.find(t => 
                lastPointsRef.current[index] && 
                Math.abs(t.points[t.points.length - 1].x - lastPointsRef.current[index].x) < 20 &&
                Math.abs(t.points[t.points.length - 1].y - lastPointsRef.current[index].y) < 20
            );

            if (existingTrail) {
                existingTrail.points.push(point);
                existingTrail.timestamp = now;
            } else {
                trailsRef.current.push({
                    id: now + index,
                    points: [point],
                    timestamp: now
                });
            }
        });

        // Remove old trails
        trailsRef.current = trailsRef.current.filter(
            trail => now - trail.timestamp < 500
        );

        lastPointsRef.current = touchPoints;

        // Draw trails
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        trailsRef.current.forEach(trail => {
            if (trail.points.length < 2) return;

            ctx.beginPath();
            ctx.moveTo(trail.points[0].x, trail.points[0].y);

            // Create smooth curve through points
            for (let i = 1; i < trail.points.length - 1; i++) {
                const xc = (trail.points[i].x + trail.points[i + 1].x) / 2;
                const yc = (trail.points[i].y + trail.points[i + 1].y) / 2;
                ctx.quadraticCurveTo(
                    trail.points[i].x,
                    trail.points[i].y,
                    xc,
                    yc
                );
            }

            // Connect to last point
            if (trail.points.length > 1) {
                ctx.lineTo(
                    trail.points[trail.points.length - 1].x,
                    trail.points[trail.points.length - 1].y
                );
            }

            // Style based on age
            const age = now - trail.timestamp;
            const alpha = Math.max(0, 1 - age / 500);
            ctx.strokeStyle = `rgba(66, 135, 245, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        });
    }, [touchPoints]);

    return (
        <>
            <canvas
                ref={canvasRef}
                className={className}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none',
                    zIndex: 10
                }}
                width={window.innerWidth}
                height={window.innerHeight}
            />
            <AnimatePresence>
                {touchPoints.map((point, index) => (
                    <motion.div
                        key={`touch-${index}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.5 }}
                        exit={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: 'absolute',
                            top: point.y - 15,
                            left: point.x - 15,
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(66, 135, 245, 0.3)',
                            border: '2px solid rgba(66, 135, 245, 0.5)',
                            pointerEvents: 'none',
                            zIndex: 9
                        }}
                    />
                ))}
            </AnimatePresence>
            {isGesturing && (
                <motion.div
                    initial={false}
                    animate={{
                        scale: [1, scale],
                        rotate: rotation * (180 / Math.PI),
                    }}
                    transition={{ duration: 0.2 }}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        border: '2px dashed rgba(66, 135, 245, 0.5)',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        zIndex: 8
                    }}
                />
            )}
            {touchPoints.length === 2 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'absolute',
                        top: (touchPoints[0].y + touchPoints[1].y) / 2 - 1,
                        left: (touchPoints[0].x + touchPoints[1].x) / 2 - 1,
                        width: 2,
                        height: 2,
                        backgroundColor: 'rgba(66, 135, 245, 0.8)',
                        borderRadius: '50%',
                        pointerEvents: 'none',
                        zIndex: 11
                    }}
                />
            )}
        </>
    );
};
