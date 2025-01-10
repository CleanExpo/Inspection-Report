import React, { useState, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    FormControlLabel,
    RadioGroup,
    Radio,
    Checkbox,
    TextField,
    LinearProgress,
    Typography,
    Box,
    Alert,
    Stack
} from '@mui/material';
import { BatchExportService, BatchExportOptions, BatchExportItem } from '../../services/batch-export-service';
import { MoisturePoint, Wall } from '../../types/canvas';

interface BatchExportDialogProps {
    open: boolean;
    onClose: () => void;
    items: Array<{
        canvas: HTMLCanvasElement;
        readings: MoisturePoint[];
        walls: Wall[];
        stats?: {
            average: number;
            max: number;
            min: number;
            criticalCount: number;
        };
        metadata?: {
            title?: string;
            date?: string;
            location?: string;
            notes?: string;
        };
    }>;
}

export const BatchExportDialog: React.FC<BatchExportDialogProps> = ({
    open,
    onClose,
    items
}) => {
    const [format, setFormat] = useState<'pdf' | 'png' | 'jpeg'>('pdf');
    const [quality, setQuality] = useState(0.8);
    const [includeAnnotations, setIncludeAnnotations] = useState(true);
    const [includeStats, setIncludeStats] = useState(true);
    const [customFileName, setCustomFileName] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleExport = useCallback(async () => {
        setIsExporting(true);
        setProgress(0);
        setError(null);

        try {
            const exportItems: BatchExportItem[] = items.map(item => ({
                ...item,
                metadata: {
                    ...item.metadata,
                    title: customFileName || item.metadata?.title
                }
            }));

            const options: BatchExportOptions = {
                format,
                quality,
                includeAnnotations,
                includeStats,
                customFileName,
                compressionLevel: 6
            };

            await BatchExportService.exportBatch(exportItems, options);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Export failed');
        } finally {
            setIsExporting(false);
        }
    }, [
        items,
        format,
        quality,
        includeAnnotations,
        includeStats,
        customFileName,
        onClose
    ]);

    return (
        <Dialog
            open={open}
            onClose={!isExporting ? onClose : undefined}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Batch Export ({items.length} items)</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 2 }}>
                    {error && (
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    <FormControl component="fieldset">
                        <Typography variant="subtitle2" gutterBottom>
                            Export Format
                        </Typography>
                        <RadioGroup
                            row
                            value={format}
                            onChange={(e) => setFormat(e.target.value as any)}
                        >
                            <FormControlLabel
                                value="pdf"
                                control={<Radio />}
                                label="PDF"
                            />
                            <FormControlLabel
                                value="png"
                                control={<Radio />}
                                label="PNG"
                            />
                            <FormControlLabel
                                value="jpeg"
                                control={<Radio />}
                                label="JPEG"
                            />
                        </RadioGroup>
                    </FormControl>

                    {format === 'jpeg' && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Quality ({Math.round(quality * 100)}%)
                            </Typography>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={quality}
                                onChange={(e) => setQuality(Number(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </Box>
                    )}

                    <FormControl component="fieldset">
                        <Typography variant="subtitle2" gutterBottom>
                            Export Options
                        </Typography>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={includeAnnotations}
                                    onChange={(e) => setIncludeAnnotations(e.target.checked)}
                                />
                            }
                            label="Include Annotations"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={includeStats}
                                    onChange={(e) => setIncludeStats(e.target.checked)}
                                />
                            }
                            label="Include Statistics"
                        />
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Custom Filename Prefix (optional)"
                        value={customFileName}
                        onChange={(e) => setCustomFileName(e.target.value)}
                        helperText="Leave empty to use original filenames"
                    />

                    {isExporting && (
                        <Box>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Exporting... {progress}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{ height: 8, borderRadius: 4 }}
                            />
                        </Box>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={onClose}
                    disabled={isExporting}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleExport}
                    variant="contained"
                    disabled={isExporting}
                    color="primary"
                >
                    Export
                </Button>
            </DialogActions>
        </Dialog>
    );
};
