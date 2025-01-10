interface GestureEventInit extends EventInit {
    scale?: number;
    rotation?: number;
}

declare class GestureEvent extends UIEvent {
    readonly scale: number;
    readonly rotation: number;
    constructor(type: string, eventInitDict?: GestureEventInit);
}

interface Window {
    GestureEvent: typeof GestureEvent;
}

interface Element {
    ongesturestart: ((this: GlobalEventHandlers, ev: GestureEvent) => any) | null;
    ongesturechange: ((this: GlobalEventHandlers, ev: GestureEvent) => any) | null;
    ongestureend: ((this: GlobalEventHandlers, ev: GestureEvent) => any) | null;
}

// Safari-specific gesture events
interface HTMLElement {
    addEventListener(type: 'gesturestart' | 'gesturechange' | 'gestureend', listener: (event: GestureEvent) => void, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: 'gesturestart' | 'gesturechange' | 'gestureend', listener: (event: GestureEvent) => void, options?: boolean | EventListenerOptions): void;
}
