import React, { useState } from 'react';
import { BaseProps } from '../../types/ui';

interface TreeItemData {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  children?: TreeItemData[];
  disabled?: boolean;
}

interface TreeViewProps extends BaseProps {
  /**
   * The data to display in the tree
   */
  data: TreeItemData[];

  /**
   * Whether multiple items can be selected
   */
  multiSelect?: boolean;

  /**
   * The currently selected item IDs
   */
  selected?: string[];

  /**
   * Callback when selection changes
   */
  onSelect?: (ids: string[]) => void;

  /**
   * The currently expanded item IDs
   */
  expanded?: string[];

  /**
   * Callback when expansion changes
   */
  onExpand?: (ids: string[]) => void;

  /**
   * Whether to show lines connecting items
   */
  showLines?: boolean;

  /**
   * Whether to animate expand/collapse
   */
  animated?: boolean;

  /**
   * The size of the tree items
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether to show item icons
   */
  showIcons?: boolean;
}

interface TreeItemProps extends BaseProps {
  /**
   * The item data
   */
  item: TreeItemData;

  /**
   * The level of the item (for indentation)
   */
  level: number;

  /**
   * Whether the item is selected
   */
  selected: boolean;

  /**
   * Whether the item is expanded
   */
  expanded: boolean;

  /**
   * Whether multiple items can be selected
   */
  multiSelect: boolean;

  /**
   * Whether to show lines
   */
  showLines: boolean;

  /**
   * Whether to animate
   */
  animated: boolean;

  /**
   * The size of the item
   */
  size: 'sm' | 'md' | 'lg';

  /**
   * Whether to show icons
   */
  showIcons: boolean;

  /**
   * Callback when item is selected
   */
  onSelect: (id: string) => void;

