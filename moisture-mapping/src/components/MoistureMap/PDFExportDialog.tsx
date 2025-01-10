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
    Typography
} from '@mui/material';
import { PDFExportService } from '../../services/pdf-export-service';
import { MoisturePoint, Wall } from '../../types/canvas';
import { MoistureReadingStats } from '../../services/moisture-reading-manager';

interface PDFExportDialogProps {
    open: boolean;
    onClose: () => void;
    canvas: HTMLCanvasElement | null;
    readings: MoisturePoint[];
    walls: Wall[];
    stats?: MoistureReadingStats;
}

export const PDFExportDialog: React.FC<PDFExportDialogProps> = ({
    open,
    onClose,
    canvas,
    readings,
    walls,
    stats
}) => {
    const [title, setTitle] = useState('Moisture Map Report');
    const [includeReadings, setIncludeReadings] = useState(true);
    const [includeStats, setIncludeStats] = useState(true);
    const [includeNotes, setIncludeNotes] = useState(true);
    const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string>();

    const handleExport = async () => {
        if (!canvas) {
            setError('Canvas not available');
            return;
        }

        setIsGenerating(true);
        setError(undefined);

        try {
            const exportService = new PDFExportService(canvas, readings, walls, stats && {
                ...stats,
                criticalCount: stats.criticalPoints.length
            });
            const pdfBlob = await exportService.generatePDF({
                title,
                includeReadings,
                includeStats,
                includeNotes,
                pageSize,
                orientation
            });

            // Create download link
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate PDF');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby="pdf-export-dialog-title"
        >
            <DialogTitle id="pdf-export-dialog-title">
                Export PDF Report
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'grid', gap: 2, my: 2 }}>
                    <TextField
                        label="Report Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        variant="outlined"
                    />

                    <FormControl fullWidth>
                        <InputLabel id="page-size-label">Page Size</InputLabel>
                        <Select
                            labelId="page-size-label"
                            value={pageSize}
                            onChange={(e) => setPageSize(e.target.value as 'a4' | 'letter')}
                            label="Page Size"
                        >
                            <MenuItem value="a4">A4</MenuItem>
                            <MenuItem value="letter">Letter</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="orientation-label">Orientation</InputLabel>
                        <Select
                            labelId="orientation-label"
                            value={orientation}
                            onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                            label="Orientation"
                        >
                            <MenuItem value="portrait">Portrait</MenuItem>
                            <MenuItem value="landscape">Landscape</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={includeReadings}
                                onChange={(e) => setIncludeReadings(e.target.checked)}
                            />
                        }
                        label="Include Moisture Readings"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={includeStats}
                                onChange={(e) => setIncludeStats(e.target.checked)}
                                disabled={!stats}
                            />
                        }
                        label="Include Statistics"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={includeNotes}
                                onChange={(e) => setIncludeNotes(e.target.checked)}
                            />
                        }
                        label="Include Notes"
                    />

                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isGenerating}>
                    Cancel
                </Button>
                <Button
                    onClick={handleExport}
                    variant="contained"
                    disabled={isGenerating}
                    startIcon={isGenerating ? <CircularProgress size={20} /> : undefined}
                >
                    {isGenerating ? 'Generating...' : 'Export PDF'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
