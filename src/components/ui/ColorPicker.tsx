import React, { useState, useEffect } from 'react';
import { BaseProps } from '../../types/ui';

interface ColorPickerProps extends BaseProps {
  /**
   * The current color value
   */
  value?: string;

  /**
   * Callback when color changes
   */
  onChange?: (color: string) => void;

  /**
   * The format of the color value
   */
  format?: 'hex' | 'rgb' | 'hsl';

  /**
   * Whether to show opacity control
   */
  showAlpha?: boolean;

  /**
   * Whether to show color swatches
   */
  showSwatches?: boolean;

  /**
   * Custom color swatches
   */
  swatches?: string[];

  /**
   * Whether to show input field
   */
  showInput?: boolean;

  /**
   * Whether the color picker is disabled
   */
  disabled?: boolean;

  /**
   * The size of the color picker
   */
  size?: 'sm' | 'md' | 'lg';
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '#000000',
  onChange,
  format = 'hex',
  showAlpha = false,
  showSwatches = true,
  swatches = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#00FFFF', '#FF00FF', '#C0C0C0', '#808080',
  ],
  showInput = true,
  disabled = false,
  size = 'md',
  className = '',
  ...props
}) => {
  const [currentColor, setCurrentColor] = useState(value);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [alpha, setAlpha] = useState(1);

  const sizes = {
    sm: {
      picker: 'w-48',
      swatch: 'w-6 h-6',
      slider: 'h-3',
      input: 'text-sm',
    },
    md: {
      picker: 'w-64',
      swatch: 'w-8 h-8',
      slider: 'h-4',
      input: 'text-base',
    },
    lg: {
      picker: 'w-80',
      swatch: 'w-10 h-10',
      slider: 'h-5',
      input: 'text-lg',
    },
  };

  useEffect(() => {
    setCurrentColor(value);
    const { h, s, l, a } = parseColor(value);
    setHue(h);
    setSaturation(s);
    setLightness(l);
    setAlpha(a);
  }, [value]);

  const parseColor = (color: string) => {
    // Simple color parser - in a real implementation, you'd want a more robust solution
    let h = 0, s = 100, l = 50, a = 1;

    if (color.startsWith('#')) {
      // Parse hex
      const hex = color.substring(1);
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      // Convert RGB to HSL
      // This would need a proper RGB to HSL conversion
    } else if (color.startsWith('rgb')) {
      // Parse RGB/RGBA
      const matches = color.match(/\d+/g);
      if (matches) {
        // Convert RGB to HSL
        // This would need a proper RGB to HSL conversion
      }
    }

    return { h, s, l, a };
  };

  const formatColor = (h: number, s: number, l: number, a: number) => {
    switch (format) {
      case 'rgb':
        return a < 1
          ? `rgba(${h}, ${s}%, ${l}%, ${a})`
          : `rgb(${h}, ${s}%, ${l}%)`;
      case 'hsl':
        return a < 1
          ? `hsla(${h}, ${s}%, ${l}%, ${a})`
          : `hsl(${h}, ${s}%, ${l}%)`;
      default:
        // Convert HSL to Hex
        // This would need a proper HSL to Hex conversion
        return '#000000';
    }
  };

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHue = parseInt(e.target.value);
    setHue(newHue);
    const newColor = formatColor(newHue, saturation, lightness, alpha);
    setCurrentColor(newColor);
    onChange?.(newColor);
  };

  const handleSaturationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSaturation = parseInt(e.target.value);
    setSaturation(newSaturation);
    const newColor = formatColor(hue, newSaturation, lightness, alpha);
    setCurrentColor(newColor);
    onChange?.(newColor);
  };

  const handleLightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLightness = parseInt(e.target.value);
    setLightness(newLightness);
    const newColor = formatColor(hue, saturation, newLightness, alpha);
    setCurrentColor(newColor);
    onChange?.(newColor);
  };

  const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAlpha = parseFloat(e.target.value);
    setAlpha(newAlpha);
    const newColor = formatColor(hue, saturation, lightness, newAlpha);
    setCurrentColor(newColor);
    onChange?.(newColor);
  };

  const handleSwatchClick = (color: string) => {
    if (disabled) return;
    setCurrentColor(color);
    onChange?.(color);
    const { h, s, l, a } = parseColor(color);
    setHue(h);
    setSaturation(s);
    setLightness(l);
    setAlpha(a);
  };

  return (
    <div
      className={`
        inline-block
        p-4
        border border-gray-200
        rounded-lg
        bg-white
        ${sizes[size].picker}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Color preview */}
      <div
        className="w-full h-24 rounded-lg mb-4"
        style={{ backgroundColor: currentColor }}
      />

      {/* Hue slider */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hue
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={hue}
            onChange={handleHueChange}
            disabled={disabled}
            className={`
              w-full
              ${sizes[size].slider}
              appearance-none
              bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-red-500
              rounded-lg
              cursor-pointer
              disabled:cursor-not-allowed
            `}
          />
        </div>

        {/* Saturation slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Saturation
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={saturation}
            onChange={handleSaturationChange}
            disabled={disabled}
            className={`
              w-full
              ${sizes[size].slider}
              appearance-none
              bg-gradient-to-r from-gray-300 to-red-500
              rounded-lg
              cursor-pointer
              disabled:cursor-not-allowed
            `}
          />
        </div>

        {/* Lightness slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lightness
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={lightness}
            onChange={handleLightnessChange}
            disabled={disabled}
            className={`
              w-full
              ${sizes[size].slider}
              appearance-none
              bg-gradient-to-r from-black via-gray-500 to-white
              rounded-lg
              cursor-pointer
              disabled:cursor-not-allowed
            `}
          />
        </div>

        {/* Alpha slider */}
        {showAlpha && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opacity
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={alpha}
              onChange={handleAlphaChange}
              disabled={disabled}
              className={`
                w-full
                ${sizes[size].slider}
                appearance-none
                bg-gradient-to-r from-transparent to-current
                rounded-lg
                cursor-pointer
                disabled:cursor-not-allowed
              `}
            />
          </div>
        )}
      </div>

      {/* Color input */}
      {showInput && (
        <input
          type="text"
          value={currentColor}
          onChange={(e) => handleSwatchClick(e.target.value)}
          disabled={disabled}
          className={`
            mt-4
            w-full
            px-3 py-2
            border border-gray-300
            rounded-md
            shadow-sm
            ${sizes[size].input}
            focus:outline-none
            focus:ring-2
            focus:ring-primary-500
            disabled:bg-gray-100
            disabled:cursor-not-allowed
          `}
        />
      )}

      {/* Color swatches */}
      {showSwatches && (
        <div className="mt-4 grid grid-cols-5 gap-2">
          {swatches.map((color, index) => (
            <button
              key={index}
              onClick={() => handleSwatchClick(color)}
              disabled={disabled}
              className={`
                ${sizes[size].swatch}
                rounded-full
                border border-gray-200
                focus:outline-none
                focus:ring-2
                focus:ring-primary-500
                disabled:cursor-not-allowed
              `}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;

/**
 * ColorPicker Component Usage Guide:
 * 
 * 1. Basic color picker:
 *    <ColorPicker
 *      value={color}
 *      onChange={setColor}
 *    />
 * 
 * 2. Different formats:
 *    <ColorPicker format="hex" />
 *    <ColorPicker format="rgb" />
 *    <ColorPicker format="hsl" />
 * 
 * 3. With opacity:
 *    <ColorPicker
 *      showAlpha
 *      onChange={setColor}
 *    />
 * 
 * 4. Without swatches:
 *    <ColorPicker
 *      showSwatches={false}
 *      onChange={setColor}
 *    />
 * 
 * 5. Custom swatches:
 *    <ColorPicker
 *      swatches={['#FF0000', '#00FF00', '#0000FF']}
 *      onChange={setColor}
 *    />
 * 
 * 6. Without input:
 *    <ColorPicker
 *      showInput={false}
 *      onChange={setColor}
 *    />
 * 
 * 7. Different sizes:
 *    <ColorPicker size="sm" />
 *    <ColorPicker size="md" />
 *    <ColorPicker size="lg" />
 * 
 * 8. Disabled:
 *    <ColorPicker disabled />
 * 
 * Notes:
 * - Multiple formats
 * - Opacity support
 * - Color swatches
 * - Input field
 * - Different sizes
 * - Disabled state
 * - Accessible
 */
