"use client";

import {
  Bookmark,
  Heart,
  MessageCircle,
  Music,
  Pause,
  Play,
  Share2,
  Volume2, // Add Volume2 icon
  VolumeX, // Add VolumeX icon
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VideoPost } from "./video-post";

interface VideoPlayerProps {
  videos: VideoPost[];
  initialVideoIndex?: number;
}

const VideoPlayer = ({ videos, initialVideoIndex = 0 }: VideoPlayerProps) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(initialVideoIndex);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const videoContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingInProgress, setIsPlayingInProgress] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Add state for mute status
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [videoAspectRatios, setVideoAspectRatios] = useState<
    Record<number, number>
  >({});
  const [showPlayPauseEffect, setShowPlayPauseEffect] = useState<
    Record<number, boolean>
  >({});
  const [videoProgress, setVideoProgress] = useState<Record<number, number>>(
    {},
  );
  const [videoDuration, setVideoDuration] = useState<Record<number, number>>(
    {},
  );
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const overlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to show overlay and set timeout to hide it
  const showOverlay = () => {
    setIsOverlayVisible(true);
    if (overlayTimeoutRef.current) {
      clearTimeout(overlayTimeoutRef.current);
    }
    overlayTimeoutRef.current = setTimeout(() => {
      setIsOverlayVisible(false);
    }, 3000); // Hide after 3 seconds of inactivity
  };

  // Initial overlay display
  useEffect(() => {
    showOverlay();
    // Clear timeout on unmount
    return () => {
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
      }
    };
  }, []);

  // Set up intersection observer to detect which video is in view
  useEffect(() => {
    // Disconnect previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create a new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = entry.target.getAttribute("data-index");
          if (index === null) return;

          const videoIndex = Number.parseInt(index, 10);
          const video = videoRefs.current[videoIndex];

          if (!video) return;

          if (entry.isIntersecting) {
            // Video is in view
            setCurrentVideoIndex(videoIndex);

            // Auto-play the video that's in view
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

    // Clean up observer on component unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [videos, isPlayingInProgress]); // Removed currentVideoIndex dependency to avoid potential issues

  //   useEffect(() => {
  //     const handleVideoEnded = () => {
  //       setCurrentVideoIndex((prevIndex) => {
  //         const nextIndex = (prevIndex + 1) % videos.length;
  //         return nextIndex;
  //       });
  //     };

  //     videoRefs.current.forEach((video) => {
  //       if (video) {
  //         video.addEventListener("ended", handleVideoEnded);
  //       }
  //     })
  //     return () => {
  //       videoRefs.current.forEach((video) => {
  //         if (video) {
  //           video.removeEventListener("ended", handleVideoEnded);
  //         }
  //       });
  //     }
  //   }, [ videos ]);

  useEffect(() => {
    const handleMuteOnScroll = () => {
      if (currentVideoIndex > 0) setIsMuted(false); // Unmute when autoplay starts after first scroll
      console.log(currentVideoIndex);
      showOverlay();
    };
    videoRefs.current.forEach((video) => {
      if (video) {
        video.addEventListener("scroll", handleMuteOnScroll);
      }

      //   if (video.readyState >= 1) {
      //     video.currentTime = videoProgress[currentVideoIndex] || 0;
      //   }
    });

    const copiedVideoRefs = [...videoRefs.current];

    return () => {
      copiedVideoRefs.forEach((video) => {
        if (video) {
          video.removeEventListener("scroll", handleMuteOnScroll);
        }
      });
    };
  }, [currentVideoIndex]);

  // Calculate video aspect ratios and duration when videos load
  useEffect(() => {
    const handleVideoMetadata = (index: number) => {
      const video = videoRefs.current[index];
      if (!video) return;

      const aspectRatio = video.videoWidth / video.videoHeight;
      setVideoAspectRatios((prev) => ({
        ...prev,
        [index]: aspectRatio,
      }));
      setVideoDuration((prev) => ({
        ...prev,
        [index]: video.duration,
      }));
    };

    const handleTimeUpdate = (index: number) => {
      const video = videoRefs.current[index];
      if (!video) return;
      setVideoProgress((prev) => ({
        ...prev,
        [index]: video.currentTime,
      }));
    };

    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      if (video.readyState >= 1) {
        handleVideoMetadata(index);
      }

      const loadHandler = () => handleVideoMetadata(index);
      const timeUpdateHandler = () => handleTimeUpdate(index);

      video.addEventListener("loadedmetadata", loadHandler);
      video.addEventListener("timeupdate", timeUpdateHandler);

      return () => {
        video.removeEventListener("loadedmetadata", loadHandler);
        video.removeEventListener("timeupdate", timeUpdateHandler);
      };
    });
  }, [videos, videoRefs.current.length]);

  const togglePlayPause = async (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    try {
      if (video.paused) {
        setIsPlayingInProgress(true);
        setShowPlayPauseEffect((prev) => ({ ...prev, [index]: true }));
        await video.play();
        setIsPlaying(true);
      } else {
        setShowPlayPauseEffect((prev) => ({ ...prev, [index]: true }));
        video.pause();
        setIsPlaying(false);
      }

      setTimeout(() => {
        setShowPlayPauseEffect((prev) => ({ ...prev, [index]: false }));
      }, 800);
    } catch (error) {
      console.log("Video playback error:", error);
      setShowPlayPauseEffect((prev) => ({ ...prev, [index]: false }));
    } finally {
      setIsPlayingInProgress(false);
    }
  };

  const handleVideoClick = (index: number) => {
    showOverlay(); // Show overlay on any tap
    if (isPlayingInProgress) return;
    togglePlayPause(index);
  };

  // Function to toggle mute state
  const toggleMute = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    video.muted = newMutedState;
    showOverlay(); // Keep overlay visible when interacting with mute
  };

  const getObjectFitStyle = (index: number) => {
    const aspectRatio = videoAspectRatios[index];
    if (!aspectRatio) return "object-cover";
    const containerAspectRatio = 9 / 16; // Assuming a standard mobile portrait view
    return aspectRatio > containerAspectRatio
      ? "object-contain"
      : "object-cover";
  };

  return (
    <div className="flex-1 snap-y snap-mandatory overflow-y-auto">
      {videos.map((video, index) => {
        const progressPercent = videoDuration[index]
          ? (videoProgress[index] / videoDuration[index]) * 100
          : 0;
        return (
          <div
            key={video.id}
            className="relative size-full snap-start"
            onClick={() => handleVideoClick(index)} // Use the combined handler
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
                className={cn("size-full", getObjectFitStyle(index))}
                src={video.videoUrl}
                loop
                playsInline
                muted={isMuted} // Bind muted attribute to state
              />
              {/* Play/Pause Icon Overlay */}
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 ease-in-out",
                  showPlayPauseEffect[index] ? "opacity-100" : "opacity-0",
                  "pointer-events-none", // Make sure this doesn't block clicks
                )}
              >
                {isPlaying ? (
                  <Pause className="size-16 text-white" />
                ) : (
                  <Play className="size-16 text-white" />
                )}
              </div>
            </div>

            {/* Mute/Unmute Button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute right-4 top-4 z-10 h-10 w-10 rounded-full bg-black/40 text-white transition-opacity duration-300 ease-in-out hover:bg-black/60",
                isOverlayVisible || isMuted ? "opacity-100" : "opacity-0",
              )}
              onClick={(e) => {
                e.stopPropagation(); // Prevent video click
                toggleMute(index);
              }}
            >
              {isMuted ? (
                <VolumeX className="size-5" />
              ) : (
                <Volume2 className="size-5" />
              )}
            </Button>

            {/* Gradient Overlay for Info */}
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 pt-16 text-white transition-opacity duration-300 ease-in-out",
                isOverlayVisible
                  ? "opacity-100"
                  : "pointer-events-none opacity-0",
              )}
              onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling to video container
            >
              <div className="mb-2 flex items-center gap-2">
                <Avatar className="size-8">
                  <AvatarImage src={video.userAvatar} />
                  <AvatarFallback>{video.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-semibold">{video.username}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2 h-7 border-white/50 bg-transparent px-3 text-xs text-white hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent video click
                    showOverlay(); // Keep overlay visible on button click
                    // Handle follow action
                  }}
                >
                  Follow
                </Button>
              </div>
              <p className="mb-2 text-sm">{video.caption}</p>
              <div className="flex items-center gap-2 text-xs">
                <Music className="size-4" />
                <span>{video.audioTitle}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className={cn(
                "absolute bottom-20 right-2 flex flex-col items-center gap-4 text-white transition-opacity duration-300 ease-in-out",
                isOverlayVisible
                  ? "opacity-100"
                  : "pointer-events-none opacity-0",
              )}
              onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling to video container
            >
              <Button
                variant="ghost"
                size="icon"
                className="flex h-auto flex-col items-center justify-center p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  showOverlay(); // Keep overlay visible on button click
                  // Handle like action
                }}
              >
                <Heart className="size-7" />
                <span className="text-xs">{video.likes}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="flex h-auto flex-col items-center justify-center p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  showOverlay(); // Keep overlay visible on button click
                  // Handle comment action
                }}
              >
                <MessageCircle className="size-7" />
                <span className="text-xs">{video.comments}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="flex h-auto flex-col items-center justify-center p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  showOverlay(); // Keep overlay visible on button click
                  // Handle bookmark action
                }}
              >
                <Bookmark className="size-7" />
                <span className="text-xs">{video.bookmarks}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="flex h-auto flex-col items-center justify-center p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  showOverlay(); // Keep overlay visible on button click
                  // Handle share action
                }}
              >
                <Share2 className="size-7" />
                <span className="text-xs">{video.shares}</span>
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-500/50">
              <div
                className="h-full bg-primary"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VideoPlayer;
