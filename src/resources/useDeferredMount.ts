"use client";

import { useEffect, useState } from "react";

export interface UseDeferredMountOptions {
  /** Delay in milliseconds after page idle */
  delay?: number;

  /** Priority: 'low' uses requestIdleCallback, 'high' uses setTimeout */
  priority?: "low" | "high";
}

/**
 * useDeferredMount
 *
 * Defers mounting of heavy components until after the page is idle,
 * improving initial page load performance and Core Web Vitals.
 *
 * @example
 * ```tsx
 * function HeavyComponent() {
 *   const shouldRender = useDeferredMount({
 *     delay: 100,
 *     priority: 'low'
 *   })
 *
 *   if (!shouldRender) {
 *     return <Skeleton />
 *   }
 *
 *   return <ExpensiveComponent />
 * }
 * ```
 */
export function useDeferredMount(
  options: UseDeferredMountOptions = {}
): boolean {
  const { delay = 0, priority = "low" } = options;
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      // Server-side: don't render
      return;
    }

    let timeoutId: number;

    if (priority === "low" && "requestIdleCallback" in window) {
      // Use requestIdleCallback for low priority rendering
      const idleCallbackId = window.requestIdleCallback(
        () => {
          timeoutId = window.setTimeout(() => {
            setShouldRender(true);
          }, delay);
        },
        { timeout: 2000 }
      );

      return () => {
        window.cancelIdleCallback(idleCallbackId);
        if (timeoutId) window.clearTimeout(timeoutId);
      };
    } else {
      // Fallback to setTimeout for high priority or browsers without requestIdleCallback
      timeoutId = window.setTimeout(() => {
        setShouldRender(true);
      }, delay);

      return () => window.clearTimeout(timeoutId);
    }
  }, [delay, priority]);

  return shouldRender;
}
