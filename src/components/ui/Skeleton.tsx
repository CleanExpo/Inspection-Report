import React from 'react';
import { BaseProps } from '../../types/ui';

interface SkeletonProps extends BaseProps {
  /**
   * The variant of the skeleton
   */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';

  /**
   * The width of the skeleton
   */
  width?: number | string;

  /**
   * The height of the skeleton
   */
  height?: number | string;

  /**
   * The animation type
   */
  animation?: 'pulse' | 'wave' | 'none';

  /**
   * Whether to show the skeleton
   */
  loading?: boolean;

  /**
   * Number of lines for text variant
   */
  lines?: number;

  /**
   * Whether to show different widths for text lines
   */
  randomWidths?: boolean;
}

interface SkeletonComposition {
  Text: React.FC<Omit<SkeletonProps, 'variant'>>;
  Circle: React.FC<Omit<SkeletonProps, 'variant'>>;
  Rectangle: React.FC<Omit<SkeletonProps, 'variant'>>;
}

const Skeleton: React.FC<SkeletonProps> & SkeletonComposition = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  loading = true,
  lines = 1,
  randomWidths = false,
  children,
  className = '',
  ...props
}) => {
  if (!loading) {
    return <>{children}</>;
  }

  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-skeleton-wave',
    none: '',
  };

  const getRandomWidth = () => {
    const widths = ['75%', '85%', '95%'];
    return widths[Math.floor(Math.random() * widths.length)];
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`
              bg-gray-200
              ${variants[variant]}
              ${animations[animation]}
            `}
            style={{
              width: randomWidths && index !== lines - 1 ? getRandomWidth() : width ?? '100%',
              height: height ?? '1em',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`
        bg-gray-200
        ${variants[variant]}
        ${animations[animation]}
        ${className}
      `}
      style={{
        width: width ?? (variant === 'text' ? '100%' : undefined),
        height: height ?? (variant === 'text' ? '1em' : undefined),
      }}
      {...props}
    />
  );
};

const SkeletonText: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton variant="text" {...props} />
);

const SkeletonCircle: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton variant="circular" {...props} />
);

const SkeletonRectangle: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton variant="rectangular" {...props} />
);

Skeleton.Text = SkeletonText;
Skeleton.Circle = SkeletonCircle;
Skeleton.Rectangle = SkeletonRectangle;

export default Skeleton;

/**
 * Add these styles to your global CSS or Tailwind config:
 * 
 * @keyframes skeleton-wave {
 *   0% {
 *     background-position: 100% 50%;
 *   }
 *   100% {
 *     background-position: 0 50%;
 *   }
 * }
 * 
 * .animate-skeleton-wave {
 *   background: linear-gradient(
 *     90deg,
 *     rgba(0, 0, 0, 0.06) 25%,
 *     rgba(0, 0, 0, 0.15) 37%,
 *     rgba(0, 0, 0, 0.06) 63%
 *   );
 *   background-size: 400% 100%;
 *   animation: skeleton-wave 1.4s ease infinite;
 * }
 */

/**
 * Skeleton Component Usage Guide:
 * 
 * 1. Basic skeleton:
 *    <Skeleton width={200} height={20} />
 * 
 * 2. Different variants:
 *    <Skeleton variant="text" />
 *    <Skeleton variant="circular" width={40} height={40} />
 *    <Skeleton variant="rectangular" width={200} height={100} />
 *    <Skeleton variant="rounded" width={200} height={100} />
 * 
 * 3. Different animations:
 *    <Skeleton animation="pulse" />
 *    <Skeleton animation="wave" />
 *    <Skeleton animation="none" />
 * 
 * 4. Multiple text lines:
 *    <Skeleton
 *      variant="text"
 *      lines={3}
 *    />
 * 
 * 5. Random widths for text lines:
 *    <Skeleton
 *      variant="text"
 *      lines={3}
 *      randomWidths
 *    />
 * 
 * 6. Using composition:
 *    <Skeleton.Text width={200} />
 *    <Skeleton.Circle width={40} height={40} />
 *    <Skeleton.Rectangle width={200} height={100} />
 * 
 * 7. Conditional rendering:
 *    <Skeleton loading={isLoading}>
 *      <div>Content</div>
 *    </Skeleton>
 * 
 * 8. Complex loading state:
 *    <div className="space-y-4">
 *      <Skeleton.Circle width={50} height={50} />
 *      <div className="space-y-2">
 *        <Skeleton.Text width={200} />
 *        <Skeleton.Text width={150} />
 *      </div>
 *    </div>
 * 
 * Notes:
 * - Multiple variants
 * - Different animations
 * - Text lines support
 * - Random widths
 * - Composition API
 * - Conditional rendering
 * - Accessible
 */
