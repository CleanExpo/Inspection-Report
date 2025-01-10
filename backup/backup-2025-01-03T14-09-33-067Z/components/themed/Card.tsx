import React from 'react';
import { useTheme } from '../../utils/theme';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'small' | 'medium' | 'large';
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'medium',
  className = '',
  header,
  footer,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const baseStyles = `
    w-full
    rounded-[var(--border-radius)]
    transition-all
    duration-[var(--transition-duration)]
    timing-[var(--transition-timing)]
  `;

  const variantStyles = {
    elevated: `
      bg-[var(--surface)]
      shadow-md
      hover:shadow-lg
    `,
    outlined: `
      border
      border-[var(--border)]
      bg-[var(--background)]
    `,
    flat: `
      bg-[var(--surface)]
    `
  };

  const paddingStyles = {
    none: '',
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  };

  const headerStyles = `
    px-4
    py-3
    border-b
    border-[var(--border)]
    font-medium
    text-[var(--text)]
  `;

  const footerStyles = `
    px-4
    py-3
    border-t
    border-[var(--border)]
    text-[var(--text-secondary)]
  `;

  const contentStyles = padding !== 'none' ? `
    ${paddingStyles[padding]}
    text-[var(--text)]
  ` : '';

  return (
    <div
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {header && (
        <div className={headerStyles}>
          {header}
        </div>
      )}
      
      <div className={contentStyles}>
        {children}
      </div>

      {footer && (
        <div className={footerStyles}>
          {footer}
        </div>
      )}
    </div>
  );
};

// Specialized card variants
export const InfoCard: React.FC<Omit<CardProps, 'variant' | 'header'>> = (props) => {
  return (
    <Card
      variant="outlined"
      header={
        <div className="flex items-center gap-2">
          <span className="text-[var(--primary)]">ℹ️</span>
          <span>Information</span>
        </div>
      }
      {...props}
    />
  );
};

export const AlertCard: React.FC<Omit<CardProps, 'variant' | 'header'> & {
  type?: 'success' | 'warning' | 'error'
}> = ({ type = 'warning', ...props }) => {
  const iconMap = {
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  const colorMap = {
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)'
  };

  return (
    <Card
      variant="outlined"
      header={
        <div className="flex items-center gap-2">
          <span style={{ color: colorMap[type] }}>{iconMap[type]}</span>
          <span style={{ color: colorMap[type] }}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        </div>
      }
      {...props}
    />
  );
};
