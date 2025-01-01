'use client';
import { useState, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface DragState<T> {
  item: T;
  initialPosition: Position;
  currentPosition: Position;
}

interface UseDragAndDropOptions<T> {
  items: T[];
  idField?: keyof T;
  onReorder?: (items: T[]) => void;
  onDragStart?: (item: T) => void;
  onDragEnd?: (item: T) => void;
}

export function useDragAndDrop<T extends { [key: string]: any }>({
  items,
  idField = 'id' as keyof T,
  onReorder,
  onDragStart,
  onDragEnd
}: UseDragAndDropOptions<T>) {
  const [draggedItem, setDraggedItem] = useState<DragState<T> | null>(null);
  const [orderedItems, setOrderedItems] = useState<T[]>(items);

  // Update ordered items when items prop changes
  if (JSON.stringify(items) !== JSON.stringify(orderedItems)) {
    setOrderedItems(items);
  }

  const handleDragStart = useCallback((item: T, event: React.DragEvent) => {
    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    
    setDraggedItem({
      item,
      initialPosition: {
        x: rect.left,
        y: rect.top
      },
      currentPosition: {
        x: event.clientX,
        y: event.clientY
      }
    });

    // Set drag image
    const dragImage = element.cloneNode(true) as HTMLElement;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);

    onDragStart?.(item);
  }, [onDragStart]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!draggedItem) return;

    setDraggedItem(prev => prev ? {
      ...prev,
      currentPosition: {
        x: event.clientX,
        y: event.clientY
      }
    } : null);
  }, [draggedItem]);

  const handleDragEnter = useCallback((targetItem: T) => {
    if (!draggedItem || targetItem[idField] === draggedItem.item[idField]) return;

    setOrderedItems(prev => {
      const newItems = [...prev];
      const draggedIndex = newItems.findIndex(item => item[idField] === draggedItem.item[idField]);
      const targetIndex = newItems.findIndex(item => item[idField] === targetItem[idField]);

      // Remove dragged item and insert at new position
      newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, draggedItem.item);

      return newItems;
    });
  }, [draggedItem, idField]);

  const handleDragEnd = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!draggedItem) return;

    onDragEnd?.(draggedItem.item);
    onReorder?.(orderedItems);
    setDraggedItem(null);
  }, [draggedItem, orderedItems, onDragEnd, onReorder]);

  const getDragItemProps = useCallback((item: T) => ({
    draggable: true,
    onDragStart: (event: React.DragEvent) => handleDragStart(item, event),
    onDragOver: handleDragOver,
    onDragEnter: () => handleDragEnter(item),
    onDragEnd: handleDragEnd,
    style: {
      opacity: draggedItem?.item[idField] === item[idField] ? 0.5 : 1,
      cursor: 'grab'
    }
  }), [draggedItem, handleDragStart, handleDragOver, handleDragEnter, handleDragEnd, idField]);

  return {
    orderedItems,
    draggedItem,
    getDragItemProps
  };
}
