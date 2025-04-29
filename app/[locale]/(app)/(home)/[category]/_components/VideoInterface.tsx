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

export default function VideoInterface({ videoId }: { videoId?: string }) {
  const [activeTab, setActiveTab] = useState<
    "home" | "discover" | "create" | "inbox" | "profile"
  >("home");
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const videoContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingInProgress, setIsPlayingInProgress] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [videoAspectRatios, setVideoAspectRatios] = useState<
    Record<number, number>
  >({});
  const [showPlayPauseEffect, setShowPlayPauseEffect] = useState<
    Record<number, boolean>
  >({});

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
    // {
    //   id: "2",
    //   username: "username2",
    //   userHandle: "@user2",
    //   caption: "Check out this cool effect! #fyp #foryoupage",
    //   audioTitle: "Trending Sound - Artist",
    //   likes: "450K",
    //   comments: "3.2K",
    //   shares: "1.8K",
    //   bookmarks: "950",
    //   videoUrl: "/placeholder.svg?height=720&width=405",
    //   userAvatar: "/placeholder.svg?height=50&width=50",
    // },
  ]);

  // Set up intersection observer to detect which video is in view
  useEffect(() => {
    // Only set up observer when on the home tab
    if (activeTab !== "home") return;

    // Disconnect previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create a new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Get the index from the data attribute
          const index = entry.target.getAttribute("data-index");
          if (index === null) return;

          const videoIndex = Number.parseInt(index, 10);
          const video = videoRefs.current[videoIndex];

          if (!video) return;

          if (entry.isIntersecting) {
            // Video is in view
            setCurrentVideoIndex(videoIndex);

            // Auto-play the video that's in view (optional)
            if (!isPlayingInProgress) {
              try {
                video
                  .play()
                  .then(() => {
                    setIsPlaying(true);
                    // Show play effect briefly
                    setShowPlayPauseEffect((prev) => ({
                      ...prev,
                      [videoIndex]: true,
                    }));
                    setTimeout(() => {
                      setShowPlayPauseEffect((prev) => ({
                        ...prev,
                        [videoIndex]: false,
                      }));
                    }, 800);
                  })
                  .catch((err) => console.log("Could not autoplay:", err));
              } catch (error) {
                console.log("Error during autoplay:", error);
              }
            }
          } else {
            // Video is out of view, pause it
            video.pause();
            if (videoIndex === currentVideoIndex) {
              setIsPlaying(false);
            }
          }
        });
      },
      {
        threshold: 0.7, // At least 70% of the video must be visible
      },
    );

    // Observe all video containers
    videoContainerRefs.current.forEach((container) => {
      if (container) {
        observerRef.current?.observe(container);
      }
    });

    // Clean up observer on component unmount or when tab changes
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [videos, currentVideoIndex, isPlayingInProgress, activeTab]);

  // Calculate video aspect ratios when videos load
  useEffect(() => {
    if (activeTab !== "home") return;

    const handleVideoMetadata = (index: number) => {
      const video = videoRefs.current[index];
      if (!video) return;

      const aspectRatio = video.videoWidth / video.videoHeight;
      setVideoAspectRatios((prev) => ({
        ...prev,
        [index]: aspectRatio,
      }));
    };

    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      // For already loaded videos
      if (video.readyState >= 1) {
        handleVideoMetadata(index);
      }

      // For videos that will load
      const loadHandler = () => handleVideoMetadata(index);
      video.addEventListener("loadedmetadata", loadHandler);

      return () => {
        video.removeEventListener("loadedmetadata", loadHandler);
      };
    });
  }, [videos, videoRefs.current.length, activeTab]);

  const togglePlayPause = async (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    try {
      if (video.paused) {
        setIsPlayingInProgress(true);
        // Show play effect
        setShowPlayPauseEffect((prev) => ({ ...prev, [index]: true }));
        await video.play();
        setIsPlaying(true);
      } else {
        // Show pause effect
        setShowPlayPauseEffect((prev) => ({ ...prev, [index]: true }));
        video.pause();
        setIsPlaying(false);
      }

      // Hide effect after a short delay
      setTimeout(() => {
        setShowPlayPauseEffect((prev) => ({ ...prev, [index]: false }));
      }, 800);
    } catch (error) {
      console.log("Video playback error:", error, isPlaying);
      setShowPlayPauseEffect((prev) => ({ ...prev, [index]: false }));
    } finally {
      setIsPlayingInProgress(false);
    }
  };

  const handleVideoClick = (index: number) => {
    if (isPlayingInProgress) return;
    togglePlayPause(index);
  };

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

            {/* Video feed */}
            <div className="flex-1 snap-y snap-mandatory overflow-y-auto">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className="relative size-full snap-start"
                  onClick={() => handleVideoClick(index)}
                  ref={(el) => {
                    videoContainerRefs.current[index] = el;
                  }}
                  data-index={index}
                >
                  {/* Video */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                    <video
                      ref={(el) => {
                        videoRefs.current[index] = el;
                      }}
                      className={`size-full ${getObjectFitStyle(index)}`}
                      loop
                      playsInline
                      src={video.videoUrl}
                      poster={
                        video.videoUrl.startsWith("blob:")
                          ? undefined
                          : video.videoUrl
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlayPause(index);
                      }}
                    />

                    {/* Play/Pause Effect Overlay */}
                    {showPlayPauseEffect[index] && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="animate-fade-out rounded-full bg-black/30 p-6">
                          {videoRefs.current[index]?.paused ? (
                            <Pause className="text-special-text size-12" />
                          ) : (
                            <Play className="text-special-text size-12" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="flex flex-col gap-2">
                      <div className="text-lg font-semibold">
                        @{video.username}
                      </div>
                      <div className="text-sm">{video.caption}</div>
                      {/* <div className="flex items-center gap-2 text-sm">
                        <Music className="h-3 w-3" />
                        <div className="max-w-[200px] truncate">
                          {video.audioTitle}
                        </div>
                      </div> */}
                    </div>
                  </div>

                  {/* Right sidebar with actions */}
                  <div className="absolute bottom-20 right-3 flex flex-col items-center gap-6">
                    {/* User avatar */}
                    {/* <div className="flex flex-col items-center">
                      <Avatar className="h-12 w-12 border-2 border-white">
                        <AvatarImage src={video.userAvatar} />
                        <AvatarFallback>
                          {video.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 rounded-full bg-red-500 p-1">
                        <PlusSquare className="h-3 w-3" />
                      </div>
                    </div> */}

                    {/* Like button */}
                    {/* <div className="flex flex-col items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-transparent hover:bg-card-alt-bg/10"
                      >
                        <Heart className="h-7 w-7" />
                      </Button>
                      <span className="text-xs">{video.likes}</span>
                    </div> */}

                    {/* Comment button */}
                    {/* <div className="flex flex-col items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-transparent hover:bg-card-alt-bg/10"
                      >
                        <MessageCircle className="h-7 w-7" />
                      </Button>
                      <span className="text-xs">{video.comments}</span>
                    </div> */}

                    {/* Share button */}
                    {/* <div className="flex flex-col items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-transparent hover:bg-card-alt-bg/10"
                      >
                        <Share2 className="h-7 w-7" />
                      </Button>
                      <span className="text-xs">{video.shares}</span>
                    </div> */}

                    {/* Bookmark button */}
                    {/* <div className="flex flex-col items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-transparent hover:bg-card-alt-bg/10"
                      >
                        <Bookmark className="h-7 w-7" />
                      </Button>
                      <span className="text-xs">{video.bookmarks}</span>
                    </div> */}

                    {/* Rotating record for audio */}
                    {/* <div className="animate-spin-slow h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-gray-900">
                      <img
                        src={video.userAvatar || "/placeholder.svg"}
                        alt="Audio"
                        className="h-full w-full object-cover"
                      />
                    </div> */}
                  </div>
                </div>
              ))}
            </div>
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
    <div className="text-special-text flex h-[calc(100vh-60px)] flex-col overflow-hidden">
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
