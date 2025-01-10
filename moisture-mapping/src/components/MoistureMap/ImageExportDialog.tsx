import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    FormControlLabel,
    Checkbox,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    Box,
    CircularProgress,
    Typography,
    Slider,
    Stack
} from '@mui/material';
import { ImageExportService, ImageFormat, ImageExportOptions } from '../../services/image-export-service';
import { MoisturePoint, Wall } from '../../types/canvas';

interface ImageExportDialogProps {
    open: boolean;
    onClose: () => void;
    canvas: HTMLCanvasElement | null;
    readings: MoisturePoint[];
    walls: Wall[];
}

export const ImageExportDialog: React.FC<ImageExportDialogProps> = ({
    open,
    onClose,
    canvas,
    readings,
    walls
}) => {
    const [format, setFormat] = useState<ImageFormat>('png');
    const [quality, setQuality] = useState(95);
    const [includeReadings, setIncludeReadings] = useState(true);
    const [includeAnnotations, setIncludeAnnotations] = useState(true);
    const [scale, setScale] = useState(1);
    const [filename, setFilename] = useState('moisture-map');
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string>();

    const handleExport = async () => {
        if (!canvas) {
            setError('Canvas not available');
            return;
        }

        setIsExporting(true);
        setError(undefined);

        try {
            const exportService = new ImageExportService(canvas, readings, walls);
            
            const options: ImageExportOptions = {
                format,
                quality: quality / 100,
                includeReadings,
                includeAnnotations,
                backgroundColor: '#ffffff',
                scale
            };

            const blob = await exportService.exportImage(options);
            await ImageExportService.downloadImage(blob, filename, format);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to export image');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby="image-export-dialog-title"
        >
            <DialogTitle id="image-export-dialog-title">
                Export Image
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'grid', gap: 2, my: 2 }}>
                    <TextField
                        label="Filename"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        fullWidth
                        variant="outlined"
                        helperText={`Will be saved as ${filename}.${format}`}
                    />

                    <FormControl fullWidth>
                        <InputLabel id="format-label">Format</InputLabel>
                        <Select
                            labelId="format-label"
                            value={format}
                            onChange={(e) => setFormat(e.target.value as ImageFormat)}
                            label="Format"
                        >
                            <MenuItem value="png">PNG (Lossless)</MenuItem>
                            <MenuItem value="jpeg">JPEG (Compressed)</MenuItem>
                        </Select>
                    </FormControl>

                    {format === 'jpeg' && (
                        <Box>
                            <Typography gutterBottom>
                                JPEG Quality
                            </Typography>
                            <Stack spacing={2} direction="row" alignItems="center">
                                <Slider
                                    value={quality}
                                    onChange={(_, value) => setQuality(value as number)}
                                    aria-labelledby="quality-slider"
                                    valueLabelDisplay="auto"
                                    min={1}
                                    max={100}
                                    marks={[
                                        { value: 1, label: '1%' },
                                        { value: 50, label: '50%' },
                                        { value: 100, label: '100%' }
                                    ]}
                                />
                            </Stack>
                        </Box>
                    )}

                    <Box>
                        <Typography gutterBottom>
                            Scale
                        </Typography>
                        <Stack spacing={2} direction="row" alignItems="center">
                            <Slider
                                value={scale}
                                onChange={(_, value) => setScale(value as number)}
                                aria-labelledby="scale-slider"
                                step={0.5}
                                marks
                                min={0.5}
                                max={4}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => `${value}x`}
                            />
                        </Stack>
                    </Box>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={includeReadings}
                                onChange={(e) => {
                                    setIncludeReadings(e.target.checked);
                                    if (!e.target.checked) {
                                        setIncludeAnnotations(false);
                                    }
                                }}
                            />
                        }
                        label="Include Moisture Readings"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={includeAnnotations}
                                onChange={(e) => setIncludeAnnotations(e.target.checked)}
                                disabled={!includeReadings}
                            />
                        }
                        label="Show Reading Values"
                    />

                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isExporting}>
                    Cancel
                </Button>
                <Button
                    onClick={handleExport}
                    variant="contained"
                    disabled={isExporting}
                    startIcon={isExporting ? <CircularProgress size={20} /> : undefined}
                >
                    {isExporting ? 'Exporting...' : 'Export Image'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
