type KeyboardShortcut = {
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    preventDefault?: boolean;
    description: string;
};

type ShortcutHandler = (event: KeyboardEvent) => void;

export class KeyboardShortcutManager {
    private shortcuts: Map<string, { shortcut: KeyboardShortcut; handler: ShortcutHandler }>;
    private enabled: boolean;

    constructor() {
        this.shortcuts = new Map();
        this.enabled = true;
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    /**
     * Register a new keyboard shortcut
     */
    public register(id: string, shortcut: KeyboardShortcut, handler: ShortcutHandler): void {
        this.shortcuts.set(id, { shortcut, handler });
    }

    /**
     * Unregister a keyboard shortcut
     */
    public unregister(id: string): void {
        this.shortcuts.delete(id);
    }

    /**
     * Enable keyboard shortcuts
     */
    public enable(): void {
        this.enabled = true;
    }

    /**
     * Disable keyboard shortcuts
     */
    public disable(): void {
        this.enabled = false;
    }

    /**
     * Start listening for keyboard events
     */
    public attach(): void {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    /**
     * Stop listening for keyboard events
     */
    public detach(): void {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    /**
     * Get all registered shortcuts
     */
    public getShortcuts(): { id: string; shortcut: KeyboardShortcut }[] {
        return Array.from(this.shortcuts.entries()).map(([id, { shortcut }]) => ({
            id,
            shortcut
        }));
    }

    /**
     * Handle keydown events
     */
    private handleKeyDown(event: KeyboardEvent): void {
        if (!this.enabled) return;

        // Check if target is an input element
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            return;
        }

        for (const [, { shortcut, handler }] of this.shortcuts) {
            if (this.matchesShortcut(event, shortcut)) {
                if (shortcut.preventDefault !== false) {
                    event.preventDefault();
                }
                handler(event);
                break;
            }
        }
    }

    /**
     * Check if an event matches a shortcut
     */
    private matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
        const matchesShift = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;
        const matchesAlt = shortcut.altKey === undefined || event.altKey === shortcut.altKey;
        const matchesMeta = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;

        return matchesKey && matchesCtrl && matchesShift && matchesAlt && matchesMeta;
    }

    /**
     * Get a formatted string representation of a shortcut
     */
    public static formatShortcut(shortcut: KeyboardShortcut): string {
        const parts: string[] = [];

        if (shortcut.ctrlKey) parts.push('Ctrl');
        if (shortcut.altKey) parts.push('Alt');
        if (shortcut.shiftKey) parts.push('Shift');
        if (shortcut.metaKey) parts.push('Meta');
        parts.push(shortcut.key.toUpperCase());

        return parts.join('+');
    }

    /**
     * Get a help text for all registered shortcuts
     */
    public getShortcutsHelp(): { shortcut: string; description: string }[] {
        return Array.from(this.shortcuts.entries()).map(([, { shortcut }]) => ({
            shortcut: KeyboardShortcutManager.formatShortcut(shortcut),
            description: shortcut.description
        }));
    }
}

// Common keyboard shortcuts
export const CommonShortcuts = {
    UNDO: {
        key: 'z',
        ctrlKey: true,
        description: 'Undo last action'
    },
    REDO: {
        key: 'y',
        ctrlKey: true,
        description: 'Redo last undone action'
    },
    REDO_ALT: {
        key: 'z',
        ctrlKey: true,
        shiftKey: true,
        description: 'Redo last undone action (alternative)'
    },
    SAVE: {
        key: 's',
        ctrlKey: true,
        description: 'Save changes'
    },
    DELETE: {
        key: 'Delete',
        description: 'Delete selected item'
    },
    ESCAPE: {
        key: 'Escape',
        description: 'Cancel current operation'
    }
} as const;
