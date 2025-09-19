"use client";

import { Play } from "lucide-react";
import { Video } from "../services/types";

interface PlaylistItemProps {
  video: Video;
  isActive: boolean;
  onClick: () => void;
}

export default function PlaylistItem({ video, isActive, onClick }: PlaylistItemProps) {
  return (
    <div 
      className={`flex gap-2 cursor-pointer rounded-lg p-2 transition-colors ${
        isActive 
          ? "bg-subtle-bg" 
          : "hover:bg-subtle-bg"
      }`}
      onClick={onClick}
    >
      <div className="relative flex-shrink-0">
        <img 
          src={video.thumbnailUrl} 
          alt={video.title}
          className="w-32 h-18 rounded object-cover"
        />
        <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
          {video.duration}
        </div>
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-black bg-opacity-50 p-2">
              <Play size={16} className="text-white fill-white" />
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm line-clamp-2 text-foreground-alt">
          {video.title}
        </h3>
        <p className="text-xs text-muted-alt mt-1">{video.channelTitle}</p>
        <p className="text-xs text-muted-alt">{video.viewCount} • {video.publishedAt}</p>
      </div>
    </div>
  );
}