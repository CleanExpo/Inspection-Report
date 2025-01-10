import React from 'react';
import { useTheme } from '../../utils/theme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'small' | 'medium' | 'large';
  error?: boolean;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  variant = 'default',
  inputSize = 'medium',
  className = '',
  error = false,
  helperText,
  disabled,
  ...props
}) => {
  const { theme } = useTheme();

  const baseStyles = `
    w-full
    font-normal
    rounded-[var(--border-radius)]
    transition-all
    duration-[var(--transition-duration)]
    timing-[var(--transition-timing)]
    focus:outline-none
    focus:ring-2
    focus:ring-[var(--primary)]
    focus:ring-opacity-50
    disabled:opacity-50
    disabled:cursor-not-allowed
    placeholder:text-[var(--text-secondary)]
  `;

  const variantStyles = {
    default: `
      border
      border-[var(--border)]
      bg-[var(--background)]
      text-[var(--text)]
      focus:border-[var(--primary)]
    `,
    filled: `
      border-none
      bg-[var(--surface)]
      text-[var(--text)]
      focus:bg-opacity-70
    `,
    outlined: `
      border-2
      border-[var(--border)]
      bg-transparent
      text-[var(--text)]
      focus:border-[var(--primary)]
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

  const errorStyles = error ? `
    border-[var(--error)]
    focus:ring-[var(--error)]
    focus:border-[var(--error)]
  ` : '';

  return (
    <div className="w-full">
      <input
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[inputSize]}
          ${errorStyles}
          ${className}
        `}
        disabled={disabled}
        {...props}
      />
      {helperText && (
        <p className={`
          mt-1
          text-sm
          ${error ? 'text-[var(--error)]' : 'text-[var(--text-secondary)]'}
        `}>
          {helperText}
        </p>
      )}
    </div>
  );
};

// Search input with icon
export const SearchInput: React.FC<Omit<InputProps, 'type'>> = (props) => {
  return (
    <div className="relative w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
        🔍
      </span>
      <Input
        type="search"
        {...props}
        className={`pl-10 ${props.className || ''}`}
        placeholder={props.placeholder || 'Search...'}
      />
    </div>
  );
};
