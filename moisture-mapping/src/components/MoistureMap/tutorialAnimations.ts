import { keyframes } from '@mui/material/styles';

export const panAnimation = keyframes`
    0% {
        transform: translate(0, 0);
        opacity: 0.8;
    }
    25% {
        opacity: 1;
    }
    50% {
        transform: translate(50px, 20px);
        opacity: 1;
    }
    75% {
        opacity: 1;
    }
    100% {
        transform: translate(0, 0);
        opacity: 0.8;
    }
`;

export const pinchAnimation = keyframes`
    0% {
        transform: scale(1) rotate(0deg);
        opacity: 0.8;
    }
    25% {
        opacity: 1;
    }
    50% {
        transform: scale(1.5) rotate(5deg);
        opacity: 1;
    }
    75% {
        opacity: 1;
    }
    100% {
        transform: scale(1) rotate(0deg);
        opacity: 0.8;
    }
`;

export const rotateAnimation = keyframes`
    0% {
        transform: rotate(0deg);
        opacity: 0.8;
    }
    25% {
        opacity: 1;
    }
    50% {
        transform: rotate(45deg);
        opacity: 1;
    }
    75% {
        opacity: 1;
    }
    100% {
        transform: rotate(0deg);
        opacity: 0.8;
    }
`;

export const tapAnimation = keyframes`
    0% {
        transform: scale(1);
        opacity: 1;
    }
    25% {
        transform: scale(0.8);
        opacity: 0.8;
    }
    50% {
        transform: scale(1);
        opacity: 1;
    }
    75% {
        transform: scale(0.8);
        opacity: 0.8;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
`;

export const fingerIndicator = keyframes`
    0% {
        box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
    }
`;

export const tutorialStepAnimation = keyframes`
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
`;

export const tutorialOverlayAnimation = keyframes`
    0% {
        background-color: rgba(0, 0, 0, 0);
    }
    100% {
        background-color: rgba(0, 0, 0, 0.5);
    }
`;
