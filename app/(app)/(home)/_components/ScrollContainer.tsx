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
  const offsetRef = useRef(1);

  const handleLoad = async () => {
    try {
      const newNode = await loadMoreAction(offsetRef.current, category);

      offsetRef.current++;
      setLoadedNodes((nodes) => [...nodes, newNode]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {children}
      {loadedNodes}
      <div className="mt-2 flex w-full items-center justify-center">
        <Button variant="outline" className="py-1" onClick={handleLoad}>
          <span>View More</span>
        </Button>
      </div>
    </div>
  );
};

export default ScrollContainer;
