import React from 'react';
import { BaseProps } from '../../types/ui';

interface CardProps extends BaseProps {
  /**
   * The variant of the card
   */
  variant?: 'elevated' | 'outlined' | 'filled';

  /**
   * Whether to disable hover effects
   */
  disableHover?: boolean;

  /**
   * Whether to add padding to the card
   */
  padded?: boolean;

  /**
   * Whether the card is clickable
   */
  clickable?: boolean;

  /**
   * Whether the card is disabled
   */
  disabled?: boolean;

  /**
   * Whether to show a loading state
   */
  loading?: boolean;

  /**
   * Whether to center the content
   */
  centered?: boolean;

  /**
   * The border radius size
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

interface CardComposition {
  Header: React.FC<BaseProps>;
  Body: React.FC<BaseProps>;
  Footer: React.FC<BaseProps>;
  Title: React.FC<BaseProps>;
  Subtitle: React.FC<BaseProps>;
  Actions: React.FC<BaseProps>;
  Image: React.FC<React.ImgHTMLAttributes<HTMLImageElement>>;
}

const Card: React.FC<CardProps> & CardComposition = ({
  children,
  variant = 'elevated',
  disableHover = false,
  padded = true,
  clickable = false,
  disabled = false,
  loading = false,
  centered = false,
  radius = 'md',
  className = '',
  ...props
}) => {
  const variants = {
    elevated: 'bg-white shadow-md hover:shadow-lg',
    outlined: 'bg-white border border-gray-200 hover:border-gray-300',
    filled: 'bg-gray-50 hover:bg-gray-100',
  };

  const radiusSize = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
  };

  return (
    <div
      className={`
        relative
        overflow-hidden
        transition-all duration-200
        ${variants[variant]}
        ${radiusSize[radius]}
        ${padded ? 'p-4' : ''}
        ${clickable && !disabled ? 'cursor-pointer' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${!disableHover && !disabled ? variants[variant] : ''}
        ${centered ? 'flex flex-col items-center text-center' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      ) : null}
      {children}
    </div>
  );
};

const CardHeader: React.FC<BaseProps> = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className={`-m-4 mb-4 p-4 border-b border-gray-200 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardBody: React.FC<BaseProps> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={className} {...props}>
    {children}
  </div>
);

const CardFooter: React.FC<BaseProps> = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className={`-m-4 mt-4 p-4 border-t border-gray-200 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardTitle: React.FC<BaseProps> = ({
  children,
  className = '',
  ...props
}) => (
  <h3
    className={`text-lg font-semibold text-gray-900 ${className}`}
    {...props}
  >
    {children}
  </h3>
);

const CardSubtitle: React.FC<BaseProps> = ({
  children,
  className = '',
  ...props
}) => (
  <h4
    className={`text-sm text-gray-600 ${className}`}
    {...props}
  >
    {children}
  </h4>
);

const CardActions: React.FC<BaseProps> = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className={`flex items-center space-x-2 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({
  className = '',
  alt = '',
  ...props
}) => (
  <img
    className={`-m-4 mb-4 w-full ${className}`}
    alt={alt}
    {...props}
  />
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Actions = CardActions;
Card.Image = CardImage;

export default Card;

/**
 * Card Component Usage Guide:
 * 
 * 1. Basic card:
 *    <Card>
 *      <Card.Body>Content</Card.Body>
 *    </Card>
 * 
 * 2. With header and footer:
 *    <Card>
 *      <Card.Header>Header</Card.Header>
 *      <Card.Body>Content</Card.Body>
 *      <Card.Footer>Footer</Card.Footer>
 *    </Card>
 * 
 * 3. With title and subtitle:
 *    <Card>
 *      <Card.Title>Title</Card.Title>
 *      <Card.Subtitle>Subtitle</Card.Subtitle>
 *      <Card.Body>Content</Card.Body>
 *    </Card>
 * 
 * 4. With image:
 *    <Card>
 *      <Card.Image src="image.jpg" alt="Card image" />
 *      <Card.Body>Content</Card.Body>
 *    </Card>
 * 
 * 5. Different variants:
 *    <Card variant="elevated" />
 *    <Card variant="outlined" />
 *    <Card variant="filled" />
 * 
 * 6. With actions:
 *    <Card>
 *      <Card.Body>Content</Card.Body>
 *      <Card.Actions>
 *        <Button>Action 1</Button>
 *        <Button>Action 2</Button>
 *      </Card.Actions>
 *    </Card>
 * 
 * 7. Loading state:
 *    <Card loading>
 *      <Card.Body>Content</Card.Body>
 *    </Card>
 * 
 * 8. Clickable:
 *    <Card
 *      clickable
 *      onClick={() => console.log('clicked')}
 *    >
 *      <Card.Body>Clickable Card</Card.Body>
 *    </Card>
 * 
 * 9. Different radius:
 *    <Card radius="none" />
 *    <Card radius="sm" />
 *    <Card radius="md" />
 *    <Card radius="lg" />
 *    <Card radius="xl" />
 * 
 * 10. Centered content:
 *     <Card centered>
 *       <Card.Body>Centered Content</Card.Body>
 *     </Card>
 * 
 * Notes:
 * - Multiple variants
 * - Header and footer support
 * - Title and subtitle components
 * - Image support
 * - Action buttons
 * - Loading state
 * - Clickable cards
 * - Different border radius options
 * - Content alignment
 * - Accessible
 */
