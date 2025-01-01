import React, { useState, useRef, useEffect } from 'react';
import { BaseProps, MergeElementProps } from '../../types/ui';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

interface SelectOwnProps extends BaseProps {
  options: Option[];
  value?: string | string[];
  onChange?: (value: string | string[], event: React.MouseEvent) => void;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  error?: string;
  label?: string;
  placeholder?: string;
  noOptionsMessage?: string;
  loadingMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  maxHeight?: number | string;
  groupBy?: (option: Option) => string;
  disabled?: boolean;
}

type SelectProps = MergeElementProps<'div', SelectOwnProps>;

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  multiple = false,
  searchable = false,
  clearable = true,
  loading = false,
  error,
  label,
  placeholder = 'Select option...',
  noOptionsMessage = 'No options available',
  loadingMessage = 'Loading...',
  size = 'md',
  maxHeight = 300,
  groupBy,
  disabled = false,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group options if groupBy is provided
  const groupedOptions = groupBy
    ? filteredOptions.reduce((groups, option) => {
        const group = groupBy(option);
        return {
          ...groups,
          [group]: [...(groups[group] || []), option],
        };
      }, {} as Record<string, Option[]>)
    : null;

  // Get selected options
  const selectedOptions = multiple
    ? options.filter(option => (value as string[])?.includes(option.value))
    : options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const handleSelect = (option: Option, event: React.MouseEvent) => {
    if (option.disabled) return;

    if (multiple) {
      const newValue = value as string[];
      const updatedValue = newValue?.includes(option.value)
        ? newValue.filter(v => v !== option.value)
        : [...(newValue || []), option.value];
      onChange?.(updatedValue, event);
    } else {
      onChange?.(option.value, event);
      setIsOpen(false);
    }
    
    if (!multiple) {
      setSearchTerm('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(multiple ? [] : '', e);
    setSearchTerm('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(i => 
          i < filteredOptions.length - 1 ? i + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(i => 
          i > 0 ? i - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (isOpen && filteredOptions[highlightedIndex]) {
          const syntheticEvent = {
            ...event,
            currentTarget: event.currentTarget,
            target: event.target,
          } as unknown as React.MouseEvent;
          handleSelect(filteredOptions[highlightedIndex], syntheticEvent);
        } else {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  const renderValue = () => {
    if (multiple && Array.isArray(selectedOptions)) {
      return selectedOptions.length ? (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map(option => (
            <span
              key={option.value}
              className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-sm"
            >
              {option.label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(option, e);
                }}
                className="ml-1 hover:text-gray-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : (
        <span className="text-gray-400">{placeholder}</span>
      );
    }

    return (selectedOptions as Option)?.label || <span className="text-gray-400">{placeholder}</span>;
  };

  return (
    <div ref={containerRef} className={className} {...props}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            relative w-full cursor-default rounded-md border
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${isOpen ? 'ring-2 ring-primary ring-opacity-50' : ''}
          `}
        >
          <div className="relative w-full">
            {searchable && isOpen ? (
              <input
                ref={inputRef}
                type="text"
                className="w-full border-none py-2 pl-3 pr-10 text-sm focus:outline-none bg-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
              />
            ) : (
              <div className="w-full py-2 pl-3 pr-10 text-sm">
                {renderValue()}
              </div>
            )}

            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              {clearable && value && !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
              <svg
                className={`h-5 w-5 text-gray-400 ${isOpen ? 'transform rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {isOpen && (
          <div
            className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg"
            style={{ maxHeight }}
          >
            <div className="py-1 overflow-auto">
              {loading ? (
                <div className="py-2 px-3 text-sm text-gray-700">
                  {loadingMessage}
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="py-2 px-3 text-sm text-gray-700">
                  {noOptionsMessage}
                </div>
              ) : groupedOptions ? (
                Object.entries(groupedOptions).map(([group, options]) => (
                  <div key={group}>
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50">
                      {group}
                    </div>
                    {options.map((option, index) => (
                      <div
                        key={option.value}
                        onClick={(e) => handleSelect(option, e)}
                        className={`
                          px-3 py-2 text-sm cursor-pointer
                          ${option.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900'}
                          ${highlightedIndex === index ? 'bg-gray-100' : 'hover:bg-gray-50'}
                        `}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    onClick={(e) => handleSelect(option, e)}
                    className={`
                      px-3 py-2 text-sm cursor-pointer
                      ${option.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900'}
                      ${highlightedIndex === index ? 'bg-gray-100' : 'hover:bg-gray-50'}
                    `}
                  >
                    {option.label}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select;

/**
 * Select Component Usage Guide:
 * 
 * 1. Basic select:
 *    <Select
 *      options={[
 *        { value: '1', label: 'Option 1' },
 *        { value: '2', label: 'Option 2' },
 *      ]}
 *      value={value}
 *      onChange={(value) => setValue(value)}
 *    />
 * 
 * 2. Multiple select:
 *    <Select
 *      multiple
 *      options={options}
 *      value={selectedValues}
 *      onChange={(values) => setSelectedValues(values)}
 *    />
 * 
 * 3. With search:
 *    <Select
 *      searchable
 *      options={options}
 *      value={value}
 *      onChange={(value) => setValue(value)}
 *    />
 * 
 * 4. With groups:
 *    <Select
 *      options={options}
 *      groupBy={(option) => option.group}
 *      value={value}
 *      onChange={(value) => setValue(value)}
 *    />
 * 
 * 5. Loading state:
 *    <Select
 *      loading
 *      options={options}
 *      loadingMessage="Fetching options..."
 *    />
 * 
 * 6. With error:
 *    <Select
 *      options={options}
 *      error="This field is required"
 *    />
 * 
 * Notes:
 * - Supports single and multiple selection
 * - Searchable options
 * - Group support
 * - Loading state
 * - Error handling
 * - Keyboard navigation
 * - Accessible
 */
