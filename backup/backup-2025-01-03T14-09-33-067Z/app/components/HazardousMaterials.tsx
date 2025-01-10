'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import type { HazardousMaterial } from '../types/hazard';
import { DEFAULT_HAZARDOUS_MATERIALS, RISK_LEVEL_INFO } from '../types/hazard';

interface HazardousMaterialsProps {
  onSelectionChange: (materials: HazardousMaterial[]) => void;
}

export default function HazardousMaterials({ onSelectionChange }: HazardousMaterialsProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<HazardousMaterial[]>([]);
  const [detailsMaterial, setDetailsMaterial] = useState<HazardousMaterial | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleToggleMaterial = (material: HazardousMaterial) => {
    let newSelected: HazardousMaterial[];
    if (selectedMaterials.find(m => m.id === material.id)) {
      newSelected = selectedMaterials.filter(m => m.id !== material.id);
    } else {
      newSelected = [...selectedMaterials, material];
    }
    setSelectedMaterials(newSelected);
    onSelectionChange(newSelected);
  };

  const handleShowDetails = (material: HazardousMaterial) => {
    setDetailsMaterial(material);
    setOpenDialog(true);
  };

  const getRiskLevelChip = (riskLevel: HazardousMaterial['riskLevel']) => {
    const info = RISK_LEVEL_INFO[riskLevel];
    return (
      <Chip
        label={info.label}
        color={info.color}
        size="small"
        icon={riskLevel === 'critical' || riskLevel === 'high' ? <WarningIcon /> : undefined}
      />
    );
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {DEFAULT_HAZARDOUS_MATERIALS.map((material) => (
          <Grid item xs={12} key={material.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" component="div">
                    {material.name}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getRiskLevelChip(material.riskLevel)}
                    <IconButton
                      onClick={() => handleToggleMaterial(material)}
                      color={selectedMaterials.find(m => m.id === material.id) ? 'error' : 'primary'}
                    >
                      {selectedMaterials.find(m => m.id === material.id) ? (
                        <RemoveIcon />
                      ) : (
                        <AddIcon />
                      )}
                    </IconButton>
                    <Tooltip title="View Details">
                      <IconButton onClick={() => handleShowDetails(material)}>
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography color="text.secondary" paragraph>
                  {material.description}
                </Typography>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Required Safety Measures</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          PPE Requirements:
                        </Typography>
                        <List dense>
                          {material.ppe.map((item, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={item} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Control Measures:
                        </Typography>
                        <List dense>
                          {material.controlMeasures.map((item, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={item} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {detailsMaterial && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                {detailsMaterial.name}
                {getRiskLevelChip(detailsMaterial.riskLevel)}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Risk Level Information:
                </Typography>
                {RISK_LEVEL_INFO[detailsMaterial.riskLevel].description}
              </Alert>

              <Typography variant="h6" gutterBottom>
                Handling Procedures
              </Typography>
              <List dense>
                {detailsMaterial.handlingProcedures.map((procedure, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={procedure} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" gutterBottom>
                Emergency Procedures
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    First Aid:
                  </Typography>
                  <List dense>
                    {detailsMaterial.emergencyProcedures.firstAid.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Spillage:
                  </Typography>
                  <List dense>
                    {detailsMaterial.emergencyProcedures.spillage.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Fire:
                  </Typography>
                  <List dense>
                    {detailsMaterial.emergencyProcedures.fire.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Regulatory Information
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Code: {detailsMaterial.regulatoryInfo.code}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Regulations:
              </Typography>
              <List dense>
                {detailsMaterial.regulatoryInfo.regulations.map((reg, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={reg} />
                  </ListItem>
                ))}
              </List>
              <Typography variant="subtitle2" gutterBottom>
                Required Permits:
              </Typography>
              <List dense>
                {detailsMaterial.regulatoryInfo.permits.map((permit, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={permit} />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
