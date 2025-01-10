'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  Chip,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  QrCode as QrCodeIcon,
  Link as LinkIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { VoiceNote } from '../types/voice';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  notes: VoiceNote[];
  onGenerateShareLink: (notes: VoiceNote[], settings: ShareSettings) => Promise<string>;
  onRevokeAccess?: (shareId: string) => Promise<void>;
}

interface ShareSettings {
  expiresIn: number; // hours
  allowDownload: boolean;
  allowComments: boolean;
  password?: string;
  watermark?: string;
}

interface ShareRecord {
  id: string;
  url: string;
  createdAt: string;
  expiresAt: string;
  settings: ShareSettings;
  accessCount: number;
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onClose,
  notes,
  onGenerateShareLink,
  onRevokeAccess
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState<ShareSettings>({
    expiresIn: 24,
    allowDownload: true,
    allowComments: false
  });
  const [shareRecords, setShareRecords] = useState<ShareRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleGenerateLink = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = await onGenerateShareLink(notes, settings);
      setShareUrl(url);
      
      const newRecord: ShareRecord = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + settings.expiresIn * 3600000).toISOString(),
        settings,
        accessCount: 0
      };
      
      setShareRecords(prev => [...prev, newRecord]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setError('Failed to copy link to clipboard');
    }
  };

  const handleRevokeAccess = async (shareId: string) => {
    if (!onRevokeAccess) return;
    
    try {
      setLoading(true);
      await onRevokeAccess(shareId);
      setShareRecords(prev => prev.filter(record => record.id !== shareId));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to revoke access');
    } finally {
      setLoading(false);
    }
  };

  const formatExpiry = (date: string) => {
    const expiry = new Date(date);
    const now = new Date();
    const hours = Math.round((expiry.getTime() - now.getTime()) / 3600000);
    
    if (hours < 1) return 'Expires soon';
    if (hours < 24) return `Expires in ${hours} hours`;
    return `Expires in ${Math.round(hours / 24)} days`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShareIcon />
          Share {notes.length} {notes.length === 1 ? 'Note' : 'Notes'}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Share Link" />
          <Tab label="Settings" />
          <Tab label="Active Links" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeTab === 0 && (
          <Box>
            {shareUrl ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  value={shareUrl}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <Tooltip title={copied ? 'Copied!' : 'Copy Link'}>
                        <IconButton onClick={handleCopyLink}>
                          {copied ? <CheckIcon color="success" /> : <CopyIcon />}
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<QrCodeIcon />}
                  >
                    Show QR Code
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    onClick={() => setActiveTab(1)}
                  >
                    Adjust Settings
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" gutterBottom>
                  Generate a link to share these notes with others
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleGenerateLink}
                  disabled={loading}
                  startIcon={<LinkIcon />}
                >
                  Generate Share Link
                </Button>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Link Expires In"
              value={settings.expiresIn}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                expiresIn: Number(e.target.value)
              }))}
              SelectProps={{ native: true }}
            >
              <option value={1}>1 hour</option>
              <option value={24}>24 hours</option>
              <option value={72}>3 days</option>
              <option value={168}>7 days</option>
              <option value={720}>30 days</option>
            </TextField>

            <TextField
              label="Password (Optional)"
              type="password"
              value={settings.password || ''}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                password: e.target.value || undefined
              }))}
            />

            <TextField
              label="Watermark (Optional)"
              value={settings.watermark || ''}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                watermark: e.target.value || undefined
              }))}
              helperText="Text to overlay on shared notes"
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2">Permissions</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Allow Download</Typography>
                <Switch
                  checked={settings.allowDownload}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    allowDownload: e.target.checked
                  }))}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Allow Comments</Typography>
                <Switch
                  checked={settings.allowComments}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    allowComments: e.target.checked
                  }))}
                />
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 2 && (
          <List>
            {shareRecords.map(record => (
              <ListItem key={record.id}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" component="span">
                        {record.url}
                      </Typography>
                      <Chip
                        label={formatExpiry(record.expiresAt)}
                        size="small"
                        color={
                          new Date(record.expiresAt).getTime() - Date.now() < 86400000
                            ? 'error'
                            : 'default'
                        }
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      Created {new Date(record.createdAt).toLocaleDateString()} • 
                      {record.accessCount} views
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Revoke Access">
                    <IconButton
                      edge="end"
                      onClick={() => handleRevokeAccess(record.id)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {shareRecords.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No active share links
              </Typography>
            )}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareDialog;
