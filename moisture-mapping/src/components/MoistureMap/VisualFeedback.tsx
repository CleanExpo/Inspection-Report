import React from 'react';
import { Box, CircularProgress, Alert, AlertTitle, Snackbar } from '@mui/material';
import { DrawingMode } from '../../types/canvas';

interface VisualFeedbackProps {
    mode: DrawingMode;
    isDrawing: boolean;
    isLoading: boolean;
    validationError?: string;
    validationWarning?: string;
    onValidationClose?: () => void;
}

export const VisualFeedback: React.FC<VisualFeedbackProps> = ({
    mode,
    isDrawing,
    isLoading,
    validationError,
    validationWarning,
    onValidationClose
}) => {
    return (
        <>
            {/* Mode indicator */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    padding: 1,
                    borderRadius: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                <Box
                    sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: isDrawing ? '#4caf50' : '#9e9e9e'
                    }}
                />
                {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
            </Box>

            {/* Loading indicator */}
            {isLoading && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    <CircularProgress />
                    <Box sx={{ color: 'text.secondary' }}>Loading...</Box>
                </Box>
            )}

            {/* Drawing progress indicator */}
            {isDrawing && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: 1,
                        borderRadius: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        boxShadow: 1
                    }}
                >
                    Drawing {mode}...
                </Box>
            )}

            {/* Error feedback */}
            <Snackbar
                open={Boolean(validationError)}
                autoHideDuration={6000}
                onClose={onValidationClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="error" onClose={onValidationClose}>
                    <AlertTitle>Error</AlertTitle>
                    {validationError}
                </Alert>
            </Snackbar>

            {/* Warning feedback */}
            <Snackbar
                open={Boolean(validationWarning)}
                autoHideDuration={6000}
                onClose={onValidationClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="warning" onClose={onValidationClose}>
                    <AlertTitle>Warning</AlertTitle>
                    {validationWarning}
                </Alert>
            </Snackbar>
        </>
    );
};
