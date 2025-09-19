"use client";

import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/app/_components/useRouter";
import PlaylistItem from "./PlaylistItem";
import { Video } from "../services/types";

interface PlaylistProps {
  initialVideos: Video[];
  initialNextPageToken?: string;
}

export function Playlist({
  initialVideos,
  initialNextPageToken,
}: PlaylistProps) {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(
    initialNextPageToken,
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentVideoId = searchParams.get("v");

  // Set initial video ID if none is provided
  useEffect(() => {
    if (!currentVideoId && initialVideos.length > 0) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("v", initialVideos[0]?.id as string);
      router.replace(`watch?${params.toString()}`, { scroll: false });
    }
  }, [currentVideoId, initialVideos, router, searchParams]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
      if (
        scrollHeight - scrollTop <= clientHeight * 1.5 &&
        nextPageToken &&
        !isLoading
      ) {
        loadMoreVideos();
      }
    },
    [nextPageToken, isLoading],
  );

  // Load more videos
  const loadMoreVideos = async () => {
    if (!nextPageToken || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/v1/youtube/videos?pageToken=${nextPageToken}`,
      );
      if (!response.ok) throw new Error("Failed to fetch videos");

      const data = await response.json();
      setVideos((prev) => [...prev, ...data.videos]);
      setNextPageToken(data.nextPageToken);
    } catch (error) {
      console.error("Error loading more videos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update current video when URL changes
  const handleVideoSelect = (videoId: string) => {
    // Create new search params
    const params = new URLSearchParams(searchParams.toString());
    params.set("v", videoId);

    // Update URL
    router.push(`watch?${params.toString()}`, { scroll: false });

    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full">
      <h2 className="mb-4 text-lg font-bold text-foreground">Playlist</h2>
      <div
        className="scrollbar-change max-h-[calc(100vh-200px)] overflow-y-auto"
        onScroll={handleScroll}
      >
        <div className="space-y-2">
          {videos.map((video) => (
            <PlaylistItem
              key={video.id}
              video={video}
              isActive={video.id === currentVideoId}
              onClick={() => handleVideoSelect(video.id)}
            />
          ))}
          {isLoading && (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          )}
          {!nextPageToken && videos.length > 0 && (
            <div className="py-4 text-center text-muted-alt">
              You&apos;ve reached the end of the playlist
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
