import React from 'react';
import { useTheme } from '../../utils/theme';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  className = '',
  children,
  disabled,
  ...props
}) => {
  const { theme } = useTheme();

  const baseStyles = `
    inline-flex
    items-center
    justify-center
    font-medium
    rounded-[var(--border-radius)]
    transition-all
    duration-[var(--transition-duration)]
    timing-[var(--transition-timing)]
    disabled:opacity-50
    disabled:cursor-not-allowed
  `;

  const variantStyles = {
    primary: `
      bg-[var(--primary)]
      text-white
      hover:opacity-90
      active:opacity-80
    `,
    secondary: `
      bg-[var(--secondary)]
      text-white
      hover:opacity-90
      active:opacity-80
    `,
    outline: `
      border-2
      border-[var(--primary)]
      text-[var(--primary)]
      bg-transparent
      hover:bg-[var(--primary)]
      hover:text-white
    `
  };

  const sizeStyles = {
    small: `
      px-3
      py-1.5
      text-sm
    `,
    medium: `
      px-4
      py-2
      text-base
    `,
    large: `
      px-6
      py-3
      text-lg
    `
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Theme toggle button component
export const ThemeToggle: React.FC<Omit<ButtonProps, 'variant'>> = (props) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme.mode === 'light' ? 'dark' : 'light'} mode`}
      {...props}
    >
      {theme.mode === 'light' ? '🌙' : '☀️'}
    </Button>
  );
};
