import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, IconButton, LinearProgress, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import GestureIcon from '@mui/icons-material/Gesture';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import { 
    panAnimation, 
    pinchAnimation, 
    rotateAnimation, 
    tapAnimation, 
    tutorialStepAnimation 
} from './tutorialAnimations';

interface GestureTutorialProps {
    onComplete: () => void;
    className?: string;
}

interface TutorialStep {
    title: string;
    description: string;
    icon: React.ReactNode;
    animation: typeof panAnimation;
}

const AnimatedBox = styled(Box)`
    animation: ${tutorialStepAnimation} 0.3s ease-out;
`;

const AnimatedIconBox = styled(Box)<{ animation: typeof panAnimation }>`
    animation: ${props => props.animation} 2s infinite;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: ${props => props.theme.palette.primary.main};
    color: ${props => props.theme.palette.primary.contrastText};
`;

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        title: 'Pan',
        description: 'Touch and drag with one finger to move around the map',
        icon: <GestureIcon />,
        animation: panAnimation
    },
    {
        title: 'Zoom',
        description: 'Pinch with two fingers to zoom in and out',
        icon: <ZoomInIcon />,
        animation: pinchAnimation
    },
    {
        title: 'Rotate',
        description: 'Use two fingers to rotate the view',
        icon: <RotateRightIcon />,
        animation: rotateAnimation
    },
    {
        title: 'Double Tap',
        description: 'Double tap anywhere to reset the view',
        icon: <TouchAppIcon />,
        animation: tapAnimation
    }
];

export const GestureTutorial: React.FC<GestureTutorialProps> = ({
    onComplete,
    className
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [dismissed, setDismissed] = useState(false);

    // Auto-advance tutorial steps
    useEffect(() => {
        if (dismissed) return;

        const timer = setInterval(() => {
            if (currentStep < TUTORIAL_STEPS.length - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                setDismissed(true);
                onComplete();
            }
        }, 5000); // Show each step for 5 seconds

        return () => clearInterval(timer);
    }, [currentStep, dismissed, onComplete]);

    // Check if tutorial has been completed before
    useEffect(() => {
        const tutorialCompleted = localStorage.getItem('gestureTutorialCompleted');
        if (tutorialCompleted) {
            setDismissed(true);
        }
    }, []);

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem('gestureTutorialCompleted', 'true');
        onComplete();
    };

    if (dismissed) return null;

    const currentTutorial = TUTORIAL_STEPS[currentStep];
    const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

    return (
        <Paper
            elevation={3}
            className={className}
            sx={{
                position: 'absolute',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'auto',
                maxWidth: '90%',
                minWidth: 300,
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 2,
                zIndex: 1000
            }}
            role="dialog"
            aria-label="Gesture tutorial"
        >
            <AnimatedBox sx={{ position: 'relative' }}>
                <IconButton
                    onClick={handleDismiss}
                    sx={{ position: 'absolute', right: -8, top: -8 }}
                    aria-label="Close tutorial"
                >
                    <CloseIcon />
                </IconButton>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 1
                    }}
                >
                    <AnimatedIconBox animation={currentTutorial.animation}>
                        {currentTutorial.icon}
                    </AnimatedIconBox>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                            {currentTutorial.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {currentTutorial.description}
                        </Typography>
                    </Box>
                </Box>

                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ mt: 2 }}
                    aria-label="Tutorial progress"
                />
                <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                    Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                </Typography>
            </AnimatedBox>
        </Paper>
    );
};
