"use client";

import { useEffect, useState } from "react";
import { onCLS, onINP, onLCP, onFCP, onTTFB } from "web-vitals";
import type { WebVitalsOptions, WebVitalsState } from "./types";

/**
 * useWebVitals
 *
 * Tracks Core Web Vitals metrics (LCP, CLS, INP) and additional performance metrics (FCP, TTFB).
 * Implements web.dev best practices for performance monitoring.
 *
 * @see https://web.dev/vitals/
 *
 * @example
 * ```tsx
 * function App() {
 *   const vitals = useWebVitals({
 *     onLCP: (metric) => analytics.track('LCP', metric.value),
 *     onCLS: (metric) => analytics.track('CLS', metric.value),
 *     reportAllChanges: true
 *   })
 *
 *   return (
 *     <div>
 *       <p>LCP: {vitals.lcp}ms</p>
 *       <p>CLS: {vitals.cls}</p>
 *       <p>INP: {vitals.inp}ms</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useWebVitals(options: WebVitalsOptions = {}): WebVitalsState {
  const [vitals, setVitals] = useState<WebVitalsState>({
    lcp: null,
    cls: null,
    inp: null,
    fcp: null,
    ttfb: null,
    isLoading: true,
  });

  useEffect(() => {
    // Skip if not in browser
    if (typeof window === "undefined") {
      return;
    }

    const { reportAllChanges = false } = options;

    // Track LCP (Largest Contentful Paint)
    // Target: < 2.5s (good), 2.5s-4.0s (needs improvement), > 4.0s (poor)
    onLCP(
      (metric) => {
        setVitals((prev) => ({ ...prev, lcp: metric.value, isLoading: false }));
        options.onLCP?.(metric);
      },
      { reportAllChanges }
    );

    // Track CLS (Cumulative Layout Shift)
    // Target: < 0.1 (good), 0.1-0.25 (needs improvement), > 0.25 (poor)
    onCLS(
      (metric) => {
        setVitals((prev) => ({ ...prev, cls: metric.value }));
        options.onCLS?.(metric);
      },
      { reportAllChanges }
    );

    // Track INP (Interaction to Next Paint)
    // Target: < 200ms (good), 200ms-500ms (needs improvement), > 500ms (poor)
    onINP(
      (metric) => {
        setVitals((prev) => ({ ...prev, inp: metric.value }));
        options.onINP?.(metric);
      },
      { reportAllChanges }
    );

    // Track FCP (First Contentful Paint)
    // Target: < 1.8s (good), 1.8s-3.0s (needs improvement), > 3.0s (poor)
    onFCP(
      (metric) => {
        setVitals((prev) => ({ ...prev, fcp: metric.value }));
        options.onFCP?.(metric);
      },
      { reportAllChanges }
    );

    // Track TTFB (Time to First Byte)
    // Target: < 800ms (good), 800ms-1800ms (needs improvement), > 1800ms (poor)
    onTTFB(
      (metric) => {
        setVitals((prev) => ({ ...prev, ttfb: metric.value }));
        options.onTTFB?.(metric);
      },
      { reportAllChanges }
    );
  }, [options]);

  return vitals;
}
