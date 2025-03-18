import { FlameIcon as Fire, Music, Search, TrendingUp } from "lucide-react";
import { useState } from "react";
import { VideoGrid } from "./VideoGrid";
import type { VideoPost } from "./video-post";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DiscoverPage() {
  const videos: VideoPost[] = [
    {
      id: "2476543gtjs367",
      username: "Zeal News Network",
      userHandle: "@ZealNewsNetwork",
      caption: "The Oba with the second shortest reign in Benin",
      audioTitle: "Original Sound - username1",
      likes: "0",
      comments: "0",
      shares: "0",
      bookmarks: "0",
      videoUrl:
        "https://d3h4b588jh7zgi.cloudfront.net/videos/VID-20250318-WA0001.mp4",
      thumbnail:
        "https://d3h4b588jh7zgi.cloudfront.net/videos/thumbnails/VID-20250318-WA0001.jpg",
      userAvatar: "/favicon.ico",
    },
  ];

  return (
    <div className="min-h-screen pb-16">
      <VideoGrid
        videos={videos}
        // onVideoSelect={handleVideoSelect}
      />
    </div>
  );
}
