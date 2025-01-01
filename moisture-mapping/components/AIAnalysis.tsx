import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText,
  ListItemIcon,
  Alert,
  Chip,
  Divider,
  Grid,
  Tooltip
} from '@mui/material';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import WaterDamageIcon from '@mui/icons-material/WaterDrop';
import BuildIcon from '@mui/icons-material/Build';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimelineIcon from '@mui/icons-material/Timeline';
import { MoistureReading, MATERIAL_GUIDELINES } from '../types/moisture';

interface AIAnalysisProps {
  imageUrl: string | null;
  moistureReading?: MoistureReading;
  historicalReadings?: MoistureReading[];
}

interface Detection {
  class: string;
  score: number;
  bbox: [number, number, number, number];
}

interface AnalysisResult {
  detections: Detection[];
  materialType?: string;
  damagePatterns: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export default function AIAnalysis({ 
  imageUrl, 
  moistureReading,
  historicalReadings 
}: AIAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Material recognition patterns
  const materialPatterns = {
    'wall': ['drywall', 'plaster'],
    'floor': ['wood', 'carpet', 'tile'],
    'ceiling': ['drywall', 'plaster'],
    'furniture': ['wood'],
    'cabinet': ['wood'],
  };

  // Damage patterns to look for
  const damagePatterns = {
    'water stain': 'Visible water staining indicates active or previous water intrusion',
    'discoloration': 'Discoloration may indicate hidden moisture damage',
    'swelling': 'Material swelling suggests prolonged moisture exposure',
    'mold': 'Possible mold growth detected - further inspection recommended',
  };

  const analyzeDamagePatterns = (detections: Detection[]): string[] => {
    const patterns: string[] = [];
    
    // Look for visual indicators of water damage
    detections.forEach(detection => {
      Object.keys(damagePatterns).forEach(pattern => {
        if (detection.class.toLowerCase().includes(pattern)) {
          patterns.push(damagePatterns[pattern as keyof typeof damagePatterns]);
        }
      });
    });

    // Analyze moisture reading if available
    if (moistureReading) {
      const guidelines = MATERIAL_GUIDELINES[moistureReading.materialType as keyof typeof MATERIAL_GUIDELINES];
      if (guidelines && moistureReading.value > guidelines.criticalThreshold) {
        patterns.push(`Critical moisture levels detected (${moistureReading.value}%) - immediate action required`);
      }
    }

    return patterns;
  };

  const generateRecommendations = (
    detections: Detection[], 
    patterns: string[],
    materialType?: string
  ): string[] => {
    const recommendations: string[] = [];

    // Material-specific recommendations
    if (materialType && moistureReading) {
      const guidelines = MATERIAL_GUIDELINES[materialType as keyof typeof MATERIAL_GUIDELINES];
      if (guidelines) {
        if (moistureReading.value > guidelines.criticalThreshold) {
          recommendations.push(guidelines.remediation);
        }
      }
    }

    // Pattern-based recommendations
    if (patterns.some(p => p.includes('mold'))) {
      recommendations.push('Schedule professional mold inspection');
      recommendations.push('Implement containment measures if needed');
    }

    if (patterns.some(p => p.includes('water intrusion'))) {
      recommendations.push('Identify and address water source');
      recommendations.push('Check surrounding areas for hidden damage');
    }

    // Add general recommendations if none specific
    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring moisture levels');
      recommendations.push('Document changes in material condition');
    }

    return recommendations;
  };

  const determineRiskLevel = (
    detections: Detection[], 
    patterns: string[],
    reading?: MoistureReading
  ): 'low' | 'medium' | 'high' => {
    if (!reading) return 'medium';

    const guidelines = MATERIAL_GUIDELINES[reading.materialType as keyof typeof MATERIAL_GUIDELINES];
    if (!guidelines) return 'medium';

    if (reading.value > guidelines.criticalThreshold || patterns.some(p => p.includes('mold'))) {
      return 'high';
    }

    if (reading.value > guidelines.warningThreshold || patterns.length > 0) {
      return 'medium';
    }

    return 'low';
  };

  useEffect(() => {
    if (!imageUrl) {
      setAnalysis(null);
      setError(null);
      return;
    }

    const analyzeImage = async () => {
      try {
        setIsAnalyzing(true);
        setError(null);

        // Load the COCO-SSD model
        const model = await cocoSsd.load();

        // Load and process the image
        const img = new Image();
        img.src = imageUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        // Run object detection
        const detections = await model.detect(img) as Detection[];

        // Determine material type from detections
        let detectedMaterial: string | undefined;
        for (const detection of detections) {
          for (const [surface, materials] of Object.entries(materialPatterns)) {
            if (detection.class.toLowerCase().includes(surface)) {
              detectedMaterial = materials[0]; // Default to first material type
              break;
            }
          }
          if (detectedMaterial) break;
        }

        // Analyze damage patterns
        const patterns = analyzeDamagePatterns(detections);

        // Generate recommendations
        const recommendations = generateRecommendations(detections, patterns, detectedMaterial);

        // Determine risk level
        const riskLevel = determineRiskLevel(detections, patterns, moistureReading);

        setAnalysis({
          detections,
          materialType: detectedMaterial,
          damagePatterns: patterns,
          recommendations,
          riskLevel
        });
      } catch (err) {
        console.error('Error analyzing image:', err);
        setError('Failed to analyze image. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeImage();
  }, [imageUrl, moistureReading]);

  if (!imageUrl) {
    return (
      <Paper sx={{ p: 2, bgcolor: '#fafafa' }}>
        <Typography variant="body2" color="text.secondary">
          Upload a photo to see AI analysis
        </Typography>
      </Paper>
    );
  }

  if (isAnalyzing) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <CircularProgress size={24} sx={{ mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Analyzing image and moisture patterns...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  if (!analysis) return null;

  return (
    <Paper sx={{ p: 2 }}>
      {/* Risk Level Indicator */}
      <Alert 
        severity={analysis.riskLevel === 'high' ? 'error' : analysis.riskLevel === 'medium' ? 'warning' : 'success'}
        sx={{ mb: 2 }}
      >
        <Typography variant="subtitle2">
          Risk Level: {analysis.riskLevel.toUpperCase()}
        </Typography>
      </Alert>

      <Grid container spacing={2}>
        {/* Material Detection */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BuildIcon fontSize="small" />
            Material Analysis
          </Typography>
          {analysis.materialType ? (
            <Chip 
              label={`Detected Material: ${analysis.materialType}`}
              color="primary"
              size="small"
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              No specific material detected
            </Typography>
          )}
        </Grid>

        {/* Damage Patterns */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WaterDamageIcon fontSize="small" />
            Damage Patterns
          </Typography>
          <List dense>
            {analysis.damagePatterns.map((pattern, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <WarningIcon color="warning" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={pattern} />
              </ListItem>
            ))}
          </List>
        </Grid>

        {/* Historical Comparison */}
        {historicalReadings && historicalReadings.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimelineIcon fontSize="small" />
              Historical Comparison
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2">
                Previous reading: {historicalReadings[historicalReadings.length - 1].value}%
                {moistureReading && (
                  <Chip 
                    size="small"
                    label={`${(moistureReading.value - historicalReadings[historicalReadings.length - 1].value).toFixed(1)}% change`}
                    color={moistureReading.value < historicalReadings[historicalReadings.length - 1].value ? 'success' : 'error'}
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Recommendations */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon fontSize="small" />
            Recommendations
          </Typography>
          <List dense>
            {analysis.recommendations.map((recommendation, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircleIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={recommendation} />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    </Paper>
  );
}
