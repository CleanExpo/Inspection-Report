import React from 'react';
import { BaseProps } from '../../types/ui';

interface AvatarProps extends BaseProps {
  /**
   * The source URL of the avatar image
   */
  src?: string;

  /**
   * Alt text for the avatar image
   */
  alt?: string;

  /**
   * Fallback text to display when image fails to load or no image is provided
   */
  fallback?: string;

  /**
   * The size of the avatar
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  /**
   * The shape of the avatar
   */
  shape?: 'circle' | 'square' | 'rounded';

  /**
   * The status indicator to display
   */
  status?: 'online' | 'offline' | 'away' | 'busy';

  /**
   * Whether to show a border
   */
  bordered?: boolean;

  /**
   * The color of the avatar when displaying initials
   */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | number;

  /**
   * Whether to show a loading state
   */
  loading?: boolean;

  /**
   * Callback when the avatar fails to load
   */
  onError?: () => void;
}

interface AvatarGroupProps extends BaseProps {
  /**
   * The maximum number of avatars to display
   */
  max?: number;

  /**
   * The spacing between avatars
   */
  spacing?: number;

  /**
   * Whether to stack avatars vertically
   */
  vertical?: boolean;
}

interface AvatarComposition {
  Group: React.FC<AvatarGroupProps>;
}

const Avatar: React.FC<AvatarProps> & AvatarComposition = ({
  src,
  alt,
  fallback,
  size = 'md',
  shape = 'circle',
  status,
  bordered = false,
  color = 'primary',
  loading = false,
  onError,
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = React.useState(false);

  const sizes = {
    xs: {
      avatar: 'w-6 h-6',
      text: 'text-xs',
      status: 'w-1.5 h-1.5',
    },
    sm: {
      avatar: 'w-8 h-8',
      text: 'text-sm',
      status: 'w-2 h-2',
    },
    md: {
      avatar: 'w-10 h-10',
      text: 'text-base',
      status: 'w-2.5 h-2.5',
    },
    lg: {
      avatar: 'w-12 h-12',
      text: 'text-lg',
      status: 'w-3 h-3',
    },
    xl: {
      avatar: 'w-14 h-14',
      text: 'text-xl',
      status: 'w-3.5 h-3.5',
    },
    '2xl': {
      avatar: 'w-16 h-16',
      text: 'text-2xl',
      status: 'w-4 h-4',
    },
  };

  const shapes = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const statuses = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  const colors = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const getInitials = (text?: string) => {
    if (!text) return '';
    return text
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBackgroundColor = () => {
    if (typeof color === 'number') {
      const hue = color * 137.508; // Golden angle approximation
      return `hsl(${hue}, 70%, 95%)`;
    }
    return '';
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div
      className={`
        relative
        inline-flex
        items-center
        justify-center
        ${sizes[size].avatar}
        ${shapes[shape]}
        ${bordered ? 'border-2 border-white ring-2 ring-gray-200' : ''}
        ${loading ? 'animate-pulse' : ''}
        ${typeof color === 'string' ? colors[color as keyof typeof colors] : ''}
        ${className}
      `}
      style={typeof color === 'number' ? { backgroundColor: getBackgroundColor() } : undefined}
      {...props}
    >
      {loading ? (
        <div className="w-full h-full bg-gray-200 rounded-inherit" />
      ) : !hasError && src ? (
        <img
          src={src}
          alt={alt}
          onError={handleError}
          className={`w-full h-full object-cover ${shapes[shape]}`}
        />
      ) : (
        <span className={`font-medium ${sizes[size].text}`}>
          {getInitials(fallback || alt)}
        </span>
      )}

      {status && (
        <span
          className={`
            absolute
            bottom-0
            right-0
            block
            ${sizes[size].status}
            ${shapes.circle}
            ${statuses[status]}
            ring-2 ring-white
          `}
        />
      )}
    </div>
  );
};

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max,
  spacing = -2,
  vertical = false,
  className = '',
  ...props
}) => {
  const childrenArray = React.Children.toArray(children);
  const excess = max ? childrenArray.length - max : 0;
  const visibleAvatars = max ? childrenArray.slice(0, max) : childrenArray;

  return (
    <div
      className={`
        inline-flex
        ${vertical ? 'flex-col' : 'flex-row'}
        items-center
        ${className}
      `}
      style={{
        [vertical ? 'marginTop' : 'marginLeft']: `${spacing}px`,
      }}
      {...props}
    >
      {visibleAvatars.map((child, index) => (
        <div
          key={index}
          style={{
            [vertical ? 'marginTop' : 'marginLeft']: `${-spacing}px`,
          }}
        >
          {child}
        </div>
      ))}
      {excess > 0 && (
        <Avatar
          style={{
            [vertical ? 'marginTop' : 'marginLeft']: `${-spacing}px`,
          }}
          fallback={`+${excess}`}
          color="secondary"
        />
      )}
    </div>
  );
};

Avatar.Group = AvatarGroup;

export default Avatar;

/**
 * Avatar Component Usage Guide:
 * 
 * 1. Basic avatar:
 *    <Avatar src="user.jpg" alt="User Name" />
 * 
 * 2. Different sizes:
 *    <Avatar size="xs" />
 *    <Avatar size="sm" />
 *    <Avatar size="md" />
 *    <Avatar size="lg" />
 *    <Avatar size="xl" />
 *    <Avatar size="2xl" />
 * 
 * 3. Different shapes:
 *    <Avatar shape="circle" />
 *    <Avatar shape="square" />
 *    <Avatar shape="rounded" />
 * 
 * 4. With status:
 *    <Avatar status="online" />
 *    <Avatar status="offline" />
 *    <Avatar status="away" />
 *    <Avatar status="busy" />
 * 
 * 5. With border:
 *    <Avatar bordered />
 * 
 * 6. Different colors:
 *    <Avatar color="primary" />
 *    <Avatar color="secondary" />
 *    <Avatar color="success" />
 *    <Avatar color="warning" />
 *    <Avatar color="error" />
 *    <Avatar color="info" />
 * 
 * 7. With fallback:
 *    <Avatar
 *      fallback="John Doe"
 *      color="primary"
 *    />
 * 
 * 8. Loading state:
 *    <Avatar loading />
 * 
 * 9. Avatar group:
 *    <Avatar.Group>
 *      <Avatar src="user1.jpg" />
 *      <Avatar src="user2.jpg" />
 *      <Avatar src="user3.jpg" />
 *    </Avatar.Group>
 * 
 * 10. Avatar group with max:
 *     <Avatar.Group max={3}>
 *       <Avatar src="user1.jpg" />
 *       <Avatar src="user2.jpg" />
 *       <Avatar src="user3.jpg" />
 *       <Avatar src="user4.jpg" />
 *     </Avatar.Group>
 * 
 * 11. Vertical avatar group:
 *     <Avatar.Group vertical>
 *       <Avatar src="user1.jpg" />
 *       <Avatar src="user2.jpg" />
 *     </Avatar.Group>
 * 
 * Notes:
 * - Multiple sizes
 * - Different shapes
 * - Status indicators
 * - Border option
 * - Color variants
 * - Fallback initials
 * - Loading state
 * - Group support
 * - Max display
 * - Vertical layout
 * - Accessible
 */
