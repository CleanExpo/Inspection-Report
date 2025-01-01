'use client';
import { useEffect, useCallback } from 'react';

export interface ShortcutAction {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  onShortcutTriggered?: (shortcut: ShortcutAction) => void;
}

export function useKeyboardShortcuts(
  shortcuts: ShortcutAction[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, onShortcutTriggered } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in input fields
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target instanceof HTMLElement && event.target.isContentEditable)
    ) {
      return;
    }

    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrl === event.ctrlKey;
      const shiftMatch = !!shortcut.shift === event.shiftKey;
      const altMatch = !!shortcut.alt === event.altKey;

      return keyMatch && ctrlMatch && shiftMatch && altMatch;
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
      onShortcutTriggered?.(matchingShortcut);
    }
  }, [shortcuts, enabled, onShortcutTriggered]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Return list of available shortcuts for documentation
  const getShortcutList = useCallback(() => {
    return shortcuts.map(shortcut => ({
      key: shortcut.key,
      ctrl: shortcut.ctrl,
      shift: shortcut.shift,
      alt: shortcut.alt,
      description: shortcut.description
    }));
  }, [shortcuts]);

  // Format shortcut for display
  const formatShortcut = useCallback((shortcut: ShortcutAction): string => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  }, []);

  return {
    getShortcutList,
    formatShortcut
  };
}

// Shortcut action types
export interface NoteShortcutActions {
  selectAll: () => void;
  clearSelection: () => void;
  deleteSelected: () => void;
  exportSelected: () => void;
  focusSearch: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  toggleTranscript: () => void;
  showShortcuts: () => void;
}

export interface EditorShortcutActions {
  saveChanges: () => void;
  cancelEditing: () => void;
}

export interface PhotoShortcutActions {
  previousPhoto: () => void;
  nextPhoto: () => void;
  deletePhoto: () => void;
  editCaption: () => void;
}

// Create shortcut groups with actions
export function createNoteShortcuts(actions: NoteShortcutActions): ShortcutAction[] {
  return [
    {
      key: 'a',
      ctrl: true,
      description: 'Select all notes',
      action: actions.selectAll
    },
    {
      key: 'Escape',
      description: 'Clear selection',
      action: actions.clearSelection
    },
    {
      key: 'Delete',
      description: 'Delete selected notes',
      action: actions.deleteSelected
    },
    {
      key: 'e',
      ctrl: true,
      description: 'Export selected notes',
      action: actions.exportSelected
    },
    {
      key: 'f',
      ctrl: true,
      description: 'Focus search',
      action: actions.focusSearch
    },
    {
      key: 'r',
      ctrl: true,
      description: 'Start recording',
      action: actions.startRecording
    },
    {
      key: 's',
      ctrl: true,
      description: 'Stop recording',
      action: actions.stopRecording
    },
    {
      key: 't',
      ctrl: true,
      description: 'Toggle transcript',
      action: actions.toggleTranscript
    },
    {
      key: '/',
      description: 'Show keyboard shortcuts',
      action: actions.showShortcuts
    }
  ];
}

export function createEditorShortcuts(actions: EditorShortcutActions): ShortcutAction[] {
  return [
    {
      key: 'Enter',
      ctrl: true,
      description: 'Save changes',
      action: actions.saveChanges
    },
    {
      key: 'Escape',
      description: 'Cancel editing',
      action: actions.cancelEditing
    }
  ];
}

export function createPhotoShortcuts(actions: PhotoShortcutActions): ShortcutAction[] {
  return [
    {
      key: 'ArrowLeft',
      description: 'Previous photo',
      action: actions.previousPhoto
    },
    {
      key: 'ArrowRight',
      description: 'Next photo',
      action: actions.nextPhoto
    },
    {
      key: 'Delete',
      description: 'Delete photo',
      action: actions.deletePhoto
    },
    {
      key: 'e',
      ctrl: true,
      description: 'Edit caption',
      action: actions.editCaption
    }
  ];
}

// Helper function to check if a key event matches a shortcut
export function matchesShortcut(event: KeyboardEvent, shortcut: ShortcutAction): boolean {
  return (
    event.key.toLowerCase() === shortcut.key.toLowerCase() &&
    !!shortcut.ctrl === event.ctrlKey &&
    !!shortcut.shift === event.shiftKey &&
    !!shortcut.alt === event.altKey
  );
}
