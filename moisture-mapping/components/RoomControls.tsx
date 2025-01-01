import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import { useAustralianTerms } from '../hooks/useAustralianTerms';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import MicIcon from '@mui/icons-material/Mic';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TabPanel from './TabPanel';
import PhotoCapture from './PhotoCapture';
import ImageUpload from './ImageUpload';
import AIAnalysis from './AIAnalysis';
import PWAStatus from './PWAStatus';

interface RoomControlsProps {
  activeTab: number;
  onTabChange: (newValue: number) => void;
  onPhotoCapture: (photoData: string) => void;
  onImageUpload: (file: File) => Promise<void>;
  isProcessing: boolean;
  uploadedImage: string | null;
}

export default function RoomControls({
  activeTab,
  onTabChange,
  onPhotoCapture,
  onImageUpload,
  isProcessing,
  uploadedImage
}: RoomControlsProps) {
  const { getActionText, getAustralianTerm } = useAustralianTerms();
  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => onTabChange(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="controls tabs"
        >
          <Tab 
            icon={<CameraAltIcon />} 
            label={getActionText('takePhoto')} 
            id="controls-tab-0"
            aria-controls="controls-tabpanel-0"
          />
          <Tab 
            icon={<PhotoLibraryIcon />} 
            label={getActionText('uploadPhoto')} 
            id="controls-tab-1"
            aria-controls="controls-tabpanel-1"
          />
          <Tab 
            icon={<MicIcon />} 
            label="Voice Input" 
            id="controls-tab-2"
            aria-controls="controls-tabpanel-2"
          />
          <Tab 
            icon={<SmartToyIcon />} 
            label="AI" 
            id="controls-tab-3"
            aria-controls="controls-tabpanel-3"
          />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Typography variant="subtitle1" gutterBottom>
          {getActionText('takePhoto')}
        </Typography>
        <PhotoCapture onPhotoCapture={onPhotoCapture} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Typography variant="subtitle1" gutterBottom>
          {getActionText('uploadPhoto')}
        </Typography>
        <ImageUpload 
          onImageUpload={onImageUpload}
          isProcessing={isProcessing}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Typography variant="subtitle1" gutterBottom>
          Voice Input Controls
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Paper 
            sx={{ 
              p: 1, 
              flex: 1,
              minWidth: '100px',
              textAlign: 'center',
              bgcolor: '#e3f2fd',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: '#bbdefb'
              },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}
          >
            <MicIcon fontSize="small" />
            {getActionText('startRecording')}
          </Paper>
          <Paper 
            sx={{ 
              p: 1, 
              flex: 1,
              minWidth: '100px',
              textAlign: 'center',
              bgcolor: '#ffebee',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: '#ffcdd2'
              },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}
          >
            <MicIcon fontSize="small" />
            {getActionText('stopRecording')}
          </Paper>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Typography variant="subtitle1" gutterBottom>
          Smart Analysis
        </Typography>
        <AIAnalysis imageUrl={uploadedImage} />
      </TabPanel>

      <Box sx={{ mt: 2, borderTop: 1, borderColor: 'divider', pt: 2 }}>
        <PWAStatus />
      </Box>
    </Paper>
  );
}
