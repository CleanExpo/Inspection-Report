import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Button,
  TextField,
  MenuItem,
  Grid
} from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoistureLegend from './MoistureLegend';
import MoistureInput from './MoistureInput';
import MoistureReadingCard from './MoistureReadingCard';
import { MoistureReading } from '../types/moisture';
import { getInspectionDayLabel } from '../utils/dateUtils';
import { useAustralianTerms } from '../hooks/useAustralianTerms';

interface MoistureReadingsSectionProps {
  currentInspectionDay: number;
  isDayFinalized: boolean;
  selectedMaterial: string;
  currentReading: number | undefined;
  searchTerm: string;
  filterMaterial: string;
  readingsByDay: { [key: string]: MoistureReading[] };
  onAddReading: (reading: MoistureReading) => void;
  onMaterialSelect: (material: string) => void;
  onValueChange: (value: number | undefined) => void;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onFinalizeDay: () => void;
  onStartNewDay: () => void;
}

export default function MoistureReadingsSection({
  currentInspectionDay,
  isDayFinalized,
  selectedMaterial,
  currentReading,
  searchTerm,
  filterMaterial,
  readingsByDay,
  onAddReading,
  onMaterialSelect,
  onValueChange,
  onSearchChange,
  onFilterChange,
  onFinalizeDay,
  onStartNewDay
}: MoistureReadingsSectionProps) {
  const { 
    getMaterialName, 
    getActionText, 
    getPlaceholder,
    getAustralianTerm
  } = useAustralianTerms();

  const materials = {
    drywall: getMaterialName('drywall'),
    wood: getMaterialName('wood'),
    concrete: getMaterialName('concrete')
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WaterDropIcon />
          {getAustralianTerm('measurement', 'moisture')} Readings - Day {currentInspectionDay}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            onClick={onFinalizeDay}
            startIcon={<LockIcon />}
            disabled={isDayFinalized}
          >
            {getActionText('finalizeDay')}
          </Button>
          <Button
            variant="contained"
            onClick={onStartNewDay}
            startIcon={<AddIcon />}
          >
            {getActionText('startNewDay')}
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <MoistureLegend 
          selectedMaterial={selectedMaterial}
          currentReading={currentReading}
        />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <MoistureInput 
          onAddReading={onAddReading}
          currentInspectionDay={currentInspectionDay}
          onMaterialSelect={onMaterialSelect}
          onValueChange={onValueChange}
          disabled={isDayFinalized}
        />
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={getPlaceholder('searchReadings')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <TextField
          select
          size="small"
          value={filterMaterial}
          onChange={(e) => onFilterChange(e.target.value)}
          sx={{ minWidth: 150 }}
          InputProps={{
            startAdornment: <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        >
          <MenuItem value="">All {getMaterialName('material')}</MenuItem>
          <MenuItem value="drywall">{materials.drywall}</MenuItem>
          <MenuItem value="wood">{materials.wood}</MenuItem>
          <MenuItem value="concrete">{materials.concrete}</MenuItem>
        </TextField>
      </Box>

      <Box sx={{ 
        border: '1px solid #eee',
        borderRadius: 1,
        p: 2,
        maxHeight: '500px',
        overflowY: 'auto'
      }}>
        {Object.entries(readingsByDay)
          .sort(([dayA], [dayB]) => Number(dayB) - Number(dayA))
          .map(([day, readings]) => {
            const filteredReadings = readings.filter(reading => {
              const matchesSearch = searchTerm === '' || 
                reading.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reading.notes?.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesMaterial = filterMaterial === '' || 
                reading.materialType === filterMaterial;
              return matchesSearch && matchesMaterial;
            });

            if (filteredReadings.length === 0) return null;

            return (
              <Box key={day} sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {getInspectionDayLabel(Number(day), readings[0].timestamp)}
                </Typography>
                <Grid container spacing={2}>
                  {filteredReadings.map((reading: MoistureReading) => (
                    <Grid item xs={12} sm={6} md={4} key={reading.id}>
                      <MoistureReadingCard 
                        reading={reading} 
                        readings={readings}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          })}
      </Box>
    </Paper>
  );
}
