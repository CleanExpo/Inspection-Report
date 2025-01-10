import { KeyboardShortcutManager, CommonShortcuts } from '../keyboard-shortcuts';

describe('KeyboardShortcutManager', () => {
    let manager: KeyboardShortcutManager;
    let mockHandler: jest.Mock;

    beforeEach(() => {
        manager = new KeyboardShortcutManager();
        mockHandler = jest.fn();
    });

    afterEach(() => {
        manager.detach();
    });

    describe('shortcut registration', () => {
        it('should register and handle shortcuts', () => {
            manager.register('test', CommonShortcuts.UNDO, mockHandler);
            manager.attach();

            // Simulate Ctrl+Z
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'z',
                ctrlKey: true,
                bubbles: true
            }));

            expect(mockHandler).toHaveBeenCalled();
        });

        it('should unregister shortcuts', () => {
            manager.register('test', CommonShortcuts.UNDO, mockHandler);
            manager.unregister('test');
            manager.attach();

            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'z',
                ctrlKey: true,
                bubbles: true
            }));

            expect(mockHandler).not.toHaveBeenCalled();
        });
    });

    describe('event handling', () => {
        beforeEach(() => {
            manager.register('test', CommonShortcuts.UNDO, mockHandler);
            manager.attach();
        });

        it('should handle case-insensitive key matching', () => {
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Z',
                ctrlKey: true,
                bubbles: true
            }));

            expect(mockHandler).toHaveBeenCalled();
        });

        it('should respect modifier keys', () => {
            // Without required Ctrl key
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'z',
                bubbles: true
            }));
            expect(mockHandler).not.toHaveBeenCalled();

            // With additional Shift key
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'z',
                ctrlKey: true,
                shiftKey: true,
                bubbles: true
            }));
            expect(mockHandler).not.toHaveBeenCalled();
        });

        it('should prevent default behavior by default', () => {
            const event = new KeyboardEvent('keydown', {
                key: 'z',
                ctrlKey: true,
                bubbles: true
            });
            const preventDefault = jest.spyOn(event, 'preventDefault');
            
            document.dispatchEvent(event);
            
            expect(preventDefault).toHaveBeenCalled();
        });

        it('should respect preventDefault option', () => {
            manager.register('no-prevent', {
                key: 'a',
                preventDefault: false,
                description: 'Test'
            }, mockHandler);

            const event = new KeyboardEvent('keydown', {
                key: 'a',
                bubbles: true
            });
            const preventDefault = jest.spyOn(event, 'preventDefault');
            
            document.dispatchEvent(event);
            
            expect(preventDefault).not.toHaveBeenCalled();
        });
    });

    describe('enable/disable', () => {
        beforeEach(() => {
            manager.register('test', CommonShortcuts.UNDO, mockHandler);
            manager.attach();
        });

        it('should handle shortcuts when enabled', () => {
            manager.enable();
            
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'z',
                ctrlKey: true,
                bubbles: true
            }));

            expect(mockHandler).toHaveBeenCalled();
        });

        it('should not handle shortcuts when disabled', () => {
            manager.disable();
            
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'z',
                ctrlKey: true,
                bubbles: true
            }));

            expect(mockHandler).not.toHaveBeenCalled();
        });
    });

    describe('input element handling', () => {
        beforeEach(() => {
            manager.register('test', CommonShortcuts.UNDO, mockHandler);
            manager.attach();
        });

        it('should not trigger shortcuts in input elements', () => {
            const input = document.createElement('input');
            document.body.appendChild(input);

            const event = new KeyboardEvent('keydown', {
                key: 'z',
                ctrlKey: true,
                bubbles: true
            });
            Object.defineProperty(event, 'target', { value: input });
            
            document.dispatchEvent(event);
            
            expect(mockHandler).not.toHaveBeenCalled();
            
            document.body.removeChild(input);
        });

        it('should not trigger shortcuts in textarea elements', () => {
            const textarea = document.createElement('textarea');
            document.body.appendChild(textarea);

            const event = new KeyboardEvent('keydown', {
                key: 'z',
                ctrlKey: true,
                bubbles: true
            });
            Object.defineProperty(event, 'target', { value: textarea });
            
            document.dispatchEvent(event);
            
            expect(mockHandler).not.toHaveBeenCalled();
            
            document.body.removeChild(textarea);
        });
    });

    describe('shortcut formatting', () => {
        it('should format shortcuts correctly', () => {
            expect(KeyboardShortcutManager.formatShortcut(CommonShortcuts.UNDO))
                .toBe('Ctrl+Z');

            expect(KeyboardShortcutManager.formatShortcut(CommonShortcuts.REDO_ALT))
                .toBe('Ctrl+Shift+Z');

            expect(KeyboardShortcutManager.formatShortcut({
                key: 'a',
                ctrlKey: true,
                altKey: true,
                metaKey: true,
                description: 'Test'
            })).toBe('Ctrl+Alt+Meta+A');
        });
    });

    describe('help text generation', () => {
        it('should generate help text for registered shortcuts', () => {
            manager.register('undo', CommonShortcuts.UNDO, mockHandler);
            manager.register('redo', CommonShortcuts.REDO, mockHandler);

            const help = manager.getShortcutsHelp();
            
            expect(help).toContainEqual({
                shortcut: 'Ctrl+Z',
                description: CommonShortcuts.UNDO.description
            });
            expect(help).toContainEqual({
                shortcut: 'Ctrl+Y',
                description: CommonShortcuts.REDO.description
            });
        });
    });

    describe('cleanup', () => {
        it('should properly detach event listeners', () => {
            const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
            
            manager.attach();
            manager.detach();
            
            expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        });
    });
});
