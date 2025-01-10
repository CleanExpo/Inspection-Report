import { MoisturePoint, Wall, CanvasState } from '../types/canvas';

export interface HistoryState {
    walls: Wall[];
    readings: MoisturePoint[];
    timestamp: string;
}

export class HistoryManager {
    private states: HistoryState[] = [];
    private currentIndex: number = -1;
    private maxStates: number = 50;
    private autoSaveKey: string = 'moisture-mapping-autosave';
    private debounceTimeout: number | null = null;

    constructor(initialState?: HistoryState) {
        if (initialState) {
            this.pushState(initialState);
        }
        this.loadAutosave();
    }

    /**
     * Push a new state to the history
     */
    public pushState(state: HistoryState): void {
        // If we're not at the end of the history, remove future states
        if (this.currentIndex < this.states.length - 1) {
            this.states = this.states.slice(0, this.currentIndex + 1);
        }

        // Add new state
        this.states.push({
            ...state,
            timestamp: new Date().toISOString()
        });
        this.currentIndex++;

        // Remove oldest states if we exceed maxStates
        if (this.states.length > this.maxStates) {
            this.states = this.states.slice(this.states.length - this.maxStates);
            this.currentIndex = this.states.length - 1;
        }

        // Trigger autosave
        this.scheduleAutosave();
    }

    /**
     * Undo the last action
     */
    public undo(): HistoryState | null {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.scheduleAutosave();
            return this.states[this.currentIndex];
        }
        return null;
    }

    /**
     * Redo the last undone action
     */
    public redo(): HistoryState | null {
        if (this.currentIndex < this.states.length - 1) {
            this.currentIndex++;
            this.scheduleAutosave();
            return this.states[this.currentIndex];
        }
        return null;
    }

    /**
     * Get the current state
     */
    public getCurrentState(): HistoryState | null {
        return this.currentIndex >= 0 ? this.states[this.currentIndex] : null;
    }

    /**
     * Check if undo is available
     */
    public canUndo(): boolean {
        return this.currentIndex > 0;
    }

    /**
     * Check if redo is available
     */
    public canRedo(): boolean {
        return this.currentIndex < this.states.length - 1;
    }

    /**
     * Schedule an autosave operation
     */
    private scheduleAutosave(): void {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        this.debounceTimeout = window.setTimeout(() => {
            this.saveToLocalStorage();
            this.debounceTimeout = null;
        }, 1000) as unknown as number;
    }

    /**
     * Save current state to localStorage
     */
    private saveToLocalStorage(): void {
        try {
            const currentState = this.getCurrentState();
            if (currentState) {
                localStorage.setItem(this.autoSaveKey, JSON.stringify({
                    state: currentState,
                    timestamp: new Date().toISOString()
                }));
            }
        } catch (error) {
            console.error('Failed to autosave:', error);
        }
    }

    /**
     * Load autosaved state from localStorage
     */
    private loadAutosave(): void {
        try {
            const saved = localStorage.getItem(this.autoSaveKey);
            if (saved) {
                const { state, timestamp } = JSON.parse(saved);
                const age = Date.now() - new Date(timestamp).getTime();

                // Only restore if less than 24 hours old
                if (age < 24 * 60 * 60 * 1000) {
                    this.pushState(state);
                } else {
                    localStorage.removeItem(this.autoSaveKey);
                }
            }
        } catch (error) {
            console.error('Failed to load autosave:', error);
        }
    }

    /**
     * Clear all history
     */
    public clear(): void {
        this.states = [];
        this.currentIndex = -1;
        localStorage.removeItem(this.autoSaveKey);
    }

    /**
     * Get history statistics
     */
    public getStats(): {
        totalStates: number;
        currentIndex: number;
        oldestTimestamp: string | null;
        newestTimestamp: string | null;
    } {
        return {
            totalStates: this.states.length,
            currentIndex: this.currentIndex,
            oldestTimestamp: this.states[0]?.timestamp ?? null,
            newestTimestamp: this.states[this.states.length - 1]?.timestamp ?? null
        };
    }

    /**
     * Export history to JSON
     */
    public exportHistory(): string {
        return JSON.stringify({
            states: this.states,
            currentIndex: this.currentIndex,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Import history from JSON
     */
    public importHistory(json: string): void {
        try {
            const { states, currentIndex } = JSON.parse(json);
            if (Array.isArray(states) && typeof currentIndex === 'number') {
                this.states = states;
                this.currentIndex = currentIndex;
                this.scheduleAutosave();
            }
        } catch (error) {
            throw new Error(`Failed to import history: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
