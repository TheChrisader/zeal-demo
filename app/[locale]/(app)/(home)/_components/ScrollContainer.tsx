"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { IPost } from "@/types/post.type";
import ArticleCard from "./ArticleCard";

type LoadMoreAction = (
  offset: number,
  category: string,
) => Promise<IPost[]>;

const ScrollContainer = ({
  children,
  category,
  loadMoreAction,
}: {
  children: React.ReactNode;
  category: string;
  loadMoreAction: LoadMoreAction;
}) => {
  const [loadedPosts, setLoadedPosts] = useState<IPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const offsetRef = useRef(1);

  const handleLoad = async () => {
    try {
      setIsLoading(true);
      const posts = await loadMoreAction(offsetRef.current, category);

      offsetRef.current++;
      setLoadedPosts((prev) => [...prev, ...posts]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {children}
      {loadedPosts.map((post) => {
        if (!post._id) return null;
        return (
          <ArticleCard
            className="w-full"
            article={{ ...post, id: post._id.toString() }}
            key={post._id.toString()}
          />
        );
      })}
      <div className="mt-2 flex w-full items-center justify-center">
        <Button variant="outline" className="py-1" onClick={handleLoad}>
          {isLoading ? <span>Loading...</span> : <span>View More</span>}
        </Button>
      </div>
    </>
  );
};

export default ScrollContainer;
