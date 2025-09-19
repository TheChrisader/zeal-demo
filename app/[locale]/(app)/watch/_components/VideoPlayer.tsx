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
  publishDate 
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Extract the base video ID if it contains an underscore (from our mock data)
  const baseVideoId = videoId.split('_')[0] || videoId;
  const thumbnailUrl = `https://img.youtube.com/vi/${baseVideoId}/hqdefault.jpg`;
  
  return (
    <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
      {isPlaying ? (
        <iframe
          src={`https://www.youtube.com/embed/${baseVideoId}?autoplay=1`}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          <img 
            src={thumbnailUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <button 
              className="rounded-full bg-primary p-4 hover:bg-primary/90 transition-colors"
              onClick={() => setIsPlaying(true)}
            >
              <Play className="text-white fill-white" size={32} />
            </button>
          </div>
          <div className="absolute bottom-4 left-4">
            <h1 className="text-white text-xl font-bold">{title}</h1>
            <p className="text-white/90 text-sm">{channelTitle} • {viewCount} • {publishDate}</p>
          </div>
        </>
      )}
    </div>
  );
}