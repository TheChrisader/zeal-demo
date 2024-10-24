"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import ReadMoreWrapper from "./ReadMoreWrapper";
import RecommendedArticles from "./RecommendedArticles";

type LoadMoreAction = () => Promise<JSX.Element>;

const InfinitePostScroll = ({
  children,
  loadMoreAction,
}: {
  children: React.ReactNode;
  loadMoreAction: LoadMoreAction;
}) => {
  const loadRef = useRef<HTMLDivElement>(null);
  const [loadedNodes, setLoadedNodes] = useState<JSX.Element[]>([]);
  // const offsetRef = useRef(0);

  useEffect(() => {
    const handleLoad = async () => {
      try {
        const newNode = await loadMoreAction();

        // offsetRef.current++;
        setLoadedNodes((nodes) => [...nodes, newNode]);
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

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [loadMoreAction]);

  return (
    <div className="flex flex-col gap-20">
      {/* <ReadMoreWrapper>{children}</ReadMoreWrapper>
      <Suspense>
        <RecommendedArticles generic keywords={[]} />
      </Suspense> */}
      {children}
      {/* TODO: Add Continue Reading Headlines here as buffer */}
      {loadedNodes}
      <div ref={loadRef} className="text-center">
        Loading...
      </div>
    </div>
  );
};

export default InfinitePostScroll;
