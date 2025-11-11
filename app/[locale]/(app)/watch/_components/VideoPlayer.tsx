"use client";

import { useState } from "react";
import { Play } from "lucide-react";

interface VideoPlayerProps {
  videoId: string;
  title: string;
  channelTitle: string;
  viewCount: string;
  publishDate: string;
}

export function VideoPlayer({
  videoId,
  title,
  channelTitle,
  viewCount,
  publishDate,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract the base video ID if it contains an underscore (from our mock data)
  const baseVideoId = videoId.split("_")[0] || videoId;
  const thumbnailUrl = `https://img.youtube.com/vi/${baseVideoId}/hqdefault.jpg`;

  return (
    <>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube.com/embed/${baseVideoId}?autoplay=1`}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                className="rounded-full bg-primary p-4 transition-colors hover:bg-primary/90"
                onClick={() => setIsPlaying(true)}
              >
                <Play className="fill-white text-white" size={32} />
              </button>
            </div>
            <div className="absolute bottom-4 left-4">
              <h1 className="hidden text-xl font-bold text-white sm:block">
                {title}
              </h1>
              <p className="text-sm text-white/90">
                {channelTitle} • {viewCount} • {publishDate}
              </p>
            </div>
          </>
        )}
      </div>
      <h1 className="mt-4 text-xl font-bold sm:hidden">{title}</h1>
    </>
  );
}
