'use client';

import React from 'react';
import { IconButton, Tooltip, useTheme as useMuiTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../app/providers/ThemeProvider';
import { useMediaQuery } from '@mui/material';

export default function ThemeToggle() {
  const { mode, toggleTheme } = useTheme();
  const theme = useMuiTheme();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const animationDuration = prefersReducedMotion ? 0 : theme.transitions.duration.shorter;
  const rotationDegrees = prefersReducedMotion ? 0 : 180;

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
        sx={{
          transition: theme.transitions.create(['transform', 'color'], {
            duration: animationDuration,
            easing: theme.transitions.easing.easeInOut,
          }),
          '&:hover': {
            transform: `rotate(${rotationDegrees / 15}deg)`,
          },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
          },
        }}
      >
        {mode === 'light' ? (
          <Brightness4
            sx={{
              transition: theme.transitions.create(['transform', 'opacity'], {
                duration: animationDuration,
                easing: theme.transitions.easing.easeInOut,
              }),
              animation: !prefersReducedMotion ? `${rotationDegrees}deg fadeIn ${animationDuration}ms` : 'none',
              '@keyframes fadeIn': {
                '0%': {
                  opacity: 0,
                  transform: `rotate(-${rotationDegrees}deg)`,
                },
                '100%': {
                  opacity: 1,
                  transform: 'rotate(0deg)',
                },
              },
            }}
          />
        ) : (
          <Brightness7
            sx={{
              transition: theme.transitions.create(['transform', 'opacity'], {
                duration: animationDuration,
                easing: theme.transitions.easing.easeInOut,
              }),
              animation: !prefersReducedMotion ? `${rotationDegrees}deg fadeIn ${animationDuration}ms` : 'none',
              '@keyframes fadeIn': {
                '0%': {
                  opacity: 0,
                  transform: `rotate(${rotationDegrees}deg)`,
                },
                '100%': {
                  opacity: 1,
                  transform: 'rotate(0deg)',
                },
              },
            }}
          />
        )}
      </IconButton>
    </Tooltip>
  );
}
