'use client';
import React, { forwardRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  Popover,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { VoiceNote } from '../types/voice';

export interface SearchFilters {
  types: VoiceNote['type'][];
  severities: string[];
  locations: string[];
  hasPhotos: boolean;
  hasAnalysis: boolean;
  hasCriticalIssues: boolean;
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilter: (filters: SearchFilters) => void;
  noteTypes: VoiceNote['type'][];
  severityLevels: string[];
  locations: string[];
  ref?: React.RefObject<HTMLInputElement>;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({
  onSearch,
  onFilter,
  noteTypes,
  severityLevels,
  locations
}, ref) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [filters, setFilters] = React.useState<SearchFilters>({
    types: [],
    severities: [],
    locations: [],
    hasPhotos: false,
    hasAnalysis: false,
    hasCriticalIssues: false
  });

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
    onFilter(filters);
  };

  const handleFilterChange = (type: keyof SearchFilters, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (Array.isArray(prev[type])) {
        const array = prev[type] as any[];
        const index = array.indexOf(value);
        if (index === -1) {
          array.push(value);
        } else {
          array.splice(index, 1);
        }
      } else {
        newFilters[type] = value;
      }
      return newFilters;
    });
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          inputRef={ref}
          fullWidth
          placeholder="Search notes..."
          onChange={(e) => onSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            endAdornment: (
              <IconButton
                onClick={() => onSearch('')}
                size="small"
                sx={{ visibility: filters ? 'visible' : 'hidden' }}
              >
                <ClearIcon />
              </IconButton>
            )
          }}
        />
        <Tooltip title="Filter">
          <IconButton onClick={handleFilterClick}>
            <FilterIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            Note Types
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {noteTypes.map(type => (
              <Chip
                key={type}
                label={type}
                onClick={() => handleFilterChange('types', type)}
                variant={filters.types.includes(type) ? 'filled' : 'outlined'}
                size="small"
              />
            ))}
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Severity Levels
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {severityLevels.map(severity => (
              <Chip
                key={severity}
                label={severity}
                onClick={() => handleFilterChange('severities', severity)}
                variant={filters.severities.includes(severity) ? 'filled' : 'outlined'}
                size="small"
              />
            ))}
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Locations
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {locations.map(location => (
              <Chip
                key={location}
                label={location}
                onClick={() => handleFilterChange('locations', location)}
                variant={filters.locations.includes(location) ? 'filled' : 'outlined'}
                size="small"
              />
            ))}
          </Box>

          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.hasPhotos}
                  onChange={(e) => handleFilterChange('hasPhotos', e.target.checked)}
                  size="small"
                />
              }
              label="Has Photos"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.hasAnalysis}
                  onChange={(e) => handleFilterChange('hasAnalysis', e.target.checked)}
                  size="small"
                />
              }
              label="Has AI Analysis"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.hasCriticalIssues}
                  onChange={(e) => handleFilterChange('hasCriticalIssues', e.target.checked)}
                  size="small"
                />
              }
              label="Has Critical Issues"
            />
          </FormGroup>
        </Box>
      </Popover>
    </Box>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
