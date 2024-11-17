"use client";

import { useEffect, useRef, useState } from "react";
import Categories from "@/categories";
import { flattenCategories } from "@/utils/category.utils";

type LoadMoreAction = (selection: string[]) => Promise<JSX.Element[]>;

const HomepageScroll = ({
  children,
  currentSelection,
  loadMoreAction,
}: {
  children: React.ReactNode;
  currentSelection: string[];
  loadMoreAction: LoadMoreAction;
}) => {
  const loadRef = useRef<HTMLDivElement>(null);
  const [loadedNodes, setLoadedNodes] = useState<JSX.Element[]>([]);
  const [loaded, setLoaded] = useState(false);
  const remainingCategories = flattenCategories(Categories)
    .filter((category) => !currentSelection.includes(category))
    .filter((category) => category !== "For you")
    .filter((category) => category !== "Headlines")
    .filter((category) => category !== "Entrepreneurship")
    .filter((category) => category !== "Hot Interviews")
    .filter((category) => category !== "Viral Videos");

  useEffect(() => {
    const handleLoad = async () => {
      if (loaded) return;

      try {
        const newNodes = await loadMoreAction(remainingCategories);

        setLoadedNodes(newNodes);
        setLoaded(true);
      } catch (error) {
        console.log(error);
      }
    };

    const element = loadRef.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry!.isIntersecting) {
        handleLoad();
      }
    });

    if (element) {
      observer.observe(element);
    }

    if (loaded) {
      observer.disconnect();
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [loadMoreAction, loaded, remainingCategories]);

  return (
    <div className="flex flex-wrap gap-3 max-[900px]:flex-col">
      {children}
      {loadedNodes}
      {!loaded && (
        <div ref={loadRef} className="text-center">
          Loading...
        </div>
      )}
    </div>
  );
};

export default HomepageScroll;
