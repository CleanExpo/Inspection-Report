import React, { useMemo, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  LinearProgress,
  Button,
  Tooltip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LockIcon from '@mui/icons-material/Lock';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { TrainingModule, TrainingCategory } from '../types/training';
import { useTraining } from '../hooks/useTraining';
import { trainingModules } from '../data/trainingModules';

interface TrainingModuleListProps {
  userId: string;
  onSelectModule: (module: TrainingModule) => void;
}

export default function TrainingModuleList({
  userId,
  onSelectModule
}: TrainingModuleListProps) {
  const [filter, setFilter] = useState<'all' | TrainingCategory>('all');
  const { 
    userTraining, 
    getModuleProgress, 
    getNextModule 
  } = useTraining(userId);

  const nextModule = getNextModule();

  const getModuleStatus = (module: TrainingModule) => {
    const progress = getModuleProgress(module.id);
    if (progress.completed) {
      return {
        icon: <CheckCircleIcon color="success" />,
        label: 'Completed',
        color: 'success' as const
      };
    }

    if (progress.completedSteps.length > 0) {
      return {
        icon: <PlayArrowIcon color="primary" />,
        label: 'In Progress',
        color: 'primary' as const
      };
    }

    if (module.requiredForCertification) {
      return {
        icon: <LockIcon color="warning" />,
        label: 'Required',
        color: 'warning' as const
      };
    }

    return {
      icon: <AccessTimeIcon color="info" />,
      label: 'Not Started',
      color: 'default' as const
    };
  };

  const calculateProgress = (module: TrainingModule) => {
    const progress = getModuleProgress(module.id);
    return (progress.completedSteps.length / module.steps.length) * 100;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <SchoolIcon fontSize="large" />
          <Typography variant="h5">Training Modules</Typography>
        </Box>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="category-filter-label">
            <FilterListIcon fontSize="small" sx={{ mr: 1 }} />
            Filter
          </InputLabel>
          <Select
            labelId="category-filter-label"
            value={filter}
            label="Filter"
            onChange={(e) => setFilter(e.target.value as typeof filter)}
          >
            <MenuItem value="all">All Modules</MenuItem>
            <MenuItem value="basics">Basics</MenuItem>
            <MenuItem value="equipment">Equipment</MenuItem>
            <MenuItem value="safety">Safety</MenuItem>
            <MenuItem value="bestPractices">Best Practices</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Overall Progress</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {['basics', 'equipment', 'safety', 'bestPractices'].map(category => {
              const modules = trainingModules.filter(m => m.category === category);
              const completed = modules.filter(m => getModuleProgress(m.id).completed).length;
              const percentage = (completed / modules.length) * 100;
              
              return (
                <Box key={category} sx={{ flexGrow: 1, minWidth: 150 }}>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize', mb: 1 }}>
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress
                      variant="determinate"
                      value={percentage}
                      size={60}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" component="div" color="text.secondary">
                        {`${Math.round(percentage)}%`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Paper>
      </Box>

      {nextModule && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Recommended Next Module:
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2,
              bgcolor: 'primary.light',
              color: 'primary.contrastText'
            }}
          >
            <Typography variant="h6">{nextModule.title}</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {nextModule.description}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => onSelectModule(nextModule)}
              sx={{ bgcolor: 'primary.dark' }}
            >
              Start Module
            </Button>
          </Paper>
        </Box>
      )}

      <Box sx={{ mb: 4 }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Certifications</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {Object.entries(userTraining.certifications)
              .filter(([level]) => level !== 'lastUpdated')
              .map(([level, achieved]) => (
                <Paper
                  key={level}
                  elevation={0}
                  sx={{
                    p: 2,
                    flexGrow: 1,
                    minWidth: 200,
                    bgcolor: achieved ? 'success.light' : 'grey.100',
                    border: 1,
                    borderColor: achieved ? 'success.main' : 'grey.300',
                    borderRadius: 2,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <SchoolIcon color={achieved ? 'success' : 'action'} />
                    <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                      {level} Level
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {achieved ? 'Certification Achieved' : 'In Progress'}
                  </Typography>
                  {achieved && (
                    <Chip
                      label="Certified"
                      color="success"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Paper>
              ))}
          </Box>
        </Paper>
      </Box>

      <List>
        {['basics', 'equipment', 'safety', 'bestPractices']
          .filter(category => filter === 'all' || filter === category)
          .map(category => (
          <React.Fragment key={category}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mt: 3, 
                mb: 1, 
                textTransform: 'capitalize' 
              }}
            >
              {category.replace(/([A-Z])/g, ' $1').trim()}
            </Typography>
            {trainingModules
              .filter((module: TrainingModule) => module.category === category)
              .map(module => {
                const status = getModuleStatus(module);
                const progress = calculateProgress(module);

                return (
                  <ListItem
                    key={module.id}
                    button
                    onClick={() => onSelectModule(module)}
                    sx={{
                      mb: 1,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1
                    }}
                  >
                    <ListItemIcon>
                      {status.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={module.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {module.description}
                          </Typography>
                          {progress > 0 && (
                            <LinearProgress
                              variant="determinate"
                              value={progress}
                              sx={{ mt: 1 }}
                            />
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title={`${module.estimatedMinutes} minutes`}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {module.estimatedMinutes}m
                          </Typography>
                        </Box>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}
