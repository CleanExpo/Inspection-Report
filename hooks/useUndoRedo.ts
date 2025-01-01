import { useCallback, useRef } from 'react';
import type { VoiceNote } from '../types/voice';

interface Command {
  execute: () => void;
  undo: () => void;
  description: string;
}

interface UseUndoRedoProps {
  updateState: (notes: VoiceNote[]) => void;
}

export const useUndoRedo = ({ updateState }: UseUndoRedoProps) => {
  const undoStack = useRef<Command[]>([]);
  const redoStack = useRef<Command[]>([]);
  const currentNotes = useRef<VoiceNote[]>([]);

  const executeCommand = useCallback((command: Command) => {
    command.execute();
    undoStack.current.push(command);
    redoStack.current = [];
  }, []);

  const undo = useCallback(() => {
    const command = undoStack.current.pop();
    if (command) {
      command.undo();
      redoStack.current.push(command);
    }
  }, []);

  const redo = useCallback(() => {
    const command = redoStack.current.pop();
    if (command) {
      command.execute();
      undoStack.current.push(command);
    }
  }, []);

  const canUndo = useCallback(() => undoStack.current.length > 0, []);
  const canRedo = useCallback(() => redoStack.current.length > 0, []);

  const updateNotes = useCallback((notes: VoiceNote[]) => {
    currentNotes.current = notes;
    updateState(notes);
  }, [updateState]);

  const addNote = useCallback((newNote: VoiceNote) => {
    const command: Command = {
      execute: () => {
        updateState([...currentNotes.current, newNote]);
      },
      undo: () => {
        updateState(currentNotes.current.filter(n => n.id !== newNote.id));
      },
      description: `Add note: ${newNote.content.slice(0, 30)}...`
    };
    executeCommand(command);
  }, [executeCommand, updateState]);

  const updateNote = useCallback((noteId: string, updates: Partial<VoiceNote>) => {
    const oldNote = currentNotes.current.find(n => n.id === noteId);
    if (!oldNote) return;

    const command: Command = {
      execute: () => {
        updateState(
          currentNotes.current.map(n =>
            n.id === noteId ? { ...n, ...updates } : n
          )
        );
      },
      undo: () => {
        updateState(
          currentNotes.current.map(n =>
            n.id === noteId ? oldNote : n
          )
        );
      },
      description: `Update note: ${oldNote.content.slice(0, 30)}...`
    };
    executeCommand(command);
  }, [executeCommand, updateState]);

  const deleteNote = useCallback((noteId: string) => {
    const oldNote = currentNotes.current.find(n => n.id === noteId);
    if (!oldNote) return;

    const command: Command = {
      execute: () => {
        updateState(currentNotes.current.filter(n => n.id !== noteId));
      },
      undo: () => {
        updateState([...currentNotes.current, oldNote]);
      },
      description: `Delete note: ${oldNote.content.slice(0, 30)}...`
    };
    executeCommand(command);
  }, [executeCommand, updateState]);

  return {
    updateNotes,
    addNote,
    updateNote,
    deleteNote,
    undo,
    redo,
    canUndo,
    canRedo
  };
};
