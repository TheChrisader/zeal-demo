"use client";

import { useEffect, useRef, useState } from "react";
import Categories from "@/categories";
import { flattenCategories } from "@/utils/category.utils";

type LoadMoreAction = (selection: string[]) => Promise<JSX.Element[]>;

const HomepageScroll = ({
  children,
  currentSelection,
  loadMoreAction,
  preferences = [],
}: {
  children: React.ReactNode;
  currentSelection: string[];
  loadMoreAction: LoadMoreAction;
  preferences?: string[];
}) => {
  const loadRef = useRef<HTMLDivElement>(null);
  const [loadedNodes, setLoadedNodes] = useState<JSX.Element[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const batchCounterRef = useRef(0);

  const remainingCategories = flattenCategories(Categories)
    .filter((category) => !currentSelection.includes(category))
    .filter((category) => !preferences.includes(category))
    .filter((category) => category !== "Home")
    .filter((category) => category !== "Headlines")
    .filter((category) => category !== "Entrepreneurship")
    .filter((category) => category !== "Hot Interviews")
    .filter((category) => category !== "Viral Videos");

  const categoryBatchesToLoad = [remainingCategories];
  if (preferences.length > 0) {
    categoryBatchesToLoad.unshift(preferences);
  }

  useEffect(() => {
    const handleLoad = async () => {
      if (loaded || isLoading) return;

      try {
        setIsLoading(true);
        const currentBatchToLoad = categoryBatchesToLoad[
          batchCounterRef.current
        ] as string[];

        const newNodes = await loadMoreAction(currentBatchToLoad);

        setLoadedNodes((nodes) => [...nodes, ...newNodes]);

        if (batchCounterRef.current >= categoryBatchesToLoad.length - 1) {
          setLoaded(true);
        }

        batchCounterRef.current++;
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    const element = loadRef.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry!.isIntersecting && !isLoading) {
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
  }, [loadMoreAction, loaded, remainingCategories, categoryBatchesToLoad]);

  return (
    <>
      <div className="flex flex-wrap gap-3 max-[900px]:flex-col">
        {children}
        {loadedNodes}
      </div>
      {!loaded && (
        <div className="text-center">
          {!isLoading && <div ref={loadRef} />}
          Loading...
        </div>
      )}
    </>
  );
};

export default HomepageScroll;
