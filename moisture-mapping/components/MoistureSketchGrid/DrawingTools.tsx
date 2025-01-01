import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import {
  Create as PenIcon,
  Timeline as LineIcon,
  CropSquare as RectangleIcon,
  TextFields as TextIcon,
  Opacity as MoistureIcon,
  PhotoCamera as PhotoIcon,
  Delete as EraserIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { DrawingTool } from '../../types/sketch';

const COLORS = [
  { value: '#ff0000', label: 'Red - Critical Moisture' },
  { value: '#ffa500', label: 'Orange - Moderate Moisture' },
  { value: '#0000ff', label: 'Blue - Affected Areas' },
  { value: '#00ff00', label: 'Green - Dry/Safe Areas' },
  { value: '#000000', label: 'Black - General Drawing' },
];

interface DrawingToolsProps {
  currentTool: DrawingTool;
  currentColor: string;
  onToolChange: (tool: DrawingTool) => void;
  onColorChange: (color: string) => void;
}

export const DrawingTools: React.FC<DrawingToolsProps> = ({
  currentTool,
  currentColor,
  onToolChange,
  onColorChange,
}) => {
  const theme = useTheme();
  const isTouchDevice = useMediaQuery('(pointer: coarse)');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const handleToolChange = (
    _event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>,
    newTool: DrawingTool | null
  ) => {
    if (newTool) {
      onToolChange(newTool);
    }
  };

  const toggleColorPicker = () => {
    setColorPickerOpen(!colorPickerOpen);
  };

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setColorPickerOpen(false);
  };

  // Larger button sizes for touch devices
  const buttonSize = isTouchDevice ? 56 : 40;
  const iconSize = isTouchDevice ? 28 : 24;

  // Longer tooltip delay for touch devices
  const tooltipDelay = isTouchDevice ? 1000 : 200;

  const renderToolButton = (
    value: DrawingTool,
    Icon: React.ElementType,
    label: string
  ) => (
    <ToggleButton 
      value={value} 
      aria-label={`${label} tool`}
      sx={{
        width: buttonSize,
        height: buttonSize,
        '& .MuiSvgIcon-root': {
          fontSize: iconSize,
        },
        '&.Mui-selected': {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        },
      }}
    >
      <Tooltip 
        title={label} 
        placement="right"
        enterDelay={tooltipDelay}
        enterNextDelay={tooltipDelay}
      >
        <div>
          <Icon />
        </div>
      </Tooltip>
    </ToggleButton>
  );

  return (
    <Paper 
      elevation={3}
      sx={{
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: 'center',
        bgcolor: 'background.paper',
        touchAction: 'none',
      }}
    >
      <ToggleButtonGroup
        orientation="vertical"
        value={currentTool}
        exclusive
        onChange={handleToolChange}
        aria-label="drawing tools"
        sx={{
          '& .MuiToggleButton-root': {
            margin: '4px 0',
            borderRadius: '8px',
            transition: 'all 0.2s',
            '&:active': {
              transform: isTouchDevice ? 'scale(0.95)' : 'none',
            },
          },
        }}
      >
        {renderToolButton('pen', PenIcon, 'Pen')}
        {renderToolButton('line', LineIcon, 'Line')}
        {renderToolButton('rectangle', RectangleIcon, 'Rectangle')}
        {renderToolButton('text', TextIcon, 'Text')}
        {renderToolButton('moisture', MoistureIcon, 'Add Moisture Reading')}
        {renderToolButton('photo', PhotoIcon, 'Add Photo')}
        {renderToolButton('eraser', EraserIcon, 'Eraser')}
      </ToggleButtonGroup>

      <Box sx={{ position: 'relative', width: '100%' }}>
        <Tooltip 
          title="Select Color" 
          placement="right"
          enterDelay={tooltipDelay}
          enterNextDelay={tooltipDelay}
        >
          <IconButton
            onClick={toggleColorPicker}
            sx={{
              width: buttonSize,
              height: buttonSize,
              bgcolor: currentColor,
              border: 2,
              borderColor: theme.palette.primary.main,
              '&:hover': {
                bgcolor: currentColor,
                opacity: 0.9,
              },
              '& .MuiSvgIcon-root': {
                fontSize: iconSize,
                color: theme.palette.getContrastText(currentColor),
              },
            }}
          >
            <PaletteIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <SwipeableDrawer
        anchor="bottom"
        open={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        onOpen={() => setColorPickerOpen(true)}
        disableSwipeToOpen
        sx={{
          '& .MuiDrawer-paper': {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 2,
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: 2,
            p: 2,
          }}
        >
          {COLORS.map(({ value, label }) => (
            <Box
              key={value}
              onClick={() => handleColorSelect(value)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <IconButton
                sx={{
                  width: buttonSize * 1.2,
                  height: buttonSize * 1.2,
                  bgcolor: value,
                  border: currentColor === value ? 3 : 1,
                  borderColor: currentColor === value 
                    ? theme.palette.primary.main 
                    : theme.palette.grey[300],
                  '&:hover': {
                    bgcolor: value,
                    opacity: 0.9,
                  },
                  transition: 'all 0.2s',
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
              />
              <Box
                sx={{
                  fontSize: '0.75rem',
                  textAlign: 'center',
                  color: theme.palette.text.secondary,
                }}
              >
                {label}
              </Box>
            </Box>
          ))}
        </Box>
      </SwipeableDrawer>
    </Paper>
  );
};
