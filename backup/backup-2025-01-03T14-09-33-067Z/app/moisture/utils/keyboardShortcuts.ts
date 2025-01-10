interface KeyboardShortcut {
  action: string;
  handler: () => void;
}

export function setupKeyboardShortcuts(shortcuts: KeyboardShortcut[]): () => void {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case 'm':
        if (!event.ctrlKey && !event.metaKey) {
          const measureHandler = shortcuts.find(s => s.action === 'measure')?.handler;
          if (measureHandler) {
            event.preventDefault();
            measureHandler();
          }
        }
        break;

      case 'a':
        if (!event.ctrlKey && !event.metaKey) {
          const areaHandler = shortcuts.find(s => s.action === 'area')?.handler;
          if (areaHandler) {
            event.preventDefault();
            areaHandler();
          }
        }
        break;

      case 'p':
        if (!event.ctrlKey && !event.metaKey) {
          const perimeterHandler = shortcuts.find(s => s.action === 'perimeter')?.handler;
          if (perimeterHandler) {
            event.preventDefault();
            perimeterHandler();
          }
        }
        break;

      case 't':
        if (!event.ctrlKey && !event.metaKey) {
          const textHandler = shortcuts.find(s => s.action === 'text')?.handler;
          if (textHandler) {
            event.preventDefault();
            textHandler();
          }
        }
        break;

      case 'r':
        if (!event.ctrlKey && !event.metaKey) {
          const arrowHandler = shortcuts.find(s => s.action === 'arrow')?.handler;
          if (arrowHandler) {
            event.preventDefault();
            arrowHandler();
          }
        }
        break;

      case 'c':
        if (!event.ctrlKey && !event.metaKey) {
          const circleHandler = shortcuts.find(s => s.action === 'circle')?.handler;
          if (circleHandler) {
            event.preventDefault();
            circleHandler();
          }
        }
        break;

      case 's':
        if (!event.ctrlKey && !event.metaKey) {
          const rectangleHandler = shortcuts.find(s => s.action === 'rectangle')?.handler;
          if (rectangleHandler) {
            event.preventDefault();
            rectangleHandler();
          }
        }
        break;

      case '=':
      case '+':
        const zoomInHandler = shortcuts.find(s => s.action === 'zoomIn')?.handler;
        if (zoomInHandler) {
          event.preventDefault();
          zoomInHandler();
        }
        break;

      case '-':
      case '_':
        const zoomOutHandler = shortcuts.find(s => s.action === 'zoomOut')?.handler;
        if (zoomOutHandler) {
          event.preventDefault();
          zoomOutHandler();
        }
        break;

      case 'escape':
        const escapeHandler = shortcuts.find(s => s.action === 'escape')?.handler;
        if (escapeHandler) {
          event.preventDefault();
          escapeHandler();
        }
        break;

      case 'delete':
      case 'backspace':
        const deleteHandler = shortcuts.find(s => s.action === 'delete')?.handler;
        if (deleteHandler) {
          event.preventDefault();
          deleteHandler();
        }
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}

export const KEYBOARD_SHORTCUTS = [
  { key: 'M', description: 'Toggle distance measurement tool' },
  { key: 'A', description: 'Toggle area measurement tool' },
  { key: 'P', description: 'Toggle perimeter measurement tool' },
  { key: 'T', description: 'Add text annotation' },
  { key: 'R', description: 'Add arrow annotation' },
  { key: 'S', description: 'Add rectangle annotation' },
  { key: 'C', description: 'Add circle annotation' },
  { key: '+/=', description: 'Zoom in' },
  { key: '-/_', description: 'Zoom out' },
  { key: 'Esc', description: 'Cancel current tool / Deselect' },
  { key: 'Delete/Backspace', description: 'Delete selected annotation' }
];
