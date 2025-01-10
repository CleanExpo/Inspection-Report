'use client';

import React, { useRef, useEffect } from 'react';
import { ListItem, ListItemProps } from '@mui/material';
import { useSpringAnimation } from './hooks/useSpringAnimation';

interface AnimatedListItemProps extends ListItemProps {
  index: number;
  isOpen: boolean;
}

export default function AnimatedListItem({ 
  children, 
  index, 
  isOpen,
  ...props 
}: AnimatedListItemProps) {
  const itemRef = useRef<HTMLLIElement>(null);
  const { animate } = useSpringAnimation({
    stiffness: 150,
    damping: 25,
  });

  useEffect(() => {
    if (!itemRef.current) return;

    const element = itemRef.current;
    const delay = index * 50; // Stagger effect

    if (isOpen) {
      // Initial state
      element.style.opacity = '0';
      element.style.transform = 'translateX(-20px)';

      // Trigger animation after delay
      const timeout = setTimeout(() => {
        // Animate opacity
        animate(0, 1, (value) => {
          element.style.opacity = value.toString();
        });

        // Animate position
        animate(-20, 0, (value) => {
          element.style.transform = `translateX(${value}px)`;
        });
      }, delay);

      return () => clearTimeout(timeout);
    } else {
      // Reset styles when closing
      element.style.opacity = '0';
      element.style.transform = 'translateX(-20px)';
    }
  }, [isOpen, index, animate]);

  return (
    <ListItem
      ref={itemRef}
      {...props}
      sx={{
        opacity: 0, // Initial state
        transform: 'translateX(-20px)', // Initial state
        transition: 'background-color 0.2s ease', // For hover effects
        willChange: 'transform, opacity', // Performance optimization
        ...props.sx,
      }}
    >
      {children}
    </ListItem>
  );
}
