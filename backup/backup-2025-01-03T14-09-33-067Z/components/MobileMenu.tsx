'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { navigationItems, NavigationItem } from './Navigation';
import { useLoading } from '../app/providers/LoadingProvider';
import { useGesture } from './hooks/useGesture';
import AnimatedListItem from './AnimatedListItem';
import { useMenuState } from './hooks/useMenuState';
import { useMenuKeyboard } from './hooks/useMenuKeyboard';
import MobileMenuErrorBoundary from './MobileMenuErrorBoundary';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const router = useRouter();
  const theme = useTheme();
  const { showLoading, hideLoading, showError } = useLoading();
  const drawerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const menuState = useMenuState();
  const [navigationError, setNavigationError] = useState<{
    path: string;
    error: Error;
    retryCount: number;
  } | null>(null);

  const { onTouchStart, onTouchMove, onTouchEnd, state: gestureState } = useGesture({
    minSwipeDistance: 50,
    minVelocity: 0.3,
    lockAxis: 'x'
  });

  const handleNavigate = useCallback((direction: 'next' | 'prev') => {
    setFocusedIndex(prev => {
      const newIndex = direction === 'next'
        ? (prev + 1) % navigationItems.length
        : prev <= 0 ? navigationItems.length - 1 : prev - 1;
      
      const element = listRef.current?.children[newIndex] as HTMLElement;
      if (element) {
        element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
      
      return newIndex;
    });
  }, []);

  const handleSelect = useCallback(() => {
    if (focusedIndex >= 0 && focusedIndex < navigationItems.length) {
      handleNavigation(navigationItems[focusedIndex]);
    }
  }, [focusedIndex]);

  const { createFocusTrap } = useMenuKeyboard({
    isOpen: open,
    onClose,
    onNavigate: handleNavigate,
    onSelect: handleSelect,
  });

  useEffect(() => {
    if (open && drawerRef.current) {
      createFocusTrap(drawerRef.current);
    }
  }, [open, createFocusTrap]);

  useEffect(() => {
    if (open && listRef.current) {
      const currentPath = window.location.pathname;
      const savedPosition = menuState.getScrollPosition(currentPath);
      listRef.current.scrollTop = savedPosition;
      menuState.updateLastOpenPath(currentPath);
    }
  }, [open, menuState]);

  const handleScroll = useCallback(() => {
    if (listRef.current) {
      const currentPath = window.location.pathname;
      menuState.saveScrollPosition(currentPath, listRef.current.scrollTop);
    }
  }, [menuState]);

  const handleTouchMove = (e: React.TouchEvent) => {
    onTouchMove(e);
    
    if (drawerRef.current && !isAnimating && gestureState.startPosition && gestureState.currentPosition) {
      const distance = gestureState.startPosition.x - gestureState.currentPosition.x;
      if (distance > 0) {
        drawerRef.current.style.transform = `translateX(-${distance}px)`;
        drawerRef.current.style.opacity = `${1 - (distance / drawerRef.current.offsetWidth) * 0.5}`;
      }
    }
  };

  const handleTouchEnd = () => {
    const direction = onTouchEnd();
    
    if (direction === 'left') {
      setIsAnimating(true);
      onClose();
    } else if (drawerRef.current) {
      drawerRef.current.style.transform = '';
      drawerRef.current.style.opacity = '';
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      if (drawerRef.current) {
        drawerRef.current.style.transform = '';
        drawerRef.current.style.opacity = '';
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isAnimating]);

  const handleNavigation = async (item: NavigationItem) => {
    try {
      if (navigationError?.path === item.path) {
        if (navigationError.retryCount >= 3) {
          showError('Too many failed attempts. Please try again later.');
          return;
        }
        setNavigationError(prev => prev ? {
          ...prev,
          retryCount: prev.retryCount + 1
        } : null);
      }

      handleScroll();
      setActiveItem(item.path);
      showLoading();
      await router.push(item.path);
      setNavigationError(null);
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setNavigationError({
        path: item.path,
        error: error as Error,
        retryCount: 1,
      });
      showError(`Failed to navigate to ${item.label}. ${errorMessage}`);
      console.error('Navigation error:', error);
    } finally {
      hideLoading();
      setActiveItem(null);
    }
  };

  const handleRetry = useCallback(() => {
    if (navigationError) {
      const item = navigationItems.find(i => i.path === navigationError.path);
      if (item) {
        handleNavigation(item);
      }
    }
  }, [navigationError]);

  const menuContent = (
    <MobileMenuErrorBoundary onRetry={handleRetry}>
      <Drawer
        ref={drawerRef}
        anchor="left"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: '80%',
            maxWidth: 360,
            transition: theme.transitions.create(['transform', 'opacity'], {
              duration: theme.transitions.duration.standard,
              easing: theme.transitions.easing.easeInOut,
            }),
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
          },
          onTouchStart,
          onTouchMove: handleTouchMove,
          onTouchEnd: handleTouchEnd,
        }}
        SlideProps={{
          timeout: {
            enter: theme.transitions.duration.enteringScreen,
            exit: theme.transitions.duration.leavingScreen,
          },
        }}
      >
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            opacity: open ? 1 : 0,
            transition: theme.transitions.create('opacity', {
              duration: theme.transitions.duration.shorter,
              delay: open ? theme.transitions.duration.shortest : 0,
            }),
          }}
        >
          <Typography variant="h6">Menu</Typography>
          <IconButton
            onClick={onClose}
            sx={{
              width: 48,
              height: 48,
              transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: theme.transitions.create('transform', {
                duration: theme.transitions.duration.shorter,
              }),
              '& .MuiSvgIcon-root': {
                fontSize: 24,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {navigationError && (
          <Alert 
            severity="error" 
            sx={{ mx: 2, mb: 2 }}
            onClose={() => setNavigationError(null)}
          >
            Navigation failed. {navigationError.retryCount < 3 ? 'Please try again.' : 'Too many attempts.'}
          </Alert>
        )}

        <List
          ref={listRef}
          onScroll={handleScroll}
          sx={{
            width: '100%',
            pt: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            perspective: 1000,
            perspectiveOrigin: 'top center',
          }}
        >
          {navigationItems.map((item, index) => (
            <AnimatedListItem 
              key={item.path}
              index={index}
              isOpen={open}
              disablePadding
            >
              <ListItemButton
                onClick={() => handleNavigation(item)}
                onFocus={() => setFocusedIndex(index)}
                onMouseEnter={() => setFocusedIndex(index)}
                onMouseLeave={() => setFocusedIndex(-1)}
                selected={focusedIndex === index}
                aria-current={typeof window !== 'undefined' ? item.path === window.location.pathname : false}
                disabled={!!activeItem || (navigationError?.path === item.path && navigationError.retryCount >= 3)}
                sx={{
                  py: 2,
                  '&:active': {
                    backgroundColor: theme.palette.action.selected,
                  },
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'currentColor',
                    opacity: 0,
                    transition: theme.transitions.create('opacity', {
                      duration: theme.transitions.duration.shortest,
                    }),
                  },
                  '&:active::after': {
                    opacity: 0.1,
                  },
                  ...(navigationError?.path === item.path && {
                    color: theme.palette.error.main,
                  }),
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 48,
                    transition: theme.transitions.create(['opacity', 'transform'], {
                      duration: theme.transitions.duration.shorter,
                    }),
                    ...(navigationError?.path === item.path && {
                      color: theme.palette.error.main,
                    }),
                  }}
                >
                  {activeItem === item.path ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    sx: { 
                      fontSize: '1.1rem',
                      fontWeight: 500,
                    },
                  }}
                />
              </ListItemButton>
            </AnimatedListItem>
          ))}
        </List>
      </Drawer>
    </MobileMenuErrorBoundary>
  );

  return menuContent;
}
