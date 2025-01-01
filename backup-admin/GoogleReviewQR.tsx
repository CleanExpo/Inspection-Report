import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Box, Typography, Paper, Button } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import DownloadIcon from '@mui/icons-material/Download';

interface GoogleReviewQRProps {
  reviewLink: string;
  businessName: string;
}

const GoogleReviewQR: React.FC<GoogleReviewQRProps> = ({ reviewLink, businessName }) => {
  const handleDownload = () => {
    const svg = document.getElementById('google-review-qr');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${businessName}-google-review-qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        textAlign: 'center',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default'
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Google Review QR Code
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Scan to leave a review for {businessName}
        </Typography>
      </Box>

      <Box 
        sx={{ 
          display: 'flex',
          justifyContent: 'center',
          mb: 3
        }}
      >
        <Paper 
          elevation={3}
          sx={{ 
            p: 3,
            bgcolor: 'white',
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <QRCodeSVG
            id="google-review-qr"
            value={reviewLink}
            size={200}
            level="H"
            includeMargin={true}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarIcon sx={{ color: '#FBC02D' }} />
            <Typography variant="body2" color="text.secondary">
              Rate us on Google
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={handleDownload}
        size="small"
      >
        Download QR Code
      </Button>
    </Paper>
  );
};

export default GoogleReviewQR;
