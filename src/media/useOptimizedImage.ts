"use client";

import { useMemo, useEffect, useState, useCallback, useRef } from "react";

export interface UseOptimizedImageOptions {
  /** Image source URL */
  src: string;

  /** Load eagerly (above-fold images) */
  eager?: boolean;

  /** IntersectionObserver threshold */
  threshold?: number;

  /** IntersectionObserver root margin */
  rootMargin?: string;

  /** Explicit width in pixels (overrides detected width) */
  width?: number;

  /** Explicit height in pixels (overrides detected height) */
  height?: number;

  /** OptixFlow API Key */
  optixFlowConfig?: {
    apiKey: string;
    compressionLevel?: number;
    renderedFileType?: "avif" | "webp" | "jpeg" | "png";
  };
}

export interface UseOptimizedImageState {
  /** Ref to attach to img element */
  ref: (node: HTMLImageElement | null) => void;

  /** Current src to use */
  src: string;

  /** Whether image has loaded */
  isLoaded: boolean;

  /** Whether image is in viewport */
  isInView: boolean;

  /** Loading state */
  loading: "lazy" | "eager";

  /** Size of the image */
  size: { width: number; height: number };
}

/**
 * useOptimizedImage
 *
 * Optimizes image loading with lazy loading, intersection observer,
 * and automatic loading strategy based on viewport position.
 *
 * @example
 * ```tsx
 * function ProductImage() {
 *   const { ref, src, isLoaded, loading, size } = useOptimizedImage({
 *     src: '/product.jpg',
 *     threshold: 0.1,
 *     rootMargin: '50px',
 *     optixFlowConfig: { apiKey: 'your-api-key', compressionLevel: 80, renderedFileType: 'avif' }
 *   })
 *
 *   return (
 *     <img
 *       ref={ref}
 *       src={src}
 *       loading={loading}
 *       className={isLoaded ? 'loaded' : 'loading'}
 *       alt="Product"
 *       width={size.width}
 *       height={size.height}
 *     />
 *   )
 * }
 * ```
 */

const BASE_URL: string = "https://octane.cdn.ing/api/v1/images/transform?";

export function useOptimizedImage(
  options: UseOptimizedImageOptions,
): UseOptimizedImageState {
  const {
    src,
    eager = false,
    threshold = 0.1,
    rootMargin = "50px",
    width,
    height,
    optixFlowConfig,
  } = options;

  const optixFlowApiKey: string | undefined = useMemo(() => {
    return optixFlowConfig?.apiKey;
  }, [optixFlowConfig?.apiKey]);

  const useOptixFlow: boolean = useMemo(() => {
    return optixFlowApiKey ? true : false;
  }, [optixFlowApiKey]);

  const [state, setState] = useState({
    isLoaded: false,
    isInView: false,
  });

  // Size state for pixel-based width and height
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: width ?? 0,
    height: height ?? 0,
  });

  const imgRef = useRef<HTMLImageElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Update size when explicit width/height props change
  useEffect(() => {
    if (width !== undefined || height !== undefined) {
      setSize((prev) => ({
        width: width ?? prev.width,
        height: height ?? prev.height,
      }));
    }
  }, [width, height]);

  // Detect and update size from the image element
  useEffect(() => {
    if (!imgRef.current) return;

    const updateSizeFromElement = () => {
      const img = imgRef.current;
      if (!img) return;

      // Use explicit dimensions if provided, otherwise detect from element
      const detectedWidth = width ?? (img.clientWidth || img.naturalWidth || 0);
      const detectedHeight =
        height ?? (img.clientHeight || img.naturalHeight || 0);

      if (detectedWidth > 0 || detectedHeight > 0) {
        setSize({ width: detectedWidth, height: detectedHeight });
      }
    };

    // Update size immediately if image is already loaded
    if (imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      updateSizeFromElement();
    }

    // Listen for load event to get natural dimensions
    const img = imgRef.current;
    img.addEventListener("load", updateSizeFromElement);

    // Use ResizeObserver to track size changes dynamically
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updateSizeFromElement();
      });
      resizeObserver.observe(img);
    }

    return () => {
      img.removeEventListener("load", updateSizeFromElement);
      resizeObserver?.disconnect();
    };
  }, [width, height, state.isLoaded]);

  // Build dynamic src for OptixFlow
  const dynamicSrc = useMemo(() => {
    // If not using OptixFlow, return original src
    if (!useOptixFlow) {
      return src;
    }

    // Build OptixFlow URL with query params
    const params = new URLSearchParams();
    params.set("url", src);
    params.set("w", String(size.width));
    params.set("h", String(size.height));
    params.set("q", String(optixFlowConfig?.compressionLevel ?? 75));
    params.set("f", optixFlowConfig?.renderedFileType ?? "avif");
    params.set("apiKey", optixFlowApiKey!);

    return `${BASE_URL}${params.toString()}`;
  }, [useOptixFlow, src, size.width, size.height, optixFlowConfig, optixFlowApiKey]);

  useEffect(() => {
    if (typeof window === "undefined" || !imgRef.current) {
      return;
    }

    // If eager loading, skip intersection observer
    if (eager) {
      setState({ isLoaded: false, isInView: true });
      return;
    }

    // Set up intersection observer for lazy loading
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState((prev) => ({ ...prev, isInView: true }));
          observerRef.current?.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [eager, threshold, rootMargin]);

  // Handle image load event
  useEffect(() => {
    if (!imgRef.current) return;

    const handleLoad = () => {
      setState((prev) => ({ ...prev, isLoaded: true }));
    };

    const img = imgRef.current;

    // If image already loaded (cached)
    if (img.complete) {
      handleLoad();
    } else {
      img.addEventListener("load", handleLoad);
      return () => img.removeEventListener("load", handleLoad);
    }
  }, [state.isInView]);

  const ref = useCallback((node: HTMLImageElement | null) => {
    imgRef.current = node;
  }, []);

  return {
    ref,
    src: state.isInView || eager ? dynamicSrc : "",
    isLoaded: state.isLoaded,
    isInView: state.isInView,
    loading: eager ? "eager" : "lazy",
    size,
  };
}
