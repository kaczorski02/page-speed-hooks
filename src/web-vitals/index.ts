/**
 * @page-speed/hooks - Web Vitals
 *
 * Performance monitoring hooks for Core Web Vitals.
 * Implements web.dev best practices with zero configuration.
 *
 * @see https://web.dev/vitals/
 */

export { useWebVitals } from "./useWebVitals";
export { useLCP } from "./useLCP";
export { useCLS } from "./useCLS";

export type {
  Metric,
  WebVitalsOptions,
  WebVitalsState,
  LCPOptions,
  LCPState,
  CLSOptions,
  CLSState,
  LayoutShiftEntry,
  LayoutShiftAttribution,
  CLSSessionWindow,
  CLSIssue,
} from "./types";
