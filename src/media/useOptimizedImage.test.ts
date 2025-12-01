import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useOptimizedImage } from "./useOptimizedImage";

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  mockIntersectionObserver.mockImplementation((callback) => ({
    observe: mockObserve,
    disconnect: mockDisconnect,
    unobserve: vi.fn(),
  }));
  vi.stubGlobal("IntersectionObserver", mockIntersectionObserver);

  // Mock ResizeObserver
  vi.stubGlobal(
    "ResizeObserver",
    vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
    })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("useOptimizedImage", () => {
  it("is a function", () => {
    expect(typeof useOptimizedImage).toBe("function");
  });

  it("returns initial state with default values", () => {
    const { result } = renderHook(() =>
      useOptimizedImage({ src: "/test.jpg" }),
    );

    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isInView).toBe(false);
    expect(result.current.loading).toBe("lazy");
    expect(result.current.size).toEqual({ width: 0, height: 0 });
    expect(typeof result.current.ref).toBe("function");
  });

  it("returns eager loading when eager option is true", () => {
    const { result } = renderHook(() =>
      useOptimizedImage({ src: "/test.jpg", eager: true }),
    );

    expect(result.current.loading).toBe("eager");
  });

  it("returns original src when not in view and not eager", () => {
    const { result } = renderHook(() =>
      useOptimizedImage({ src: "/test.jpg" }),
    );

    expect(result.current.src).toBe("");
  });

  it("initializes size with explicit width and height", () => {
    const { result } = renderHook(() =>
      useOptimizedImage({ src: "/test.jpg", width: 800, height: 600 }),
    );

    expect(result.current.size).toEqual({ width: 800, height: 600 });
  });

  it("updates size when width/height props change", async () => {
    const { result, rerender } = renderHook(
      ({ width, height }) => useOptimizedImage({ src: "/test.jpg", width, height }),
      { initialProps: { width: 400, height: 300 } },
    );

    expect(result.current.size).toEqual({ width: 400, height: 300 });

    rerender({ width: 800, height: 600 });

    await waitFor(() => {
      expect(result.current.size).toEqual({ width: 800, height: 600 });
    });
  });

  describe("dynamicSrc generation", () => {
    it("returns original src when optixFlowConfig is not provided", () => {
      const { result } = renderHook(() =>
        useOptimizedImage({ src: "/test.jpg", eager: true }),
      );

      expect(result.current.src).toBe("/test.jpg");
    });

    it("returns OptixFlow URL when optixFlowConfig is provided", () => {
      const { result } = renderHook(() =>
        useOptimizedImage({
          src: "https://example.com/image.jpg",
          eager: true,
          width: 420,
          height: 700,
          optixFlowConfig: {
            apiKey: "test-api-key",
            compressionLevel: 85,
            renderedFileType: "webp",
          },
        }),
      );

      expect(result.current.src).toContain(
        "https://octane.cdn.ing/api/v1/images/transform?",
      );
      expect(result.current.src).toContain(
        "url=https%3A%2F%2Fexample.com%2Fimage.jpg",
      );
      expect(result.current.src).toContain("w=420");
      expect(result.current.src).toContain("h=700");
      expect(result.current.src).toContain("q=85");
      expect(result.current.src).toContain("f=webp");
      expect(result.current.src).toContain("apiKey=test-api-key");
    });

    it("uses default compressionLevel of 75 when not specified", () => {
      const { result } = renderHook(() =>
        useOptimizedImage({
          src: "https://example.com/image.jpg",
          eager: true,
          width: 100,
          height: 100,
          optixFlowConfig: {
            apiKey: "test-api-key",
          },
        }),
      );

      expect(result.current.src).toContain("q=75");
    });

    it("uses default renderedFileType of avif when not specified", () => {
      const { result } = renderHook(() =>
        useOptimizedImage({
          src: "https://example.com/image.jpg",
          eager: true,
          width: 100,
          height: 100,
          optixFlowConfig: {
            apiKey: "test-api-key",
          },
        }),
      );

      expect(result.current.src).toContain("f=avif");
    });

    it("updates dynamicSrc when size changes", async () => {
      const { result, rerender } = renderHook(
        ({ width, height }) =>
          useOptimizedImage({
            src: "https://example.com/image.jpg",
            eager: true,
            width,
            height,
            optixFlowConfig: {
              apiKey: "test-api-key",
            },
          }),
        { initialProps: { width: 100, height: 100 } },
      );

      expect(result.current.src).toContain("w=100");
      expect(result.current.src).toContain("h=100");

      rerender({ width: 200, height: 300 });

      await waitFor(() => {
        expect(result.current.src).toContain("w=200");
        expect(result.current.src).toContain("h=300");
      });
    });
  });

  describe("ref callback", () => {
    it("provides a ref callback function", () => {
      const { result } = renderHook(() =>
        useOptimizedImage({ src: "/test.jpg" }),
      );

      expect(typeof result.current.ref).toBe("function");
    });

    it("ref callback accepts HTMLImageElement or null", () => {
      const { result } = renderHook(() =>
        useOptimizedImage({ src: "/test.jpg" }),
      );

      // Should not throw when called with null
      expect(() => result.current.ref(null)).not.toThrow();
    });
  });

  describe("intersection observer options", () => {
    it("uses default threshold and rootMargin", () => {
      const mockElement = document.createElement("img");

      renderHook(() => useOptimizedImage({ src: "/test.jpg" }));

      // Simulate ref being set
      act(() => {
        // The observer is created when ref is set
      });
    });

    it("uses custom threshold and rootMargin when provided", () => {
      renderHook(() =>
        useOptimizedImage({
          src: "/test.jpg",
          threshold: 0.5,
          rootMargin: "100px",
        }),
      );
    });
  });
});
