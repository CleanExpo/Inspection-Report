import React from 'react';
import { BaseProps } from '../../types/ui';

interface BreadcrumbItemProps extends BaseProps {
  /**
   * Whether the item is active (current page)
   */
  active?: boolean;

  /**
   * The URL for the breadcrumb item
   */
  href?: string;

  /**
   * The icon to display before the item
   */
  icon?: React.ReactNode;

  /**
   * Whether to truncate the text
   */
  truncate?: boolean;
}

interface BreadcrumbProps extends BaseProps {
  /**
   * The separator between items
   */
  separator?: React.ReactNode;

  /**
   * The size of the breadcrumb
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether to show icons
   */
  showIcons?: boolean;

  /**
   * Whether to truncate items
   */
  truncate?: boolean;

  /**
   * Maximum number of items to show before truncating
   */
  maxItems?: number;

  /**
   * Whether to show the full path on hover when truncated
   */
  showFullPathOnHover?: boolean;
}

interface BreadcrumbComposition {
  Item: React.FC<BreadcrumbItemProps>;
}

const defaultSeparator = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const Breadcrumb: React.FC<BreadcrumbProps> & BreadcrumbComposition = ({
  children,
  separator = defaultSeparator,
  size = 'md',
  showIcons = true,
  truncate = false,
  maxItems,
  showFullPathOnHover = true,
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const items = React.Children.toArray(children);
  const itemCount = items.length;

  const renderItems = () => {
    if (!maxItems || itemCount <= maxItems) {
      return items.map((item, index) => (
        <React.Fragment key={index}>
          {item}
          {index < itemCount - 1 && (
            <li className="flex items-center text-gray-400 mx-2">
              {separator}
            </li>
          )}
        </React.Fragment>
      ));
    }

    const firstItems = items.slice(0, Math.ceil(maxItems / 2));
    const lastItems = items.slice(itemCount - Math.floor(maxItems / 2));

    return (
      <>
        {firstItems.map((item, index) => (
          <React.Fragment key={index}>
            {item}
            <li className="flex items-center text-gray-400 mx-2">
              {separator}
            </li>
          </React.Fragment>
        ))}
        <li
          className="flex items-center mx-2"
          title={showFullPathOnHover ? items.map(item => (item as React.ReactElement).props.children).join(' / ') : undefined}
        >
          <span className="text-gray-400">...</span>
        </li>
        {lastItems.map((item, index) => (
          <React.Fragment key={index + itemCount - lastItems.length}>
            {item}
            {index < lastItems.length - 1 && (
              <li className="flex items-center text-gray-400 mx-2">
                {separator}
              </li>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <nav aria-label="breadcrumb" {...props}>
      <ol
        className={`
          flex items-center
          ${sizes[size]}
          ${className}
        `}
      >
        {renderItems()}
      </ol>
    </nav>
  );
};

const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  children,
  active = false,
  href,
  icon,
  truncate = false,
  className = '',
  ...props
}) => {
  const content = (
    <span className="flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      <span className={truncate ? 'truncate' : ''}>
        {children}
      </span>
    </span>
  );

  return (
    <li
      className={`
        ${active ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}
        ${className}
      `}
      aria-current={active ? 'page' : undefined}
      {...props}
    >
      {href && !active ? (
        <a
          href={href}
          className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </li>
  );
};

Breadcrumb.Item = BreadcrumbItem;

export default Breadcrumb;

/**
 * Breadcrumb Component Usage Guide:
 * 
 * 1. Basic breadcrumb:
 *    <Breadcrumb>
 *      <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
 *      <Breadcrumb.Item href="/products">Products</Breadcrumb.Item>
 *      <Breadcrumb.Item active>Categories</Breadcrumb.Item>
 *    </Breadcrumb>
 * 
 * 2. Different sizes:
 *    <Breadcrumb size="sm" />
 *    <Breadcrumb size="md" />
 *    <Breadcrumb size="lg" />
 * 
 * 3. Custom separator:
 *    <Breadcrumb separator="/">
 *      <Breadcrumb.Item>Home</Breadcrumb.Item>
 *      <Breadcrumb.Item>Products</Breadcrumb.Item>
 *    </Breadcrumb>
 * 
 * 4. With icons:
 *    <Breadcrumb>
 *      <Breadcrumb.Item icon={<HomeIcon />}>Home</Breadcrumb.Item>
 *      <Breadcrumb.Item icon={<FolderIcon />}>Products</Breadcrumb.Item>
 *    </Breadcrumb>
 * 
 * 5. Truncated items:
 *    <Breadcrumb truncate>
 *      <Breadcrumb.Item>Very Long Text That Should Be Truncated</Breadcrumb.Item>
 *      <Breadcrumb.Item>Another Long Item</Breadcrumb.Item>
 *    </Breadcrumb>
 * 
 * 6. Maximum items:
 *    <Breadcrumb maxItems={3}>
 *      <Breadcrumb.Item>Home</Breadcrumb.Item>
 *      <Breadcrumb.Item>Products</Breadcrumb.Item>
 *      <Breadcrumb.Item>Categories</Breadcrumb.Item>
 *      <Breadcrumb.Item>Electronics</Breadcrumb.Item>
 *      <Breadcrumb.Item active>Phones</Breadcrumb.Item>
 *    </Breadcrumb>
 * 
 * 7. Without icons:
 *    <Breadcrumb showIcons={false}>
 *      <Breadcrumb.Item>Home</Breadcrumb.Item>
 *      <Breadcrumb.Item>Products</Breadcrumb.Item>
 *    </Breadcrumb>
 * 
 * 8. With full path on hover:
 *    <Breadcrumb
 *      maxItems={3}
 *      showFullPathOnHover
 *    >
 *      <Breadcrumb.Item>Home</Breadcrumb.Item>
 *      <Breadcrumb.Item>Products</Breadcrumb.Item>
 *      <Breadcrumb.Item>Categories</Breadcrumb.Item>
 *      <Breadcrumb.Item>Electronics</Breadcrumb.Item>
 *      <Breadcrumb.Item active>Phones</Breadcrumb.Item>
 *    </Breadcrumb>
 * 
 * Notes:
 * - Multiple sizes
 * - Custom separators
 * - Icon support
 * - Truncation
 * - Maximum items
 * - Full path hover
 * - Active state
 * - Link support
 * - Accessible
 */
