/**
 * Web Vitals metric types and interfaces
 * Based on web.dev Core Web Vitals standards
 */

export interface Metric {
  /** Metric name (e.g., 'LCP', 'CLS', 'INP') */
  name: "LCP" | "CLS" | "INP" | "FCP" | "TTFB";

  /** Current metric value */
  value: number;

  /** Rating: 'good', 'needs-improvement', or 'poor' */
  rating: "good" | "needs-improvement" | "poor";

  /** Navigation type */
  navigationType:
    | "navigate"
    | "reload"
    | "back-forward"
    | "back-forward-cache"
    | "prerender"
    | "restore";

  /** Unique ID for this metric instance */
  id: string;

  /** Metric entries (PerformanceEntry objects) */
  entries: PerformanceEntry[];
}

export interface WebVitalsOptions {
  /** Callback when LCP is measured */
  onLCP?: (metric: Metric) => void;

  /** Callback when CLS is measured */
  onCLS?: (metric: Metric) => void;

  /** Callback when INP is measured */
  onINP?: (metric: Metric) => void;

  /** Callback when FCP is measured */
  onFCP?: (metric: Metric) => void;

  /** Callback when TTFB is measured */
  onTTFB?: (metric: Metric) => void;

  /** Report all changes (not just final values) */
  reportAllChanges?: boolean;
}

export interface WebVitalsState {
  /** Largest Contentful Paint */
  lcp: number | null;

  /** Cumulative Layout Shift */
  cls: number | null;

  /** Interaction to Next Paint */
  inp: number | null;

  /** First Contentful Paint */
  fcp: number | null;

  /** Time to First Byte */
  ttfb: number | null;

  /** Whether vitals are loading */
  isLoading: boolean;
}

export interface LCPOptions {
  /** Target LCP threshold in milliseconds */
  threshold?: number;

  /** Callback when LCP is measured */
  onMeasure?: (
    value: number,
    rating: "good" | "needs-improvement" | "poor"
  ) => void;

  /** Report all changes */
  reportAllChanges?: boolean;
}

export interface LCPState {
  /** Current LCP value in milliseconds */
  lcp: number | null;

  /** LCP rating based on web.dev thresholds */
  rating: "good" | "needs-improvement" | "poor" | null;

  /** Whether this element is likely the LCP */
  isLCP: boolean;

  /** Whether measurement is in progress */
  isLoading: boolean;
}

/**
 * Layout shift attribution information
 * Provides details about elements causing layout shifts
 */
export interface LayoutShiftAttribution {
  /** CSS selector for the shifted element (null if element was removed) */
  node: string | null;

  /** Element's position before the shift */
  previousRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  /** Element's position after the shift */
  currentRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Individual layout shift entry with details
 */
export interface LayoutShiftEntry {
  /** Layout shift score for this entry */
  value: number;

  /** Time when the shift occurred (DOMHighResTimeStamp) */
  startTime: number;

  /** Whether shift occurred within 500ms of user input */
  hadRecentInput: boolean;

  /** Elements that shifted (if attribution available) */
  sources: LayoutShiftAttribution[];
}

/**
 * CLS optimization issue detected by the hook
 */
export interface CLSIssue {
  /** Type of CLS issue detected */
  type:
    | "image-without-dimensions"
    | "unsized-media"
    | "dynamic-content"
    | "web-font-shift"
    | "ad-embed-shift"
    | "animation-shift";

  /** CSS selector or description of the element causing the issue */
  element: string | null;

  /** Contribution to total CLS score */
  contribution: number;

  /** Suggested fix for this issue */
  suggestion: string;

  /** Timestamp when the issue was detected */
  timestamp: number;
}

/**
 * CLS session window information
 * CLS uses session windows to group layout shifts
 */
export interface CLSSessionWindow {
  /** Total CLS score for this window */
  value: number;

  /** Layout shifts in this window */
  entries: LayoutShiftEntry[];

  /** Window start time */
  startTime: number;

  /** Window end time */
  endTime: number;
}

/**
 * Options for the useCLS hook
 */
export interface CLSOptions {
  /** Target CLS threshold (default: 0.1, web.dev "good" threshold) */
  threshold?: number;

  /** Callback when CLS is measured or updated */
  onMeasure?: (
    value: number,
    rating: "good" | "needs-improvement" | "poor"
  ) => void;

  /** Callback when a layout shift is detected */
  onShift?: (entry: LayoutShiftEntry) => void;

  /** Callback when a CLS issue/optimization opportunity is detected */
  onIssue?: (issue: CLSIssue) => void;

  /** Report all changes, not just final values (default: false) */
  reportAllChanges?: boolean;

  /** Enable debug mode with console warnings (default: true in development) */
  debug?: boolean;

  /**
   * Enable automatic issue detection (default: true)
   * Analyzes layout shifts to identify common CLS problems
   */
  detectIssues?: boolean;

  /**
   * Track layout shift attribution (default: true)
   * Provides detailed info about which elements shifted
   */
  trackAttribution?: boolean;

  /**
   * Observe specific container for layout shifts
   * If not provided, observes the entire document
   */
  observeRef?: React.RefObject<HTMLElement>;
}

/**
 * State returned by the useCLS hook
 */
export interface CLSState {
  /** Current CLS value (unitless, cumulative) */
  cls: number | null;

  /** CLS rating based on web.dev thresholds */
  rating: "good" | "needs-improvement" | "poor" | null;

  /** Whether measurement is in progress */
  isLoading: boolean;

  /** Individual layout shift entries */
  entries: LayoutShiftEntry[];

  /** Largest layout shift entry (main contributor to CLS) */
  largestShift: LayoutShiftEntry | null;

  /** Session windows (groups of layout shifts) */
  sessionWindows: CLSSessionWindow[];

  /** The session window with the largest CLS score */
  largestSessionWindow: CLSSessionWindow | null;

  /** Detected CLS issues and optimization opportunities */
  issues: CLSIssue[];

  /** Total number of layout shifts detected */
  shiftCount: number;

  /** Whether any shifts occurred after user interaction */
  hasPostInteractionShifts: boolean;

  /**
   * Helper utilities for CLS optimization
   */
  utils: {
    /**
     * Get a CSS selector string for an element
     * Useful for logging/debugging shifted elements
     */
    getElementSelector: (element: Element | null) => string | null;

    /**
     * Check if an element has explicit dimensions set
     * Returns true if width and height are defined
     */
    hasExplicitDimensions: (element: HTMLElement | null) => boolean;

    /**
     * Calculate aspect ratio string for an element
     * Useful for setting proper aspect-ratio CSS
     */
    getAspectRatio: (
      width: number,
      height: number
    ) => { ratio: string; decimal: number };

    /**
     * Reset CLS tracking (useful after navigation in SPAs)
     */
    reset: () => void;
  };
}
