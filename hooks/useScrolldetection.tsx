import { useEffect, useState } from "react";

const useScrollDetection = (threshold = 0) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [scrollPosition, setScrollposition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentPosition = window.scrollY;
      setScrollposition(currentPosition);

      if (!hasScrolled && currentPosition > threshold) {
        setHasScrolled(true);
      }

      if (hasScrolled && currentPosition < threshold) {
        setHasScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasScrolled, threshold]);

  const resetScroll = () => setHasScrolled(false);

  return { hasScrolled, scrollPosition, resetScroll };
};

export default useScrollDetection;
