"use client";

import {
  Bookmark,
  Heart,
  Home,
  MessageCircle,
  MessageSquare,
  Music,
  Pause,
  Play,
  PlusSquare,
  Search,
  Share2,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VideoUploader } from "./VideoUploader";
import DiscoverPage from "./Discover";
import ProfilePage from "./Profile";
import type { VideoPost } from "./video-post";
import VideoPlayer from "./VideoPlayer"; // Import the new VideoPlayer component

export default function VideoFeed({ videoId }: { videoId?: string }) {
  const [activeTab, setActiveTab] = useState<
    "home" | "discover" | "create" | "inbox" | "profile"
  >("home");
  const [showUploader, setShowUploader] = useState(false);

  // Convert to state so we can add new videos
  const [videos, setVideos] = useState<VideoPost[]>([
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
    {
      id: "2476543gtjs368",
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
    {
      id: "2476543gtjs369",
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
  ]);

  const handleAddVideo = (newVideo: VideoPost) => {
    // Add the new video to the beginning of the array
    setVideos((prevVideos) => [newVideo, ...prevVideos]);
  };

  // Determine the best object-fit style based on aspect ratio
  const getObjectFitStyle = (index: number) => {
    const aspectRatio = videoAspectRatios[index];
    if (!aspectRatio) return "object-cover"; // Default to cover if we don't know yet

    // If video is wider than the container (landscape), use contain
    // If video is taller than the container (portrait), use cover
    const containerAspectRatio = 9 / 16; // Typical mobile aspect ratio

    return aspectRatio > containerAspectRatio
      ? "object-contain"
      : "object-cover";
  };

  // Handle tab changes
  const handleTabChange = (
    tab: "home" | "discover" | "create" | "inbox" | "profile",
  ) => {
    if (tab === "create") {
      setShowUploader(true);
      return;
    }

    setActiveTab(tab);
  };

  if (!videos.find((video) => video.id === videoId)) {
    return null;
  }

  // Render the appropriate content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <>
            {/* Top navigation */}
            {/* <div className="flex items-center justify-center border-b border-gray-800 px-4 py-3">
              <div className="flex space-x-4 text-lg font-medium">
                <button className="px-2">Following</button>
                <button className="px-2 font-bold">For You</button>
              </div>
              <button className="absolute right-4">
                <Search className="h-5 w-5" />
              </button>
            </div> */}

            {/* Video feed - Now using VideoPlayer component */}
            <VideoPlayer videos={videos} />
          </>
        );
      case "discover":
        return <DiscoverPage />;
      case "profile":
        return <ProfilePage />;
      case "inbox":
        return (
          <div className="flex flex-1 items-center justify-center">
            <div className="p-4 text-center">
              <MessageSquare className="mx-auto mb-4 size-16 text-gray-500" />
              <h2 className="mb-2 text-xl font-bold">Inbox</h2>
              <p className="text-gray-400">
                Messages and notifications will appear here
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-60px)] flex-col overflow-hidden text-special-text">
      {/* Video Uploader Modal */}
      {showUploader && (
        <VideoUploader
          onVideoUploaded={handleAddVideo}
          onClose={() => setShowUploader(false)}
        />
      )}

      {/* Main Content Area */}
      {renderContent()}

      {/* Bottom navigation */}
      {/* <div className="flex items-center justify-around border-t border-gray-800 bg-black px-2 py-3">
        <button
          className="flex flex-col items-center"
          onClick={() => handleTabChange("home")}
        >
          <Home
            className={cn(
              "h-6 w-6",
              activeTab === "home" ? "text-special-text" : "text-gray-400",
            )}
          />
          <span
            className={cn(
              "mt-1 text-xs",
              activeTab === "home" ? "text-special-text" : "text-gray-400",
            )}
          >
            Home
          </span>
        </button>
        <button
          className="flex flex-col items-center"
          onClick={() => handleTabChange("discover")}
        >
          <Search
            className={cn(
              "h-6 w-6",
              activeTab === "discover" ? "text-special-text" : "text-gray-400",
            )}
          />
          <span
            className={cn(
              "mt-1 text-xs",
              activeTab === "discover" ? "text-special-text" : "text-gray-400",
            )}
          >
            Discover
          </span>
        </button>
        <button
          className="flex flex-col items-center"
          onClick={() => handleTabChange("create")}
        >
          <div className="flex h-8 w-12 items-center justify-center rounded-md bg-gradient-to-r from-blue-500 to-red-500">
            <PlusSquare className="h-5 w-5 text-special-text" />
          </div>
        </button>
        <button
          className="flex flex-col items-center"
          onClick={() => handleTabChange("inbox")}
        >
          <MessageSquare
            className={cn(
              "h-6 w-6",
              activeTab === "inbox" ? "text-special-text" : "text-gray-400",
            )}
          />
          <span
            className={cn(
              "mt-1 text-xs",
              activeTab === "inbox" ? "text-special-text" : "text-gray-400",
            )}
          >
            Inbox
          </span>
        </button>
        <button
          className="flex flex-col items-center"
          onClick={() => handleTabChange("profile")}
        >
          <User
            className={cn(
              "h-6 w-6",
              activeTab === "profile" ? "text-special-text" : "text-gray-400",
            )}
          />
          <span
            className={cn(
              "mt-1 text-xs",
              activeTab === "profile" ? "text-special-text" : "text-gray-400",
            )}
          >
            Profile
          </span>
        </button>
      </div> */}
    </div>
  );
}
