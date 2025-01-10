import { HistoryManager, HistoryState } from '../history-manager';

describe('HistoryManager', () => {
    let manager: HistoryManager;
    let mockState: HistoryState;

    beforeEach(() => {
        // Mock localStorage
        const localStorageMock = {
            getItem: jest.fn() as jest.MockedFunction<typeof localStorage.getItem>,
            setItem: jest.fn() as jest.MockedFunction<typeof localStorage.setItem>,
            removeItem: jest.fn() as jest.MockedFunction<typeof localStorage.removeItem>,
            clear: jest.fn() as jest.MockedFunction<typeof localStorage.clear>,
            length: 0,
            key: jest.fn() as jest.MockedFunction<typeof localStorage.key>
        };
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });

        // Mock state
        mockState = {
            walls: [{ start: { x: 0, y: 0 }, end: { x: 100, y: 100 }, type: 'wall' }],
            readings: [{ x: 50, y: 50, value: 15, timestamp: new Date().toISOString() }],
            timestamp: new Date().toISOString()
        };

        // Create fresh manager
        manager = new HistoryManager();

        // Reset timers
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('state management', () => {
        it('should initialize with optional initial state', () => {
            const managerWithState = new HistoryManager(mockState);
            expect(managerWithState.getCurrentState()).toEqual(expect.objectContaining(mockState));
        });

        it('should push and retrieve states', () => {
            manager.pushState(mockState);
            expect(manager.getCurrentState()).toEqual(expect.objectContaining(mockState));
        });

        it('should limit number of states', () => {
            const maxStates = 50;
            for (let i = 0; i < maxStates + 10; i++) {
                manager.pushState({
                    ...mockState,
                    timestamp: new Date(2024, 0, i + 1).toISOString()
                });
            }

            const stats = manager.getStats();
            expect(stats.totalStates).toBe(maxStates);
        });
    });

    describe('undo/redo operations', () => {
        beforeEach(() => {
            // Add some states
            manager.pushState({ ...mockState, timestamp: '2024-01-01' });
            manager.pushState({ ...mockState, timestamp: '2024-01-02' });
            manager.pushState({ ...mockState, timestamp: '2024-01-03' });
        });

        it('should undo changes', () => {
            const beforeUndo = manager.getCurrentState();
            const undoneState = manager.undo();
            
            expect(undoneState).toBeDefined();
            expect(undoneState?.timestamp).toBe('2024-01-02');
            expect(manager.getCurrentState()).not.toEqual(beforeUndo);
        });

        it('should redo undone changes', () => {
            const originalState = manager.getCurrentState();
            manager.undo();
            const redoneState = manager.redo();
            
            expect(redoneState).toEqual(originalState);
        });

        it('should clear future states on new push after undo', () => {
            manager.undo(); // Go back one step
            manager.pushState({ ...mockState, timestamp: '2024-01-04' });
            
            expect(manager.canRedo()).toBe(false);
            expect(manager.getStats().totalStates).toBe(3);
        });

        it('should track undo/redo availability', () => {
            expect(manager.canUndo()).toBe(true);
            expect(manager.canRedo()).toBe(false);

            manager.undo();
            expect(manager.canUndo()).toBe(true);
            expect(manager.canRedo()).toBe(true);

            manager.undo();
            manager.undo();
            expect(manager.canUndo()).toBe(false);
            expect(manager.canRedo()).toBe(true);
        });
    });

    describe('autosave functionality', () => {
        it('should autosave state changes', () => {
            manager.pushState(mockState);
            
            // Fast-forward past debounce timeout
            jest.advanceTimersByTime(1000);
            
            expect(localStorage.setItem).toHaveBeenCalled();
            const setItemMock = localStorage.setItem as jest.MockedFunction<typeof localStorage.setItem>;
            expect(JSON.parse(setItemMock.mock.calls[0][1])).toEqual(
                expect.objectContaining({
                    state: expect.objectContaining(mockState)
                })
            );
        });

        it('should debounce autosave calls', () => {
            // Rapid state changes
            manager.pushState({ ...mockState, timestamp: '2024-01-01' });
            manager.pushState({ ...mockState, timestamp: '2024-01-02' });
            manager.pushState({ ...mockState, timestamp: '2024-01-03' });
            
            // Should not have saved yet
            expect(localStorage.setItem).not.toHaveBeenCalled();
            
            // Advance timers
            jest.advanceTimersByTime(1000);
            
            // Should have saved only once with latest state
            expect(localStorage.setItem).toHaveBeenCalledTimes(1);
            const setItemMock = localStorage.setItem as jest.MockedFunction<typeof localStorage.setItem>;
            expect(JSON.parse(setItemMock.mock.calls[0][1]).state.timestamp).toBe('2024-01-03');
        });

        it('should load autosaved state on initialization', () => {
            const savedState = {
                state: mockState,
                timestamp: new Date().toISOString()
            };
            
            localStorage.getItem = jest.fn().mockReturnValue(JSON.stringify(savedState));
            
            const newManager = new HistoryManager();
            expect(newManager.getCurrentState()).toEqual(expect.objectContaining(mockState));
        });

        it('should ignore old autosaved states', () => {
            const oldState = {
                state: mockState,
                timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() // 25 hours old
            };
            
            localStorage.getItem = jest.fn().mockReturnValue(JSON.stringify(oldState));
            
            const newManager = new HistoryManager();
            expect(newManager.getCurrentState()).toBeNull();
            expect(localStorage.removeItem).toHaveBeenCalled();
        });
    });

    describe('import/export', () => {
        it('should export history to JSON', () => {
            manager.pushState(mockState);
            const exported = manager.exportHistory();
            const parsed = JSON.parse(exported);
            
            expect(parsed).toEqual({
                states: expect.arrayContaining([expect.objectContaining(mockState)]),
                currentIndex: 0,
                timestamp: expect.any(String)
            });
        });

        it('should import history from JSON', () => {
            const historyData = {
                states: [mockState],
                currentIndex: 0,
                timestamp: new Date().toISOString()
            };

            manager.importHistory(JSON.stringify(historyData));
            expect(manager.getCurrentState()).toEqual(expect.objectContaining(mockState));
        });

        it('should handle invalid import data', () => {
            expect(() => {
                manager.importHistory('invalid json');
            }).toThrow();

            expect(() => {
                manager.importHistory('{"not": "valid history"}');
            }).toThrow();
        });
    });

    describe('error handling', () => {
        it('should handle localStorage errors gracefully', () => {
            // Mock localStorage error
            localStorage.setItem = jest.fn().mockImplementation(() => {
                throw new Error('Storage full');
            });

            // Should not throw when autosaving fails
            expect(() => {
                manager.pushState(mockState);
                jest.advanceTimersByTime(1000);
            }).not.toThrow();
        });

        it('should handle corrupted autosave data', () => {
            localStorage.getItem = jest.fn().mockReturnValue('corrupted json');

            // Should not throw on initialization
            expect(() => {
                new HistoryManager();
            }).not.toThrow();
        });
    });
});
