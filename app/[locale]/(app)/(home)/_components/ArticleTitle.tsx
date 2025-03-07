"use client";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { truncateString } from "@/utils/string.utils";

const ArticleTitle = ({ title }: { title: string }) => {
  const matches = useMediaQuery("(max-width: 1000px)");
  const smallerMatches = useMediaQuery("(max-width: 900px)");
  const smallestMatches = useMediaQuery("(max-width: 500px)");

  const [size, setSize] = useState(91);

  const handleResize = () => {
    if (smallestMatches) {
      setSize(40);
      return 40;
    } else if (smallerMatches) {
      setSize(100);
      return 100;
    } else if (matches) {
      setSize(40);
      return 40;
    } else {
      setSize(91);
      return 91;
    }
  };

  useEffect(() => {
    handleResize();
  }, [matches, smallerMatches, smallestMatches]);

  return (
    <h3
      className="mb-2 text-sm font-semibold text-[#2F2D32]"
      suppressHydrationWarning
    >
      {truncateString(title.replaceAll("\\u0020", " "), size)}
    </h3>
  );
};

export default ArticleTitle;