  /**
   * Callback when item is expanded/collapsed
   */
  onExpand: (id: string) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({
  item,
  level,
  selected,
  expanded,
  multiSelect,
  showLines,
  animated,
  size,
  showIcons,
  onSelect,
  onExpand,
}) => {
  const hasChildren = item.children && item.children.length > 0;

  const sizes = {
    sm: {
      text: 'text-sm',
      icon: 'w-4 h-4',
      spacing: 'py-1',
    },
    md: {
      text: 'text-base',
      icon: 'w-5 h-5',
      spacing: 'py-1.5',
    },
    lg: {
      text: 'text-lg',
      icon: 'w-6 h-6',
      spacing: 'py-2',
    },
  };

  return (
    <div>
      <div
        className={`
          flex items-center
          ${sizes[size].spacing}
          ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${selected ? 'bg-primary-50 text-primary-900' : 'hover:bg-gray-50'}
          transition-colors
        `}
        style={{ paddingLeft: `${level * 1.5}rem` }}
        onClick={() => !item.disabled && onSelect(item.id)}
      >
        {/* Expand/collapse arrow */}
        {hasChildren && (
          <button
            className={`
              mr-1 p-0.5 rounded-sm
              hover:bg-gray-200
              focus:outline-none focus:ring-2 focus:ring-primary-500
              ${animated ? 'transition-transform duration-200' : ''}
              ${expanded ? 'transform rotate-90' : ''}
            `}
            onClick={(e) => {
              e.stopPropagation();
              !item.disabled && onExpand(item.id);
            }}
          >
            <svg className={sizes[size].icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Custom icon or default folder/file icon */}
        {showIcons && (
          <div className={`mr-2 ${sizes[size].icon}`}>
            {item.icon || (
              hasChildren ? (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={expanded
                      ? "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      : "M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
                    }
                  />
                </svg>
              ) : (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              )
            )}
          </div>
        )}

        {/* Label */}
        <span className={sizes[size].text}>
          {item.label}
        </span>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div
          className={`
            ${showLines ? 'border-l border-gray-200 ml-3' : ''}
            ${animated ? 'animate-expand-content' : ''}
          `}
        >
          {item.children?.map((child) => (
            <TreeItem
              key={child.id}
              item={child}
              level={level + 1}
              selected={selected}
              expanded={expanded}
              multiSelect={multiSelect}
              showLines={showLines}
              animated={animated}
              size={size}
              showIcons={showIcons}
              onSelect={onSelect}
              onExpand={onExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeView: React.FC<TreeViewProps> = ({
  data,
  multiSelect = false,
  selected = [],
  onSelect,
  expanded = [],
  onExpand,
  showLines = true,
  animated = true,
  size = 'md',
  showIcons = true,
  className = '',
  ...props
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>(selected);
  const [expandedItems, setExpandedItems] = useState<string[]>(expanded);

  const handleSelect = (id: string) => {
    let newSelected: string[];

    if (multiSelect) {
      newSelected = selectedItems.includes(id)
        ? selectedItems.filter(item => item !== id)
        : [...selectedItems, id];
    } else {
      newSelected = [id];
    }

    setSelectedItems(newSelected);
    onSelect?.(newSelected);
  };

  const handleExpand = (id: string) => {
    const newExpanded = expandedItems.includes(id)
      ? expandedItems.filter(item => item !== id)
      : [...expandedItems, id];

    setExpandedItems(newExpanded);
    onExpand?.(newExpanded);
  };

  return (
    <div
      className={`
        border border-gray-200
        rounded-lg
        overflow-hidden
        ${className}
      `}
      role="tree"
      {...props}
    >
      {data.map((item) => (
        <TreeItem
          key={item.id}
          item={item}
          level={0}
          selected={selectedItems.includes(item.id)}
          expanded={expandedItems.includes(item.id)}
          multiSelect={multiSelect}
          showLines={showLines}
          animated={animated}
          size={size}
          showIcons={showIcons}
          onSelect={handleSelect}
          onExpand={handleExpand}
        />
      ))}
    </div>
  );
};

export default TreeView;

/**
 * Add these styles to your global CSS or Tailwind config:
 * 
 * @keyframes expand {
 *   from {
 *     opacity: 0;
 *     transform: translateY(-10px);
 *   }
 *   to {
 *     opacity: 1;
 *     transform: translateY(0);
 *   }
 * }
 * 
 * .animate-expand-content {
 *   animation: expand 0.2s ease-out;
 * }
 */

/**
 * TreeView Component Usage Guide:
 * 
 * 1. Basic tree:
 *    <TreeView
 *      data={[
 *        {
 *          id: '1',
 *          label: 'Parent',
 *          children: [
 *            { id: '2', label: 'Child 1' },
 *            { id: '3', label: 'Child 2' },
 *          ],
 *        },
 *      ]}
 *    />
 * 
 * 2. Multi-select:
 *    <TreeView
 *      multiSelect
 *      data={data}
 *      selected={selectedIds}
 *      onSelect={(ids) => setSelectedIds(ids)}
 *    />
 * 
 * 3. Custom icons:
 *    <TreeView
 *      data={[
 *        {
 *          id: '1',
 *          label: 'Item',
 *          icon: <CustomIcon />,
 *        },
 *      ]}
 *    />
 * 
 * 4. Different sizes:
 *    <TreeView size="sm" />
 *    <TreeView size="md" />
 *    <TreeView size="lg" />
 * 
 * 5. Without lines:
 *    <TreeView showLines={false} />
 * 
 * 6. Without animation:
 *    <TreeView animated={false} />
 * 
 * 7. Without icons:
 *    <TreeView showIcons={false} />
 * 
 * 8. Controlled expansion:
 *    <TreeView
 *      expanded={expandedIds}
 *      onExpand={(ids) => setExpandedIds(ids)}
 *    />
 * 
 * 9. Disabled items:
 *    <TreeView
 *      data={[
 *        {
 *          id: '1',
 *          label: 'Disabled',
 *          disabled: true,
 *        },
 *      ]}
 *    />
 * 
 * Notes:
 * - Hierarchical data display
 * - Multi-select support
 * - Custom icons
 * - Different sizes
 * - Connecting lines
 * - Animations
 * - Controlled expansion
 * - Disabled state
 * - Accessible
 */
