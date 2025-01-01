import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  Videocam as VideoIcon,
  PhotoCamera as CameraIcon,
  AttachFile as AttachIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  Label as TagIcon
} from '@mui/icons-material';

interface MediaItem {
  id: string;
  type: 'audio' | 'video' | 'photo' | 'document';
  url: string;
  thumbnail?: string;
  title: string;
  timestamp: string;
  duration?: number;
  size: number;
  tags: string[];
  notes?: string;
  location?: {
    x: number;
    y: number;
    z: number;
  };
}

interface MediaManagerProps {
  onMediaCapture: (media: MediaItem) => void;
  onMediaDelete: (id: string) => void;
  onMediaUpdate: (media: MediaItem) => void;
}

export default function MediaManager({
  onMediaCapture,
  onMediaDelete,
  onMediaUpdate
}: MediaManagerProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Audio Recording
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      audioRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      audioRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const newMedia: MediaItem = {
          id: `audio-${Date.now()}`,
          type: 'audio',
          url,
          title: `Audio Note ${mediaItems.length + 1}`,
          timestamp: new Date().toISOString(),
          size: blob.size,
          tags: ['audio', 'field-note'],
          duration: 0 // Will be updated when metadata is loaded
        };
        setMediaItems(prev => [...prev, newMedia]);
        onMediaCapture(newMedia);
      };

      audioRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting audio recording:', err);
      setError('Failed to start audio recording. Please check microphone permissions.');
    }
  };

  // Video Recording
  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }, 
        audio: true 
      });
      videoRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      videoRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      videoRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const newMedia: MediaItem = {
          id: `video-${Date.now()}`,
          type: 'video',
          url,
          title: `Video Recording ${mediaItems.length + 1}`,
          timestamp: new Date().toISOString(),
          size: blob.size,
          tags: ['video', 'inspection'],
          duration: 0 // Will be updated when metadata is loaded
        };
        setMediaItems(prev => [...prev, newMedia]);
        onMediaCapture(newMedia);
      };

      videoRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting video recording:', err);
      setError('Failed to start video recording. Please check camera permissions.');
    }
  };

  const stopRecording = () => {
    if (audioRecorderRef.current && audioRecorderRef.current.state === 'recording') {
      audioRecorderRef.current.stop();
      audioRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (videoRecorderRef.current && videoRecorderRef.current.state === 'recording') {
      videoRecorderRef.current.stop();
      videoRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  };

  // Photo Capture
  const capturePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      stream.getTracks().forEach(track => track.stop());

      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.95)
      );
      
      const url = URL.createObjectURL(blob);
      const newMedia: MediaItem = {
        id: `photo-${Date.now()}`,
        type: 'photo',
        url,
        thumbnail: url,
        title: `Photo ${mediaItems.length + 1}`,
        timestamp: new Date().toISOString(),
        size: blob.size,
        tags: ['photo', 'inspection']
      };
      
      setMediaItems(prev => [...prev, newMedia]);
      onMediaCapture(newMedia);
    } catch (err) {
      console.error('Error capturing photo:', err);
      setError('Failed to capture photo. Please check camera permissions.');
    }
  };

  // Document Attachment
  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const newMedia: MediaItem = {
      id: `doc-${Date.now()}`,
      type: 'document',
      url,
      title: file.name,
      timestamp: new Date().toISOString(),
      size: file.size,
      tags: ['document']
    };

    setMediaItems(prev => [...prev, newMedia]);
    onMediaCapture(newMedia);
  };

  const handleEditSave = (editedItem: MediaItem) => {
    setMediaItems(prev => 
      prev.map(item => item.id === editedItem.id ? editedItem : item)
    );
    onMediaUpdate(editedItem);
    setEditDialog(false);
  };

  const handleDelete = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
    onMediaDelete(id);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Media & Documentation
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Tooltip title={isRecording ? "Stop Recording" : "Record Audio Note"}>
          <IconButton
            color={isRecording ? "error" : "default"}
            onClick={isRecording ? stopRecording : startAudioRecording}
          >
            {isRecording ? <StopIcon /> : <MicIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title={isRecording ? "Stop Recording" : "Record Video"}>
          <IconButton
            color={isRecording ? "error" : "default"}
            onClick={isRecording ? stopRecording : startVideoRecording}
          >
            {isRecording ? <StopIcon /> : <VideoIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Take Photo">
          <IconButton onClick={capturePhoto}>
            <CameraIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Attach Document">
          <IconButton component="label">
            <AttachIcon />
            <input
              type="file"
              hidden
              onChange={handleFileAttachment}
              accept=".pdf,.doc,.docx,.txt"
            />
          </IconButton>
        </Tooltip>
      </Stack>

      <List>
        {mediaItems.map((item) => (
          <ListItemButton
            key={item.id}
            selected={selectedItem?.id === item.id}
            onClick={() => setSelectedItem(item)}
          >
            <ListItemIcon>
              {item.type === 'audio' && <MicIcon />}
              {item.type === 'video' && <VideoIcon />}
              {item.type === 'photo' && <CameraIcon />}
              {item.type === 'document' && <AttachIcon />}
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              secondary={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption">
                    {new Date(item.timestamp).toLocaleString()}
                  </Typography>
                  {item.tags.map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20 }}
                    />
                  ))}
                </Stack>
              }
            />
            <Stack direction="row" spacing={1}>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem(item);
                    setEditDialog(true);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </ListItemButton>
        ))}
      </List>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Edit Media Details</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Title"
                fullWidth
                value={selectedItem.title}
                onChange={(e) => setSelectedItem({
                  ...selectedItem,
                  title: e.target.value
                })}
              />
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={3}
                value={selectedItem.notes || ''}
                onChange={(e) => setSelectedItem({
                  ...selectedItem,
                  notes: e.target.value
                })}
              />
              <TextField
                label="Tags (comma separated)"
                fullWidth
                value={selectedItem.tags.join(', ')}
                onChange={(e) => setSelectedItem({
                  ...selectedItem,
                  tags: e.target.value.split(',').map(tag => tag.trim())
                })}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => selectedItem && handleEditSave(selectedItem)}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {loading && (
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.8)'
        }}>
          <CircularProgress />
        </Box>
      )}
    </Paper>
  );
}
