import React, { useState, useRef, useEffect } from 'react';
import { BaseProps, MergeElementProps } from '../../types/ui';

type TextAreaSize = 'sm' | 'md' | 'lg';

interface TextAreaOwnProps extends BaseProps {
  value?: string;
  onChange?: (value: string, event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  label?: string;
  error?: string;
  helperText?: string;
  size?: TextAreaSize;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  autoResize?: boolean;
  maxRows?: number;
  showCount?: boolean;
  countPosition?: 'inside' | 'outside';
  variant?: 'outlined' | 'filled';
  fullWidth?: boolean;
}

type TextAreaProps = Omit<MergeElementProps<'textarea', TextAreaOwnProps>, 'size'> & {
  size?: TextAreaSize;
};

const sizes = {
  sm: {
    padding: 'px-3 py-1.5',
    text: 'text-sm',
    label: 'text-sm',
  },
  md: {
    padding: 'px-4 py-2',
    text: 'text-base',
    label: 'text-base',
  },
  lg: {
    padding: 'px-4 py-2.5',
    text: 'text-lg',
    label: 'text-lg',
  },
} as const;

const variants = {
  outlined: {
    base: 'border border-gray-300 bg-white focus:ring-2 focus:ring-primary focus:ring-opacity-50',
    error: 'border-red-300 focus:ring-red-500',
    disabled: 'bg-gray-100 cursor-not-allowed',
  },
  filled: {
    base: 'border-0 border-b-2 border-gray-300 bg-gray-100 focus:bg-gray-50 focus:border-primary',
    error: 'border-red-300 focus:border-red-500',
    disabled: 'bg-gray-200 cursor-not-allowed',
  },
} as const;

const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  label,
  error,
  helperText,
  size = 'md',
  resize = 'vertical',
  autoResize = false,
  maxRows,
  showCount = false,
  countPosition = 'outside',
  variant = 'outlined',
  fullWidth = false,
  className = '',
  rows = 3,
  maxLength,
  disabled = false,
  required = false,
  ...props
}) => {
  const [currentValue, setCurrentValue] = useState(value || '');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setCurrentValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (autoResize && textAreaRef.current) {
      adjustHeight();
    }
  }, [currentValue, autoResize]);

  const adjustHeight = () => {
    const textArea = textAreaRef.current;
    if (!textArea) return;

    textArea.style.height = 'auto';
    const newHeight = textArea.scrollHeight;
    
    if (maxRows) {
      const lineHeight = parseInt(getComputedStyle(textArea).lineHeight);
      const maxHeight = lineHeight * maxRows;
      textArea.style.height = `${Math.min(newHeight, maxHeight)}px`;
    } else {
      textArea.style.height = `${newHeight}px`;
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setCurrentValue(newValue);
    onChange?.(newValue, event);
  };

  const renderCharacterCount = () => {
    if (!showCount) return null;

    const count = currentValue.length;
    const limit = maxLength ? `/${maxLength}` : '';
    
    return (
      <div
        className={`
          text-sm text-gray-500
          ${countPosition === 'inside' ? 'absolute bottom-2 right-2' : 'mt-1 text-right'}
        `}
      >
        {count}{limit}
      </div>
    );
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className={`block font-medium text-gray-700 mb-1 ${sizes[size].label}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <textarea
          ref={textAreaRef}
          value={currentValue}
          onChange={handleChange}
          rows={rows}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          className={`
            block w-full rounded-md
            ${sizes[size].padding}
            ${sizes[size].text}
            ${variants[variant].base}
            ${error ? variants[variant].error : ''}
            ${disabled ? variants[variant].disabled : ''}
            ${resize === 'none' ? 'resize-none' : ''}
            ${resize === 'vertical' ? 'resize-y' : ''}
            ${resize === 'horizontal' ? 'resize-x' : ''}
            ${resize === 'both' ? 'resize' : ''}
            focus:outline-none
            transition-colors duration-200
          `}
          {...props}
        />
        {countPosition === 'inside' && renderCharacterCount()}
      </div>
      {countPosition === 'outside' && renderCharacterCount()}
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default TextArea;

/**
 * TextArea Component Usage Guide:
 * 
 * 1. Basic textarea:
 *    <TextArea
 *      value={value}
 *      onChange={(value) => setValue(value)}
 *      placeholder="Enter text..."
 *    />
 * 
 * 2. With label and helper text:
 *    <TextArea
 *      label="Description"
 *      helperText="Enter a detailed description"
 *      value={value}
 *      onChange={(value) => setValue(value)}
 *    />
 * 
 * 3. Different sizes:
 *    <TextArea size="sm" />
 *    <TextArea size="md" />
 *    <TextArea size="lg" />
 * 
 * 4. With character count:
 *    <TextArea
 *      showCount
 *      maxLength={500}
 *      value={value}
 *      onChange={(value) => setValue(value)}
 *    />
 * 
 * 5. Auto-resizing:
 *    <TextArea
 *      autoResize
 *      maxRows={10}
 *      value={value}
 *      onChange={(value) => setValue(value)}
 *    />
 * 
 * 6. Different variants:
 *    <TextArea variant="outlined" />
 *    <TextArea variant="filled" />
 * 
 * 7. With error:
 *    <TextArea
 *      error="This field is required"
 *      value={value}
 *      onChange={(value) => setValue(value)}
 *    />
 * 
 * 8. Disabled state:
 *    <TextArea
 *      disabled
 *      value={value}
 *      onChange={(value) => setValue(value)}
 *    />
 * 
 * Notes:
 * - Auto-resizing support
 * - Character counting
 * - Multiple variants
 * - Error handling
 * - Different sizes
 * - Customizable resize behavior
 * - Accessible
 */
