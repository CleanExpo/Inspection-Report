import React, { useState, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Slider,
    Alert
} from '@mui/material';
import { Point2D } from '../../types/canvas';

interface MoistureReadingDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (value: number, notes?: string) => void;
    position: Point2D;
    criticalThreshold?: number;
}

export const MoistureReadingDialog: React.FC<MoistureReadingDialogProps> = ({
    open,
    onClose,
    onSubmit,
    position,
    criticalThreshold = 16
}) => {
    // Manage focus when dialog opens
    const valueInputRef = React.useRef<HTMLInputElement>(null);
    React.useEffect(() => {
        if (open) {
            // Focus value input when dialog opens
            setTimeout(() => valueInputRef.current?.focus(), 100);
        }
    }, [open]);

    const [value, setValue] = useState<number>(0);
    const [notes, setNotes] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = useCallback(() => {
        if (value < 0) {
            setError('Moisture reading cannot be negative');
            return;
        }

        if (value > 100) {
            setError('Moisture reading cannot exceed 100');
            return;
        }

        onSubmit(value, notes);
        onClose();
        
        // Reset form
        setValue(0);
        setNotes('');
        setError(null);
    }, [value, notes, onSubmit, onClose]);

    const handleSliderChange = useCallback((_: Event, newValue: number | number[]) => {
        setValue(newValue as number);
        setError(null);
    }, []);

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(event.target.value);
        if (!isNaN(newValue)) {
            setValue(newValue);
            setError(null);
        }
    }, []);

    const handleNotesChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setNotes(event.target.value);
    }, []);

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            aria-labelledby="moisture-reading-dialog-title"
            aria-describedby="moisture-reading-dialog-description"
        >
            <DialogTitle id="moisture-reading-dialog-title">Add Moisture Reading</DialogTitle>
            <DialogContent id="moisture-reading-dialog-description">
                <Box sx={{ mb: 2 }} role="status">
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Position: ({Math.round(position.x)}, {Math.round(position.y)})
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>Moisture Value (%)</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Slider
                            value={value}
                            onChange={handleSliderChange}
                            min={0}
                            max={100}
                            step={0.1}
                            valueLabelDisplay="auto"
                            sx={{
                                '& .MuiSlider-thumb': {
                                    color: value >= criticalThreshold ? 'error.main' : 'primary.main'
                                },
                                '& .MuiSlider-track': {
                                    color: value >= criticalThreshold ? 'error.main' : 'primary.main'
                                }
                            }}
                        />
                <TextField
                    value={value}
                    onChange={handleInputChange}
                    type="number"
                    size="small"
                    inputRef={valueInputRef}
                    inputProps={{
                        min: 0,
                        max: 100,
                        step: 0.1,
                        'aria-label': 'Moisture reading value',
                        'aria-valuemin': 0,
                        'aria-valuemax': 100,
                        'aria-valuenow': value
                    }}
                    sx={{ width: 100 }}
                />
                    </Box>
                    {value >= criticalThreshold && (
                        <Typography 
                            variant="caption" 
                            color="error" 
                            sx={{ mt: 1, display: 'block' }}
                            role="alert"
                        >
                            Warning: Reading exceeds critical threshold ({criticalThreshold}%)
                        </Typography>
                    )}
                </Box>

                <TextField
                    label="Notes"
                    multiline
                    rows={3}
                    value={notes}
                    onChange={handleNotesChange}
                    fullWidth
                    placeholder="Add any observations or additional details..."
                />

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Add Reading
                </Button>
            </DialogActions>
        </Dialog>
    );
};
