'use client';
import React from 'react';
import {
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Search as FindingsIcon,
  Warning as CriticalIcon,
  PlaylistAddCheck as StepsIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  ErrorOutline as ErrorIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

export type Priority = 'low' | 'medium' | 'high';

interface Finding {
  text: string;
  priority?: Priority;
  timestamp?: string;
}

interface AIAnalysisDisplayProps {
  keyFindings?: Finding[];
  criticalIssues?: Finding[];
  nextSteps?: Finding[];
  expanded?: boolean;
  onToggle?: () => void;
  isLoading?: boolean;
  error?: string;
  lastUpdated?: string;
}

const priorityColors: Record<Priority, string> = {
  low: 'success.main',
  medium: 'warning.main',
  high: 'error.main'
};

const AIAnalysisDisplay: React.FC<AIAnalysisDisplayProps> = ({
  keyFindings = [],
  criticalIssues = [],
  nextSteps = [],
  expanded = false,
  onToggle,
  isLoading = false,
  error,
  lastUpdated
}) => {
  const hasAnalysis = keyFindings.length > 0 || criticalIssues.length > 0 || nextSteps.length > 0;

  if (error) {
    return (
      <Alert 
        severity="error" 
        icon={<ErrorIcon />}
        sx={{ mt: 1 }}
      >
        {error}
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!hasAnalysis) return null;

  const renderFindingList = (
    items: Finding[],
    icon: React.ReactNode,
    title: string,
    color?: string
  ) => (
    <List dense disablePadding sx={{ mt: 1 }}>
      <ListItem>
        <ListItemIcon sx={{ minWidth: 36 }}>
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={title}
          primaryTypographyProps={{
            variant: 'body2',
            color: color || 'text.secondary'
          }}
        />
      </ListItem>
      {items.map((item, index) => (
        <ListItem 
          key={index} 
          sx={{ pl: 4 }}
          role="listitem"
          aria-label={`${title} item ${index + 1}`}
        >
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="body2"
                  color={item.priority ? priorityColors[item.priority] : 'inherit'}
                >
                  {item.text}
                </Typography>
                {item.timestamp && (
                  <Tooltip title={new Date(item.timestamp).toLocaleString()}>
                    <TimeIcon 
                      fontSize="small" 
                      sx={{ color: 'text.secondary', opacity: 0.7 }}
                    />
                  </Tooltip>
                )}
              </Box>
            }
            primaryTypographyProps={{
              variant: 'body2'
            }}
          />
        </ListItem>
      ))}
    </List>
  );

  return (
    <Paper 
      variant="outlined" 
      sx={{ mt: 1, p: 1 }}
      role="region"
      aria-label="AI Analysis Results"
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            AI Analysis
          </Typography>
          {criticalIssues.length > 0 && (
            <Chip
              label={`${criticalIssues.length} Critical`}
              size="small"
              color="error"
              variant="outlined"
            />
          )}
          {lastUpdated && (
            <Tooltip title={`Last updated: ${new Date(lastUpdated).toLocaleString()}`}>
              <Typography variant="caption" color="text.secondary">
                Updated {new Date(lastUpdated).toLocaleDateString()}
              </Typography>
            </Tooltip>
          )}
        </Box>
        <IconButton
          size="small"
          onClick={onToggle}
          sx={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
          aria-expanded={expanded}
          aria-label="Toggle analysis details"
        >
          {expanded ? <CollapseIcon /> : <ExpandIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 1 }}>
          {keyFindings.length > 0 && renderFindingList(
            keyFindings,
            <FindingsIcon color="primary" fontSize="small" />,
            'Key Findings'
          )}

          {criticalIssues.length > 0 && renderFindingList(
            criticalIssues,
            <CriticalIcon color="error" fontSize="small" />,
            'Critical Issues',
            'error.main'
          )}

          {nextSteps.length > 0 && renderFindingList(
            nextSteps,
            <StepsIcon color="info" fontSize="small" />,
            'Next Steps'
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AIAnalysisDisplay;
