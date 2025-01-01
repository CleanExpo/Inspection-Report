import React, { useCallback, useState, useEffect } from 'react';
import { Box, Dialog, TextField, Button, IconButton, Typography, MenuItem, FormControl, InputLabel, Select, Snackbar } from '@mui/material';
import { PhotoCamera as PhotoIcon, Save as SaveIcon } from '@mui/icons-material';
import { GridCanvas } from './GridCanvas';
import { DrawingTools } from './DrawingTools';
import { useSketchDrawing } from '../../hooks/useSketchDrawing';
import { Point, MoistureData } from '../../types/sketch';
import { PhotoUploadDialog } from './PhotoUploadDialog';
import { uploadPhoto, compressImage } from '../../services/photoUpload';

interface SketchEditorProps {
  sketchId: string;
  width?: number;
  height?: number;
  gridSize?: number;
  currentInspectionDay: number;
  onSave?: (elements: any) => void;
}

export const SketchEditor: React.FC<SketchEditorProps> = ({
  sketchId,
  width = 800,
  height = 600,
  gridSize = 20,
  currentInspectionDay,
  onSave,
}) => {
  const {
    state,
    startDrawing,
    draw,
    stopDrawing,
    undo,
    redo,
    setTool,
    setColor,
    addMoistureReading,
    addPhoto,
    addText,
    saveStatus: hookSaveStatus
  } = useSketchDrawing(sketchId, currentInspectionDay);

  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [photoPlacementMode, setPhotoPlacementMode] = useState(false);
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState<string | null>(null);
  const [dialogType, setDialogType] = useState<'moisture' | 'text' | null>(null);
  const [dialogValue, setDialogValue] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('drywall');
  const [selectedReadingType, setSelectedReadingType] = useState({
    id: 'wme',
    name: 'Wood Moisture Equivalent',
    unit: '%'
  });
  const [selectedReadingMethod, setSelectedReadingMethod] = useState({
    id: 'pin',
    name: 'Pin Type'
  });
  const [dialogPoint, setDialogPoint] = useState<Point | null>(null);

  // Update local save status when hook status changes
  useEffect(() => {
    if (hookSaveStatus !== saveStatus) {
      setSaveStatus(hookSaveStatus);
    }
  }, [hookSaveStatus, saveStatus]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    if (photoPlacementMode && pendingPhotoUrl) {
      addPhoto(point, pendingPhotoUrl);
      setPhotoPlacementMode(false);
      setPendingPhotoUrl(null);
      return;
    }

    if (state.currentTool === 'moisture' || state.currentTool === 'text') {
      setDialogPoint(point);
      setDialogType(state.currentTool);
      setDialogOpen(true);
      return;
    }

    startDrawing(point);
  }, [state.currentTool, startDrawing, photoPlacementMode, pendingPhotoUrl, addPhoto]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!state.isDrawing) return;

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    draw({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, [state.isDrawing, draw]);

  const handleCanvasMouseUp = useCallback(() => {
    stopDrawing();
  }, [stopDrawing]);

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogValue('');
    setDialogPoint(null);
    setDialogType(null);
  };

  const handleDialogSubmit = () => {
    if (!dialogPoint || !dialogType) return;

    if (dialogType === 'moisture') {
      const value = parseFloat(dialogValue);
      if (!isNaN(value)) {
        const moistureData: MoistureData = {
          value,
          materialType: selectedMaterial,
          readingType: selectedReadingType,
          readingMethod: selectedReadingMethod,
          timestamp: new Date().toISOString()
        };
        addMoistureReading(dialogPoint, moistureData);
      }
    } else if (dialogType === 'text') {
      addText(dialogPoint, dialogValue);
    }

    handleDialogClose();
  };

  const renderDialog = () => (
    <Dialog open={dialogOpen} onClose={handleDialogClose}>
      <Box sx={{ p: 2 }}>
        <TextField
          autoFocus
          label={dialogType === 'moisture' ? 'Moisture Reading' : 'Text'}
          type={dialogType === 'moisture' ? 'number' : 'text'}
          value={dialogValue}
          onChange={(e) => setDialogValue(e.target.value)}
          sx={{ mb: 2 }}
        />
        {dialogType === 'moisture' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Material Type</InputLabel>
              <Select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                label="Material Type"
              >
                <MenuItem value="drywall">Drywall</MenuItem>
                <MenuItem value="wood">Wood</MenuItem>
                <MenuItem value="concrete">Concrete</MenuItem>
                <MenuItem value="carpet">Carpet</MenuItem>
                <MenuItem value="insulation">Insulation</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Reading Type</InputLabel>
              <Select
                value={selectedReadingType.id}
                onChange={(e) => {
                  const value = e.target.value as string;
                  if (value === selectedReadingType.id) return;
                  
                  const types = {
                    wme: { id: 'wme', name: 'Wood Moisture Equivalent', unit: '%' },
                    relative: { id: 'relative', name: 'Relative Scale', unit: 'REL' },
                    gravimetric: { id: 'gravimetric', name: 'Gravimetric', unit: '%' }
                  };
                  setSelectedReadingType(types[value as keyof typeof types]);
                }}
                label="Reading Type"
              >
                <MenuItem value="wme">Wood Moisture Equivalent (%)</MenuItem>
                <MenuItem value="relative">Relative Scale (REL)</MenuItem>
                <MenuItem value="gravimetric">Gravimetric (%)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Reading Method</InputLabel>
              <Select
                value={selectedReadingMethod.id}
                onChange={(e) => {
                  const value = e.target.value as string;
                  if (value === selectedReadingMethod.id) return;
                  
                  const methods = {
                    pin: { id: 'pin', name: 'Pin Type' },
                    pinless: { id: 'pinless', name: 'Pinless/Non-invasive' },
                    thermo: { id: 'thermo', name: 'Thermo-Hygrometer' }
                  };
                  setSelectedReadingMethod(methods[value as keyof typeof methods]);
                }}
                label="Reading Method"
              >
                <MenuItem value="pin">Pin Type</MenuItem>
                <MenuItem value="pinless">Pinless/Non-invasive</MenuItem>
                <MenuItem value="thermo">Thermo-Hygrometer</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDialogSubmit} variant="contained">
            Add
          </Button>
        </Box>
      </Box>
    </Dialog>
  );

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
      <DrawingTools
        currentTool={state.currentTool}
        currentColor={state.currentColor}
        onToolChange={setTool}
        onColorChange={setColor}
      />
      <Box
        sx={{
          position: 'relative',
          '&:hover': { cursor: photoPlacementMode ? 'crosshair' : undefined },
        }}
        onMouseLeave={handleCanvasMouseUp}
      >
        {photoPlacementMode && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              p: 1,
              textAlign: 'center',
              zIndex: 1,
            }}
          >
            <Typography variant="body2">Click where you want to place the photo</Typography>
          </Box>
        )}
        <GridCanvas
          width={width}
          height={height}
          gridSize={gridSize}
          elements={state.elements}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8,
            zIndex: 1,
            bgcolor: 'background.paper',
            borderRadius: '50%',
            boxShadow: 1,
          }}
        >
          <IconButton
            color="primary"
            onClick={() => setPhotoDialogOpen(true)}
            disabled={photoPlacementMode}
          >
            <PhotoIcon />
          </IconButton>
        </Box>
      </Box>
      <Snackbar
        open={saveStatus !== null}
        autoHideDuration={3000}
        onClose={() => setSaveStatus(null)}
        message={
          saveStatus === 'saving' ? 'Saving changes...' :
          saveStatus === 'saved' ? 'All changes saved' :
          saveStatus === 'error' ? 'Error saving changes' : ''
        }
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: saveStatus === 'saved' ? 'success.main' : 
                    saveStatus === 'error' ? 'error.main' :
                    'info.main'
          }
        }}
      />
      {renderDialog()}
      <PhotoUploadDialog
        open={photoDialogOpen}
        onClose={() => setPhotoDialogOpen(false)}
        onUpload={async (file) => {
          const compressed = await compressImage(file);
          return uploadPhoto(compressed);
        }}
        onPhotoAdd={(url) => {
          setPendingPhotoUrl(url);
          setPhotoPlacementMode(true);
          setPhotoDialogOpen(false);
        }}
      />
    </Box>
  );
};
