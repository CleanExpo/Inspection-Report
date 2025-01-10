"use client";

import React, { useState } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
  Chip,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Alert,
  IconButton,
  Tooltip
} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import { DEFAULT_HAZARDOUS_MATERIALS, type HazardousMaterial } from "../app/types/hazard";

interface HazardousMaterialsProps {
  onSelectionChange?: (materials: HazardousMaterial[]) => void;
  className?: string;
}

const HazardousMaterials: React.FC<HazardousMaterialsProps> = ({
  onSelectionChange,
  className = ""
}) => {
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(new Set());
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);

  const handleMaterialToggle = (materialId: string) => {
    const newSelected = new Set(selectedMaterials);
    if (newSelected.has(materialId)) {
      newSelected.delete(materialId);
    } else {
      newSelected.add(materialId);
    }
    setSelectedMaterials(newSelected);

    if (onSelectionChange) {
      const selectedMaterialObjects = DEFAULT_HAZARDOUS_MATERIALS.filter(m =>
        newSelected.has(m.id)
      );
      onSelectionChange(selectedMaterialObjects);
    }
  };

  const handleMaterialClick = (materialId: string) => {
    setExpandedMaterial(expandedMaterial === materialId ? null : materialId);
  };

  const getRiskColor = (level: HazardousMaterial['riskLevel']): "error" | "warning" | "info" | "success" => {
    switch (level) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
    }
  };

  return (
    <Box>
      {selectedMaterials.size > 0 && (
        <Alert 
          severity="warning" 
          icon={<WarningIcon />}
          sx={{ mb: 3 }}
        >
          {selectedMaterials.size} hazardous material{selectedMaterials.size > 1 ? 's' : ''} identified - Requires immediate attention and proper safety protocols
        </Alert>
      )}

      <List>
        {DEFAULT_HAZARDOUS_MATERIALS.map((material) => (
          <Paper 
            key={material.id} 
            sx={{ 
              mb: 2,
              p: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedMaterials.has(material.id)}
                      onChange={() => handleMaterialToggle(material.id)}
                    />
                  }
                  label={material.name}
                />
                <Tooltip title="View details">
                  <IconButton 
                    size="small" 
                    onClick={() => handleMaterialClick(material.id)}
                    sx={{ ml: 1 }}
                  >
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Chip
                label={material.riskLevel.toUpperCase()}
                color={getRiskColor(material.riskLevel)}
                size="small"
              />
            </Box>

            <Typography variant="body2" color="text.secondary">
              {material.description}
            </Typography>

            <Collapse in={expandedMaterial === material.id}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Control Measures:
                </Typography>
                <List dense>
                  {material.controlMeasures.map((measure, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={measure} />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="subtitle2" gutterBottom>
                  Required PPE:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {material.ppe.map((ppe, index) => (
                    <Chip
                      key={index}
                      label={ppe}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  Handling Procedures:
                </Typography>
                <List dense>
                  {material.handlingProcedures.map((procedure, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={procedure} />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="subtitle2" gutterBottom>
                  Disposal Requirements:
                </Typography>
                <List dense>
                  {material.disposalRequirements.map((requirement, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={requirement} />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="subtitle2" gutterBottom>
                  Emergency Procedures:
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body2" color="error" gutterBottom>
                    First Aid:
                  </Typography>
                  <List dense>
                    {material.emergencyProcedures.firstAid.map((procedure, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={procedure} />
                      </ListItem>
                    ))}
                  </List>

                  <Typography variant="body2" color="warning.main" gutterBottom>
                    Spillage:
                  </Typography>
                  <List dense>
                    {material.emergencyProcedures.spillage.map((procedure, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={procedure} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>
            </Collapse>
          </Paper>
        ))}
      </List>
    </Box>
  );
}

export default HazardousMaterials;
