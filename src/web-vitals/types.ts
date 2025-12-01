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

// ============================================================================
// INP (Interaction to Next Paint) Types
// ============================================================================

/**
 * Types of user interactions that contribute to INP
 * Based on web.dev specification
 */
export type INPInteractionType = "click" | "keypress" | "tap";

/**
 * Breakdown of the three phases of interaction latency
 * @see https://web.dev/articles/inp
 */
export interface INPPhaseBreakdown {
  /**
   * Input Delay: Time from user interaction to event handler start
   * Caused by main thread being busy with other tasks
   */
  inputDelay: number;

  /**
   * Processing Duration: Time spent executing event handlers
   * Includes all callbacks within the same animation frame
   */
  processingDuration: number;

  /**
   * Presentation Delay: Time from handler completion to next paint
   * Includes style calculation, layout, paint, and compositing
   */
  presentationDelay: number;
}

/**
 * Script attribution data from Long Animation Frames (LoAF) API
 * Provides details about scripts contributing to slow interactions
 */
export interface INPScriptAttribution {
  /** Source URL of the script (empty string for cross-origin without CORS) */
  sourceURL: string | null;

  /** Function name executing during the interaction */
  functionName: string | null;

  /** Character position in the source file */
  sourceCharPosition: number | null;

  /** Duration this script contributed to the interaction */
  duration: number;

  /** Whether this is a first-party or third-party script */
  isThirdParty: boolean;
}

/**
 * Detailed information about a single interaction
 */
export interface INPInteraction {
  /** Unique identifier for this interaction */
  id: string;

  /** Type of interaction (click, keypress, tap) */
  type: INPInteractionType;

  /** Total interaction latency in milliseconds */
  latency: number;

  /** Rating for this specific interaction */
  rating: "good" | "needs-improvement" | "poor";

  /** CSS selector for the element that received the interaction */
  target: string | null;

  /** Timestamp when the interaction occurred */
  startTime: number;

  /** Breakdown of latency across the three phases */
  phases: INPPhaseBreakdown;

  /** Scripts that executed during this interaction (from LoAF) */
  scripts: INPScriptAttribution[];

  /** The event type with longest duration in this interaction */
  longestEventType: string | null;
}

/**
 * Types of INP issues that can be detected
 */
export type INPIssueType =
  | "long-task"
  | "excessive-dom-size"
  | "heavy-event-handler"
  | "render-blocking-resource"
  | "third-party-script"
  | "layout-thrashing"
  | "forced-synchronous-layout"
  | "high-input-delay"
  | "high-processing-duration"
  | "high-presentation-delay"
  | "unoptimized-animation";

/**
 * INP issue/optimization opportunity detected by the hook
 */
export interface INPIssue {
  /** Type of INP issue detected */
  type: INPIssueType;

  /** CSS selector or description of the affected element/script */
  element: string | null;

  /** Contribution to INP latency in milliseconds */
  contribution: number;

  /** Which phase of interaction this issue primarily affects */
  phase: "input-delay" | "processing" | "presentation";

  /** Suggested fix for this issue */
  suggestion: string;

  /** Timestamp when the issue was detected */
  timestamp: number;

  /** Associated script URL if applicable */
  scriptURL?: string;
}

/**
 * Options for the useINP hook
 */
export interface INPOptions {
  /** Target INP threshold in milliseconds (default: 200, web.dev "good" threshold) */
  threshold?: number;

  /** Callback when INP is measured or updated */
  onMeasure?: (
    value: number,
    rating: "good" | "needs-improvement" | "poor"
  ) => void;

  /** Callback when an interaction is detected */
  onInteraction?: (interaction: INPInteraction) => void;

  /** Callback when an INP issue/optimization opportunity is detected */
  onIssue?: (issue: INPIssue) => void;

  /** Report all interactions, not just the slowest (default: false) */
  reportAllChanges?: boolean;

  /** Enable debug mode with console warnings (default: true in development) */
  debug?: boolean;

  /**
   * Enable automatic issue detection (default: true)
   * Analyzes interactions to identify common INP problems
   */
  detectIssues?: boolean;

  /**
   * Track script attribution from Long Animation Frames API (default: true)
   * Provides detailed info about which scripts caused slow interactions
   */
  trackAttribution?: boolean;

  /**
   * Minimum interaction latency to track in detail (default: 40ms)
   * Interactions below this threshold are counted but not fully analyzed
   */
  minInteractionLatency?: number;

  /**
   * Duration threshold for considering a task "long" (default: 50ms)
   * Based on web.dev recommendation
   */
  longTaskThreshold?: number;
}

/**
 * State returned by the useINP hook
 */
export interface INPState {
  /** Current INP value in milliseconds (interaction with worst latency) */
  inp: number | null;

  /** INP rating based on web.dev thresholds */
  rating: "good" | "needs-improvement" | "poor" | null;

  /** Whether measurement is in progress */
  isLoading: boolean;

  /** All tracked interactions */
  interactions: INPInteraction[];

  /** The slowest interaction (main contributor to INP) */
  slowestInteraction: INPInteraction | null;

  /** Phase breakdown of the slowest interaction */
  slowestPhases: INPPhaseBreakdown | null;

  /** Detected INP issues and optimization opportunities */
  issues: INPIssue[];

  /** Total number of interactions detected */
  interactionCount: number;

  /** Number of interactions that exceeded the threshold */
  slowInteractionCount: number;

  /** Average interaction latency across all interactions */
  averageLatency: number | null;

  /** Percentage of interactions rated "good" (≤200ms) */
  goodInteractionPercentage: number;

  /** Distribution of interactions by type */
  interactionsByType: {
    click: number;
    keypress: number;
    tap: number;
  };

  /** Scripts most frequently associated with slow interactions */
  topSlowScripts: Array<{
    url: string;
    totalDuration: number;
    occurrences: number;
    isThirdParty: boolean;
  }>;

  /**
   * Helper utilities for INP optimization
   */
  utils: {
    /**
     * Get a CSS selector string for an element
     * Useful for logging/debugging slow interaction targets
     */
    getElementSelector: (element: Element | null) => string | null;

    /**
     * Check if a script URL is third-party
     */
    isThirdPartyScript: (url: string) => boolean;

    /**
     * Get suggestions for improving a specific interaction
     */
    getSuggestions: (interaction: INPInteraction) => string[];

    /**
     * Reset INP tracking (useful after navigation in SPAs)
     */
    reset: () => void;

    /**
     * Manually record an interaction (for custom tracking)
     */
    recordInteraction: (latency: number, target?: string, type?: INPInteractionType) => void;
  };
}
