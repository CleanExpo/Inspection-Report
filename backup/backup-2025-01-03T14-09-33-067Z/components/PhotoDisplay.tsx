"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Dialog,
  DialogContent,
  Tooltip,
  CircularProgress,
  Fade,
  Paper,
  Skeleton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material';
import type { PhotoAttachment, PhotoDisplayOptions } from '../types/photo';

interface PhotoDisplayProps {
  photo: PhotoAttachment;
  options?: PhotoDisplayOptions;
  onDelete?: (photo: PhotoAttachment) => void;
  className?: string;
  nextPhoto?: PhotoAttachment;
  prevPhoto?: PhotoAttachment;
  onNavigate?: (direction: 'next' | 'prev') => void;
}

const PhotoDisplay: React.FC<PhotoDisplayProps> = ({
  photo,
  options = {
    showCaption: true,
    showMetadata: true,
    showTags: true,
    allowDownload: true,
    allowDelete: true,
    maxHeight: 300,
    maxWidth: 400
  },
  onDelete,
  className = "",
  nextPhoto,
  prevPhoto,
  onNavigate
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMetadataOverlay, setShowMetadataOverlay] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setError('Failed to load image');
    setImageLoaded(true);
  };

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(photo.url);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = photo.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading photo:', error);
      setError('Failed to download photo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(photo);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!isZoomed) return;

    switch (event.key) {
      case 'ArrowLeft':
        if (onNavigate && prevPhoto) onNavigate('prev');
        break;
      case 'ArrowRight':
        if (onNavigate && nextPhoto) onNavigate('next');
        break;
      case 'Escape':
        setIsZoomed(false);
        break;
      case 'f':
        toggleFullscreen();
        break;
      case 'i':
        setShowMetadataOverlay(prev => !prev);
        break;
    }
  }, [isZoomed, onNavigate, prevPhoto, nextPhoto]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const renderMetadataOverlay = () => (
    <Fade in={showMetadataOverlay}>
      <Paper
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          p: 2,
          bgcolor: 'rgba(0,0,0,0.7)',
          color: 'white'
        }}
      >
        <Typography variant="subtitle2">Photo Details</Typography>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2">
            Taken: {new Date(photo.uploadedAt).toLocaleString()}
          </Typography>
          {photo.metadata?.deviceInfo && (
            <Typography variant="body2">
              Device: {photo.metadata.deviceInfo.make} {photo.metadata.deviceInfo.model}
            </Typography>
          )}
          {photo.metadata?.location && (
            <Typography variant="body2">
              Location: {photo.metadata.location.lat}, {photo.metadata.location.lng}
            </Typography>
          )}
          {photo.metadata?.width && photo.metadata?.height && (
            <Typography variant="body2">
              Resolution: {photo.metadata.width}x{photo.metadata.height}
            </Typography>
          )}
        </Box>
      </Paper>
    </Fade>
  );

  return (
    <Box className={`relative ${className}`}>
      {/* Main Photo Display */}
      <Box
        className="relative group"
        sx={{
          maxWidth: options.maxWidth,
          maxHeight: options.maxHeight,
          overflow: 'hidden',
          borderRadius: 1,
          '&:hover .photo-controls': {
            opacity: 1
          }
        }}
      >
        {!imageLoaded && (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={options.maxHeight}
            animation="wave"
          />
        )}
        
        {error ? (
          <Box
            sx={{
              width: '100%',
              height: options.maxHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100'
            }}
          >
            <Box sx={{ textAlign: 'center', color: 'error.main' }}>
              <ErrorIcon sx={{ fontSize: 40 }} />
              <Typography variant="body2">{error}</Typography>
            </Box>
          </Box>
        ) : (
          <Box
            component="img"
            src={photo.url}
            alt={photo.caption || 'Inspection photo'}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: imageLoaded ? 'block' : 'none'
            }}
          />
        )}

        {/* Photo Controls Overlay */}
        <Fade in={true}>
          <Box
            className="photo-controls"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgcolor: 'rgba(0,0,0,0.4)',
              opacity: 0,
              transition: 'opacity 200ms',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}
          >
            <Tooltip title="Zoom">
              <IconButton
                onClick={() => setIsZoomed(true)}
                size="small"
                sx={{ color: 'white' }}
              >
                <ZoomInIcon />
              </IconButton>
            </Tooltip>

            {options.allowDownload && (
              <Tooltip title="Download">
                <IconButton
                  onClick={handleDownload}
                  size="small"
                  sx={{ color: 'white' }}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : <DownloadIcon />}
                </IconButton>
              </Tooltip>
            )}

            {options.allowDelete && onDelete && (
              <Tooltip title="Delete">
                <IconButton
                  onClick={handleDelete}
                  size="small"
                  sx={{ color: 'white' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Fade>
      </Box>

      {/* Caption and Metadata */}
      {(options.showCaption || options.showMetadata) && (
        <Box sx={{ mt: 2, space: 1 }}>
          {options.showCaption && photo.caption && (
            <Typography variant="caption" sx={{ display: 'block' }}>
              {photo.caption}
            </Typography>
          )}

          {options.showMetadata && (
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
              {new Date(photo.uploadedAt).toLocaleDateString()}
              {photo.metadata?.location && ' • GPS Location'}
              {photo.metadata?.deviceInfo && ` • ${photo.metadata.deviceInfo.make} ${photo.metadata.deviceInfo.model}`}
            </Typography>
          )}

          {options.showTags && photo.tags && photo.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {photo.tags.map((tag, index) => (
                <Typography
                  key={index}
                  variant="caption"
                  sx={{
                    px: 1,
                    py: 0.25,
                    bgcolor: 'grey.100',
                    borderRadius: 'full'
                  }}
                >
                  {tag}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Zoom Dialog */}
      <Dialog
        open={isZoomed}
        onClose={() => setIsZoomed(false)}
        maxWidth={false}
        fullScreen={isMobile}
      >
        <DialogContent sx={{ position: 'relative', p: 0, bgcolor: 'black' }}>
          {/* Navigation Controls */}
          {prevPhoto && onNavigate && (
            <IconButton
              onClick={() => onNavigate('prev')}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
              }}
            >
              <PrevIcon />
            </IconButton>
          )}

          {nextPhoto && onNavigate && (
            <IconButton
              onClick={() => onNavigate('next')}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
              }}
            >
              <NextIcon />
            </IconButton>
          )}

          {/* Top Controls */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              gap: 1
            }}
          >
            <Tooltip title="Toggle Info (i)">
              <IconButton
                onClick={() => setShowMetadataOverlay(prev => !prev)}
                sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)' }}
              >
                <InfoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Toggle Fullscreen (f)">
              <IconButton
                onClick={toggleFullscreen}
                sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)' }}
              >
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close (Esc)">
              <IconButton
                onClick={() => setIsZoomed(false)}
                sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)' }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <img
            src={photo.url}
            alt={photo.caption || 'Inspection photo'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />

          {renderMetadataOverlay()}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PhotoDisplay;
