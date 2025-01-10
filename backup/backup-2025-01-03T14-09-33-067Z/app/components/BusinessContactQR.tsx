import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';

interface BusinessContactQRProps {
  businessName: string;
}

const BusinessContactQR: React.FC<BusinessContactQRProps> = ({ businessName }) => {
  // Create vCard format string
  const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:Disaster Recovery Qld
ORG:Disaster Recovery Qld
TITLE:Water, Mould, Fire, Bio Hazard Services
TEL;TYPE=work,voice:1300 309 361
EMAIL;TYPE=work:admin@disasterrecovery.com.au
URL:http://www.disasterrecovery.com.au
NOTE:Disaster Recovery Qld specializes in insurance restoration services, providing expert solutions for water damage, mould remediation, fire damage restoration, and bio-hazard cleanup. As a trusted partner in the insurance restoration industry, we work closely with insurance companies and property owners to restore properties to their pre-loss condition using advanced techniques and professional equipment.
END:VCARD`;

  const handleDownload = () => {
    const svg = document.getElementById('business-contact-qr');
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
        downloadLink.download = `${businessName}-contact.png`;
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
          Business Contact Information
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Scan to save our contact details to your phone
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
            gap: 2,
            maxWidth: '100%'
          }}
        >
          <QRCodeSVG
            id="business-contact-qr"
            value={vCardData}
            size={200}
            level="H"
            includeMargin={true}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ContactPhoneIcon sx={{ color: 'primary.main' }} />
            <Typography variant="body2" color="text.secondary">
              Save to Contacts
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

      <Box sx={{ mt: 4, textAlign: 'left' }}>
        <Typography variant="subtitle1" gutterBottom color="primary">
          About Our Services
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Disaster Recovery Qld is your trusted partner in the insurance restoration industry. We specialize in:
        </Typography>
        <Box component="ul" sx={{ pl: 2, color: 'text.secondary' }}>
          <Typography component="li" variant="body2">Water Damage Restoration</Typography>
          <Typography component="li" variant="body2">Mould Remediation</Typography>
          <Typography component="li" variant="body2">Fire Damage Recovery</Typography>
          <Typography component="li" variant="body2">Bio-Hazard Cleanup</Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Working closely with insurance companies and property owners, we utilize advanced techniques and professional equipment to restore properties to their pre-loss condition. Our experienced team is available 24/7 to respond to emergencies and provide expert solutions for all your restoration needs.
        </Typography>
      </Box>
    </Paper>
  );
};

export default BusinessContactQR;
