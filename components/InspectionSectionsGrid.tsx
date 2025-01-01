import React from 'react';
import { Grid, Box } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import WarningIcon from '@mui/icons-material/Warning';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import BuildIcon from '@mui/icons-material/Build';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import InspectionSectionCard, { InspectionSection } from './InspectionSectionCard';

// Type-safe paths
export const INSPECTION_PATHS = {
  ADMIN: '/admin',
  AUTHORITY: '/authority',
  HAZARDS: '/hazards',
  PHOTOS: '/photos',
  EQUIPMENT: '/equipment',
  AI_ANALYSIS: '/ai-analysis'
} as const;

export type InspectionPath = typeof INSPECTION_PATHS[keyof typeof INSPECTION_PATHS];

// Update InspectionSection type to use InspectionPath
export type TypeSafeInspectionSection = Omit<InspectionSection, 'path'> & {
  path: InspectionPath;
};

// Validate section data
const validateSection = (section: InspectionSection): section is TypeSafeInspectionSection => {
  return Boolean(
    section.title &&
    section.description &&
    section.path &&
    Object.values(INSPECTION_PATHS).includes(section.path as InspectionPath)
  );
};

const defaultSections: TypeSafeInspectionSection[] = [
  {
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 40 }} />,
    title: 'Administration',
    description: 'Manage inspection details and administrative tasks',
    path: INSPECTION_PATHS.ADMIN
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    title: 'Authority Forms',
    description: 'Handle authority documentation and permissions',
    path: INSPECTION_PATHS.AUTHORITY
  },
  {
    icon: <WarningIcon sx={{ fontSize: 40 }} />,
    title: 'Hazards',
    description: 'Identify and document hazardous conditions',
    path: INSPECTION_PATHS.HAZARDS
  },
  {
    icon: <PhotoLibraryIcon sx={{ fontSize: 40 }} />,
    title: 'Photos & Documents',
    description: 'Manage inspection photos and documentation',
    path: INSPECTION_PATHS.PHOTOS
  },
  {
    icon: <BuildIcon sx={{ fontSize: 40 }} />,
    title: 'Equipment',
    description: 'Track equipment recommendations and usage',
    path: INSPECTION_PATHS.EQUIPMENT
  },
  {
    icon: <SmartToyIcon sx={{ fontSize: 40 }} />,
    title: 'AI Analysis',
    description: 'AI-powered inspection analysis and insights',
    path: INSPECTION_PATHS.AI_ANALYSIS
  }
];

interface InspectionSectionsGridProps {
  sections?: InspectionSection[];
  onSectionClick?: (path: string) => void; // Keep as string to maintain compatibility
  cardStyles?: React.CSSProperties;
  gridSpacing?: number;
}

export default function InspectionSectionsGrid({ 
  sections = defaultSections,
  onSectionClick,
  cardStyles,
  gridSpacing = 3
}: InspectionSectionsGridProps) {
  // Memoize sections to prevent unnecessary re-renders
  const validSections = React.useMemo(() => 
    sections.filter(validateSection),
    [sections]
  );

  // Type-safe click handler
  const handleSectionClick = React.useCallback(
    (path: string) => {
      if (onSectionClick) {
        onSectionClick(path);
      }
    },
    [onSectionClick]
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Grid 
        container 
        spacing={{ xs: 2, sm: gridSpacing }}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          margin: '0 auto',
          width: '100%',
          alignItems: 'stretch'
        }}
      >
        {validSections.map((section) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={4} 
            key={section.path}
            sx={{
              display: 'flex',
              alignItems: 'stretch',
              '& > *': {
                width: '100%'
              }
            }}
          >
            <InspectionSectionCard 
              {...section} 
              onClick={handleSectionClick}
              customStyles={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 240,
                ...cardStyles
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export { defaultSections };
