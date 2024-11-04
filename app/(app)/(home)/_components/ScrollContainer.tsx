"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type LoadMoreAction = (
  offset: number,
  category: string,
) => Promise<JSX.Element>;

const ScrollContainer = ({
  children,
  category,
  loadMoreAction,
}: {
  children: React.ReactNode;
  category: string;
  loadMoreAction: LoadMoreAction;
}) => {
  const [loadedNodes, setLoadedNodes] = useState<JSX.Element[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const offsetRef = useRef(1);

  const handleLoad = async () => {
    try {
      setIsLoading(true);
      const newNode = await loadMoreAction(offsetRef.current, category);

      offsetRef.current++;
      setLoadedNodes((nodes) => [...nodes, newNode]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {children}
      {loadedNodes}
      <div className="mt-2 flex w-full items-center justify-center">
        <Button variant="outline" className="py-1" onClick={handleLoad}>
          {isLoading ? <span>Loading...</span> : <span>View More</span>}
        </Button>
      </div>
    </div>
  );
};

export default ScrollContainer;
