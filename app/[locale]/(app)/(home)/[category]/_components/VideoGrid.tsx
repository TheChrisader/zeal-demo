"use client";

import { Heart, MessageCircle, Play } from "lucide-react";
import { useState } from "react";
import type { VideoPost } from "./video-post";
import { Link } from "@/i18n/routing";

interface VideoGridProps {
  videos: VideoPost[];
  onVideoSelect?: (videoId: string) => void;
  title?: string;
  showStats?: boolean;
  columns?: 2 | 3;
}

export function VideoGrid({
  videos,
  onVideoSelect,
  //   title = "For You",
  showStats = true,
  columns = 3,
}: VideoGridProps) {
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);

  const handleVideoClick = (videoId: string) => {
    if (onVideoSelect) {
      onVideoSelect(videoId);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="px-4 py-3">
        {/* <h1 className="mb-4 text-xl font-bold">{title}</h1> */}

        {/* <div
          className={`grid ${columns === 3 ? "grid-cols-3" : "grid-cols-2"} gap-1 sm:gap-2`}
        > */}
        <div className="flex flex-wrap gap-2">
          {videos.map((video) => (
            <Link
              href={`/video/${video.id}`}
              key={video.id}
              className="relative aspect-[9/16] h-[300px] overflow-hidden rounded-md bg-gray-500"
              onMouseEnter={() => setHoveredVideo(video.id)}
              onMouseLeave={() => setHoveredVideo(null)}
              onClick={() => handleVideoClick(video.id)}
            >
              {/* Video Thumbnail */}
              <div className="absolute inset-0">
                {video.videoUrl.startsWith("blob:") ? (
                  <video
                    src={video.videoUrl}
                    className="size-full object-cover"
                    muted
                    loop
                    playsInline
                    autoPlay={hoveredVideo === video.id}
                  />
                ) : (
                  <img
                    src={video.thumbnail}
                    alt={video.caption}
                    className="size-full object-cover"
                  />
                )}
              </div>

              {/* Hover Overlay */}
              <div
                className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-200 ${
                  hoveredVideo === video.id ? "opacity-100" : "opacity-0"
                }`}
              >
                <Play className="size-10 text-white opacity-80" />
              </div>

              {/* Video Stats */}
              {showStats && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center">
                      <Heart className="mr-1 size-3" />
                      {video.likes}
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="mr-1 size-3" />
                      {video.comments}
                    </div>
                  </div>
                </div>
              )}

              {/* Video Caption - Only show on hover */}
              <div
                className={`absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent p-2 transition-opacity duration-200 ${
                  hoveredVideo === video.id ? "opacity-100" : "opacity-0"
                }`}
              >
                <p className="line-clamp-2 text-xs">{video.caption}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
