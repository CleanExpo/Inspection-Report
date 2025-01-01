import React, { useRef, useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  IconButton, 
  CircularProgress,
  Alert,
  Slider,
  TextField,
  Paper,
  Tooltip
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';
import SettingsIcon from '@mui/icons-material/Settings';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import CropFreeIcon from '@mui/icons-material/CropFree';
import ErrorIcon from '@mui/icons-material/Error';

interface PhotoCaptureProps {
  onPhotoCapture: (photo: string, metadata: PhotoMetadata) => void;
  moistureReading?: number;
  location?: string;
  materialType?: string;
}

interface PhotoMetadata {
  timestamp: string;
  location?: string;
  moistureReading?: number;
  materialType?: string;
  quality: number;
  hasAnnotations: boolean;
}

interface Annotation {
  x: number;
  y: number;
  text: string;
}

export default function PhotoCapture({ 
  onPhotoCapture, 
  moistureReading,
  location,
  materialType 
}: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState(0.8);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [showGuideLines, setShowGuideLines] = useState(false);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setLoading(true);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions.');
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const toggleCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    startCamera();
  };

  const addAnnotation = (event: React.MouseEvent<HTMLVideoElement>) => {
    if (!isAddingAnnotation) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    const newAnnotation: Annotation = {
      x,
      y,
      text: `${moistureReading}% ${materialType || ''}`
    };

    setAnnotations([...annotations, newAnnotation]);
    setIsAddingAnnotation(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;

    // Draw video frame
    context.drawImage(video, 0, 0);

    // Draw annotations
    context.font = '20px Arial';
    context.fillStyle = 'white';
    context.strokeStyle = 'black';
    context.lineWidth = 2;

    annotations.forEach(annotation => {
      const x = annotation.x * canvas.width;
      const y = annotation.y * canvas.height;

      // Draw marker
      context.beginPath();
      context.arc(x, y, 5, 0, 2 * Math.PI);
      context.fill();
      context.stroke();

      // Draw text with background
      const text = annotation.text;
      const metrics = context.measureText(text);
      const padding = 4;

      context.fillStyle = 'rgba(0, 0, 0, 0.6)';
      context.fillRect(
        x - metrics.width/2 - padding,
        y + 10,
        metrics.width + padding * 2,
        24
      );

      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.fillText(text, x, y + 28);
    });

    // Add timestamp and location
    const timestamp = new Date().toLocaleString();
    context.font = '16px Arial';
    context.fillStyle = 'rgba(0, 0, 0, 0.6)';
    context.fillRect(10, canvas.height - 60, 300, 50);
    context.fillStyle = 'white';
    context.textAlign = 'left';
    context.fillText(timestamp, 20, canvas.height - 40);
    if (location) {
      context.fillText(location, 20, canvas.height - 20);
    }

    // Convert to JPEG with quality setting
    const photoData = canvas.toDataURL('image/jpeg', quality);
    
    const metadata: PhotoMetadata = {
      timestamp: new Date().toISOString(),
      location,
      moistureReading,
      materialType,
      quality,
      hasAnnotations: annotations.length > 0
    };

    onPhotoCapture(photoData, metadata);
    stopCamera();
    setAnnotations([]);
  };

  if (error) {
    return (
      <Alert 
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={startCamera}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ textAlign: 'center' }}>
      {loading && (
        <CircularProgress sx={{ my: 2 }} />
      )}

      {!isStreaming && !loading && (
        <Button
          variant="contained"
          startIcon={<PhotoCameraIcon />}
          onClick={startCamera}
          sx={{ mb: 2 }}
        >
          Take Photo
        </Button>
      )}

      {isStreaming && (
        <Box sx={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            onClick={addAnnotation}
            style={{
              width: '100%',
              borderRadius: '8px',
              cursor: isAddingAnnotation ? 'crosshair' : 'default'
            }}
          />
          
          {showGuideLines && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
            }}>
              <Box sx={{
                position: 'absolute',
                left: '33%',
                top: 0,
                bottom: 0,
                borderLeft: '1px dashed rgba(255,255,255,0.5)',
              }} />
              <Box sx={{
                position: 'absolute',
                left: '66%',
                top: 0,
                bottom: 0,
                borderLeft: '1px dashed rgba(255,255,255,0.5)',
              }} />
              <Box sx={{
                position: 'absolute',
                top: '33%',
                left: 0,
                right: 0,
                borderTop: '1px dashed rgba(255,255,255,0.5)',
              }} />
              <Box sx={{
                position: 'absolute',
                top: '66%',
                left: 0,
                right: 0,
                borderTop: '1px dashed rgba(255,255,255,0.5)',
              }} />
            </Box>
          )}

          <Box sx={{ 
            position: 'absolute', 
            bottom: 16, 
            left: '50%', 
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 2,
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: '8px 16px',
            borderRadius: '20px'
          }}>
            <Tooltip title="Switch Camera">
              <IconButton 
                onClick={toggleCamera}
                sx={{ color: 'white' }}
              >
                <FlipCameraIosIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Add Reading Marker">
              <IconButton 
                onClick={() => setIsAddingAnnotation(true)}
                sx={{ 
                  color: 'white',
                  bgcolor: isAddingAnnotation ? 'primary.main' : 'transparent'
                }}
              >
                <AddLocationIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Toggle Guide Lines">
              <IconButton 
                onClick={() => setShowGuideLines(prev => !prev)}
                sx={{ 
                  color: 'white',
                  bgcolor: showGuideLines ? 'primary.main' : 'transparent'
                }}
              >
                <CropFreeIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Capture">
              <IconButton 
                onClick={capturePhoto}
                sx={{ color: 'white' }}
              >
                <PhotoCameraIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Settings">
              <IconButton 
                onClick={() => setShowSettings(prev => !prev)}
                sx={{ color: 'white' }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {showSettings && (
            <Paper sx={{ 
              position: 'absolute', 
              bottom: 80, 
              left: '50%', 
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '300px',
              p: 2
            }}>
              <Typography gutterBottom>Photo Quality</Typography>
              <Slider
                value={quality}
                min={0.1}
                max={1}
                step={0.1}
                onChange={(_, value) => setQuality(value as number)}
                valueLabelDisplay="auto"
                valueLabelFormat={value => `${Math.round(value * 100)}%`}
              />
            </Paper>
          )}
        </Box>
      )}

      {/* Hidden canvas for processing */}
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }}
      />
    </Box>
  );
}
