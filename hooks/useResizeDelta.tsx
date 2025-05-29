import { useState, useEffect } from "react";

export function useResizeDelta() {
  // Initialize state with safe defaults for SSR
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  const [delta, setDelta] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") {
      return;
    }

    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      setDelta({
        width: newWidth - lastWidth,
        height: newHeight - lastHeight,
      });

      setDimensions({
        width: newWidth,
        height: newHeight,
      });

      lastWidth = newWidth;
      lastHeight = newHeight;
    };

    const debouncedHandleResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener("resize", debouncedHandleResize);

    // Initial measurement in case of SSR
    handleResize();

    return () => {
      window.removeEventListener("resize", debouncedHandleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return { dimensions, delta };
}
