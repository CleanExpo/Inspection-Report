"use client";

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  Tooltip
} from '@mui/material';
import {
  PhotoCamera as CameraIcon,
  Close as CloseIcon,
  Cameraswitch as CameraSwitchIcon,
  HighQuality as QualityIcon
} from '@mui/icons-material';
import type { PhotoAttachment } from '../types/photo';

interface PhotoCaptureProps {
  onCapture: (photo: Omit<PhotoAttachment, 'id'>) => void;
  onClose?: () => void;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
  defaultQuality?: number;
}

type CameraError = 
  | 'permission_denied'
  | 'device_not_found'
  | 'constraint_error'
  | 'unknown_error';

interface CameraSettings {
  facingMode: 'environment' | 'user';
  quality: number;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  onCapture,
  onClose,
  className = "",
  maxWidth = 1920,
  maxHeight = 1080,
  defaultQuality = 0.8
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<{ type: CameraError; message: string } | null>(null);
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>({
    facingMode: 'environment',
    quality: defaultQuality
  });
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const getErrorMessage = (error: unknown): { type: CameraError; message: string } => {
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        return { type: 'permission_denied', message: 'Camera access denied. Please grant camera permissions.' };
      } else if (error.name === 'NotFoundError') {
        return { type: 'device_not_found', message: 'No camera device found.' };
      } else if (error.name === 'ConstraintError') {
        return { type: 'constraint_error', message: 'Camera constraints not satisfied.' };
      }
    }
    return { type: 'unknown_error', message: 'An unexpected error occurred.' };
  };

  const checkAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setHasMultipleCameras(cameras.length > 1);
    } catch (error) {
      console.error('Error checking cameras:', error);
    }
  };

  const startCamera = async () => {
    try {
      // Stop any existing stream
      stopCamera();

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraSettings.facingMode,
          width: { ideal: maxWidth },
          height: { ideal: maxHeight }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setError(null);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError(getErrorMessage(error));
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert to data URL with quality setting
    const dataUrl = canvas.toDataURL('image/jpeg', cameraSettings.quality);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleSave = async () => {
    if (!capturedImage) return;

    try {
      setIsCapturing(true);
      setError(null);

      // Convert data URL to Blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Get device info from video track
      const track = stream?.getVideoTracks()[0];
      const settings = track?.getSettings();
      
      const photo: Omit<PhotoAttachment, 'id'> = {
        url: capturedImage,
        dataUrl: capturedImage,
        caption: caption.trim() || undefined,
        fileName: `photo-${Date.now()}.jpg`,
        fileSize: blob.size,
        mimeType: blob.type,
        uploadedAt: new Date().toISOString(),
        metadata: {
          width: canvasRef.current?.width,
          height: canvasRef.current?.height,
          deviceInfo: {
            make: settings?.deviceId || undefined,
            model: track?.label || undefined
          }
        }
      };

      onCapture(photo);
      handleClose();
    } catch (error) {
      console.error('Error saving photo:', error);
      setError(getErrorMessage(error));
    } finally {
      setIsCapturing(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setCaption('');
    setError(null);
    onClose?.();
  };

  const toggleCamera = () => {
    setCameraSettings(prev => ({
      ...prev,
      facingMode: prev.facingMode === 'environment' ? 'user' : 'environment'
    }));
  };

  React.useEffect(() => {
    checkAvailableCameras();
    startCamera();
    return () => stopCamera();
  }, [cameraSettings.facingMode]);

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      className={className}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {capturedImage ? 'Review Photo' : 'Take Photo'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!capturedImage && (
              <>
                {hasMultipleCameras && (
                  <Tooltip title="Switch Camera">
                    <IconButton onClick={toggleCamera} size="small">
                      <CameraSwitchIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={cameraSettings.quality}
                    onChange={(e) => setCameraSettings(prev => ({
                      ...prev,
                      quality: Number(e.target.value)
                    }))}
                    displayEmpty
                    startAdornment={<QualityIcon sx={{ mr: 1 }} />}
                  >
                    <MenuItem value={0.6}>Low</MenuItem>
                    <MenuItem value={0.8}>Medium</MenuItem>
                    <MenuItem value={1.0}>High</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message}
          </Alert>
        )}

        <Box sx={{ position: 'relative', aspectRatio: '16/9', bgcolor: 'black' }}>
          {!capturedImage ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <img
              src={capturedImage}
              alt="Captured"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          )}
        </Box>

        {capturedImage && (
          <TextField
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption (optional)"
            fullWidth
            multiline
            rows={2}
            sx={{ mt: 2 }}
          />
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </DialogContent>

      <DialogActions>
        {!capturedImage ? (
          <Button
            onClick={capturePhoto}
            variant="contained"
            startIcon={<CameraIcon />}
            disabled={!stream}
          >
            Capture
          </Button>
        ) : (
          <>
            <Button
              onClick={() => {
                setCapturedImage(null);
                startCamera();
              }}
              disabled={isCapturing}
            >
              Retake
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={isCapturing}
              startIcon={isCapturing ? <CircularProgress size={20} /> : null}
            >
              {isCapturing ? 'Saving...' : 'Save'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PhotoCapture;
