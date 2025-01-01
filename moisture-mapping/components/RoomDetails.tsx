import React from 'react';
import { 
  Paper, 
  Grid, 
  TextField 
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import { useAustralianTerms } from '../hooks/useAustralianTerms';

interface RoomDetailsProps {
  roomName: string;
  roomDescription: string;
  onRoomNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRoomDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function RoomDetails({
  roomName,
  roomDescription,
  onRoomNameChange,
  onRoomDescriptionChange
}: RoomDetailsProps) {
  const { getPlaceholder } = useAustralianTerms();
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={getPlaceholder('roomName')}
            value={roomName}
            onChange={onRoomNameChange}
            variant="outlined"
            placeholder={getPlaceholder('roomName')}
            InputProps={{
              startAdornment: <HomeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={getPlaceholder('roomDescription')}
            value={roomDescription}
            onChange={onRoomDescriptionChange}
            variant="outlined"
            placeholder={getPlaceholder('roomDescription')}
            multiline
            rows={1}
            InputProps={{
              startAdornment: <DescriptionIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
