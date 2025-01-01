import React, { useState, useRef, useEffect } from 'react';
import { BaseProps } from '../../types/ui';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

interface ComboboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  options: Option[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  error?: string;
  label?: string;
  placeholder?: string;
  noOptionsMessage?: string;
  loadingMessage?: string;
  groupBy?: (option: Option) => string;
  renderOption?: (option: Option) => React.ReactNode;
  renderValue?: (selected: Option[] | Option | null) => React.ReactNode;
}

const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  multiple = false,
  searchable = true,
  clearable = true,
  loading = false,
  error,
  label,
  placeholder = 'Select option...',
  noOptionsMessage = 'No options available',
  loadingMessage = 'Loading...',
  groupBy,
  renderOption,
  renderValue,
  className = '',
  disabled = false,
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
  const selectedOptions: Option[] | Option | null = multiple
    ? options.filter(option => (value as string[])?.includes(option.value))
    : options.find(option => option.value === value) || null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
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
          handleSelect(filteredOptions[highlightedIndex]);
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

  const handleSelect = (option: Option) => {
    if (option.disabled) return;

    if (multiple) {
      const newValue = value as string[];
      const updatedValue = newValue?.includes(option.value)
        ? newValue.filter(v => v !== option.value)
        : [...(newValue || []), option.value];
      onChange?.(updatedValue);
    } else {
      onChange?.(option.value);
      setIsOpen(false);
    }
    
    if (!multiple) {
      setSearchTerm('');
    }
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange?.(multiple ? [] : '');
    setSearchTerm('');
  };

  const renderSelectedValue = () => {
    if (renderValue) {
      return renderValue(selectedOptions);
    }

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
                  handleSelect(option);
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

    return selectedOptions ? (selectedOptions as Option).label : <span className="text-gray-400">{placeholder}</span>;
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div ref={containerRef} className="relative">
        <div
          className={`
            relative w-full cursor-default rounded-md border
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${isOpen ? 'ring-2 ring-primary ring-opacity-50' : ''}
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
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
                {...props}
              />
            ) : (
              <div className="w-full py-2 pl-3 pr-10 text-sm">
                {renderSelectedValue()}
              </div>
            )}

            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              {clearable && (value || searchTerm) && !disabled && (
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
          <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
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
                      onClick={() => handleSelect(option)}
                      className={`
                        px-3 py-2 text-sm cursor-pointer
                        ${option.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900'}
                        ${highlightedIndex === index ? 'bg-gray-100' : 'hover:bg-gray-50'}
                      `}
                    >
                      {renderOption ? renderOption(option) : option.label}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`
                    px-3 py-2 text-sm cursor-pointer
                    ${option.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900'}
                    ${highlightedIndex === index ? 'bg-gray-100' : 'hover:bg-gray-50'}
                  `}
                >
                  {renderOption ? renderOption(option) : option.label}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Combobox;
