"use client";

import { useEffect, useRef, useState } from "react";

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
      {children}
      {loadedNodes}
      <div ref={loadRef} className="text-center">
        Loading...
      </div>
    </div>
  );
};

export default InfinitePostScroll;
