'use client';

import { useState } from 'react';
import { KEYBOARD_SHORTCUTS } from '../utils/keyboardShortcuts';

interface KeyboardShortcut {
  key: string;
  description: string;
}

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Keyboard Shortcuts
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-25"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Keyboard Shortcuts
              </h3>
            </div>
            <div className="px-4 py-3">
              <div className="space-y-2">
                {KEYBOARD_SHORTCUTS.map((shortcut: KeyboardShortcut, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="font-medium text-gray-900">
                      {shortcut.key}
                    </span>
                    <span className="text-gray-500">
                      {shortcut.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 text-right rounded-b-lg">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
