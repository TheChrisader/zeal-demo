import { ReactNode, useEffect, useRef, useState } from "react";

function ScrollableContainer({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState("100vh");

  useEffect(() => {
    function updateHeight() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMaxHeight(`${window.innerHeight - rect.top}px`);
      }
    }

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        maxHeight,
        overflowY: "auto",
      }}
    >
      {children}
    </div>
  );
}

export default ScrollableContainer;
