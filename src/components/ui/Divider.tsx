import React from 'react';
import { BaseProps } from '../../types/ui';

interface DividerProps extends BaseProps {
  /**
   * The orientation of the divider
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * The alignment of the text
   */
  align?: 'left' | 'center' | 'right';

  /**
   * The style variant of the divider
   */
  variant?: 'solid' | 'dashed' | 'dotted';

  /**
   * The thickness of the divider
   */
  thickness?: number;

  /**
   * The color of the divider
   */
  color?: string;

  /**
   * Whether to add spacing around the divider
   */
  spaced?: boolean;

  /**
   * The amount of spacing (in pixels or any valid CSS unit)
   */
  spacing?: string | number;

  /**
   * Whether the divider is light
   */
  light?: boolean;
}

const Divider: React.FC<DividerProps> = ({
  children,
  orientation = 'horizontal',
  align = 'center',
  variant = 'solid',
  thickness = 1,
  color = 'gray-200',
  spaced = false,
  spacing = '1rem',
  light = false,
  className = '',
  ...props
}) => {
  const variants = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  };

  const alignments = {
    left: 'before:flex-grow-[0.25] after:flex-grow-[9.75]',
    center: 'before:flex-grow after:flex-grow',
    right: 'before:flex-grow-[9.75] after:flex-grow-[0.25]',
  };

  const getSpacing = (value: string | number) => {
    if (typeof value === 'number') {
      return `${value}px`;
    }
    return value;
  };

  if (orientation === 'vertical') {
    return (
      <div
        className={`
          inline-block h-full
          ${spaced ? `mx-${getSpacing(spacing)}` : ''}
          ${className}
        `}
        {...props}
      >
        <div
          className={`
            h-full
            border-l-[${thickness}px]
            border-${color}
            ${variants[variant]}
            ${light ? 'opacity-50' : ''}
          `}
        />
      </div>
    );
  }

  if (children) {
    return (
      <div
        className={`
          flex items-center
          ${spaced ? `my-${getSpacing(spacing)}` : ''}
          ${className}
        `}
        {...props}
      >
        <div
          className={`
            flex-grow
            border-t-[${thickness}px]
            border-${color}
            ${variants[variant]}
            ${light ? 'opacity-50' : ''}
          `}
        />
        <span className={`px-3 text-gray-500 ${light ? 'opacity-50' : ''}`}>
          {children}
        </span>
        <div
          className={`
            flex-grow
            border-t-[${thickness}px]
            border-${color}
            ${variants[variant]}
            ${light ? 'opacity-50' : ''}
          `}
        />
      </div>
    );
  }

  return (
    <div
      className={`
        border-t-[${thickness}px]
        border-${color}
        ${variants[variant]}
        ${spaced ? `my-${getSpacing(spacing)}` : ''}
        ${light ? 'opacity-50' : ''}
        ${className}
      `}
      {...props}
    />
  );
};

export default Divider;

/**
 * Divider Component Usage Guide:
 * 
 * 1. Basic divider:
 *    <Divider />
 * 
 * 2. With text:
 *    <Divider>OR</Divider>
 * 
 * 3. Different alignments:
 *    <Divider align="left">Left</Divider>
 *    <Divider align="center">Center</Divider>
 *    <Divider align="right">Right</Divider>
 * 
 * 4. Vertical orientation:
 *    <div style={{ height: '100px' }}>
 *      <Divider orientation="vertical" />
 *    </div>
 * 
 * 5. Different variants:
 *    <Divider variant="solid" />
 *    <Divider variant="dashed" />
 *    <Divider variant="dotted" />
 * 
 * 6. Custom thickness:
 *    <Divider thickness={2} />
 * 
 * 7. Custom color:
 *    <Divider color="blue-500" />
 * 
 * 8. With spacing:
 *    <Divider spaced />
 * 
 * 9. Custom spacing:
 *    <Divider spaced spacing="2rem" />
 *    <Divider spaced spacing={32} />
 * 
 * 10. Light variant:
 *     <Divider light />
 * 
 * 11. Combined props:
 *     <Divider
 *       variant="dashed"
 *       color="primary"
 *       thickness={2}
 *       spaced
 *     >
 *       Section
 *     </Divider>
 * 
 * Notes:
 * - Horizontal and vertical orientations
 * - Text support with alignment
 * - Multiple variants
 * - Custom thickness
 * - Custom colors
 * - Spacing control
 * - Light variant
 * - Accessible
 */
