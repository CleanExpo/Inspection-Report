export interface ScrollSection {
  id: string;
  element: HTMLElement;
  top: number;
  bottom: number;
}

export interface ScrollProgress {
  currentSection: string | null;
  percentComplete: number;
  isAtTop: boolean;
  isAtBottom: boolean;
}

export interface UseScrollOptions {
  offset?: number;  // Offset from the top for sticky headers
  threshold?: number;  // Intersection threshold
  smooth?: boolean;  // Enable/disable smooth scrolling
}

export interface ScrollToOptions extends ScrollIntoViewOptions {
  offset?: number;  // Additional offset when scrolling to element
}
