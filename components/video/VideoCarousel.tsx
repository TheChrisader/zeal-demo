"use client";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Player from "./Player";

interface VideoData {
  id: string;
  url: string;
  title: string;
}

const VideoCarousel: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>([
    {
      id: "ka9g1wBFgUU",
      url: "https://www.youtube.com/shorts/ka9g1wBFgUU",
      title: "Nigeria's Art Scenes.",
    },
    {
      id: "KGEqSE2ghbk",
      url: "https://www.youtube.com/shorts/KGEqSE2ghbk",
      title: "The Sahara wasn't always a desert",
    },
    {
      id: "vQST15DlqME",
      url: "https://www.youtube.com/shorts/vQST15DlqME",
      title: "Virgil Abloh did more than design clothes.",
    },
  ]);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [inputValues, setInputValues] = useState(["", "", ""]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mainVideoRef = useRef<HTMLDivElement>(null);

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string | undefined => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return "";
  };

  // Update video URL
  const updateVideoUrl = (index: number, url: string) => {
    const videoId = extractVideoId(url);
    if (videoId) {
      const newVideos = [...videos];
      newVideos[index] = {
        id: videoId,
        url: url,
        title: `Video ${index + 1}`,
      };
      setVideos(newVideos);
    }
  };

  // Handle input changes
  const handleInputChange = (index: number, value: string) => {
    const newInputValues = [...inputValues];
    newInputValues[index] = value;
    setInputValues(newInputValues);

    if (value.trim()) {
      updateVideoUrl(index, value);
    }
  };

  // Start auto-cycling
  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        setIsTransitioning(true);
        setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 500);
      }
    }, 15000);
  };

  // Stop auto-cycling
  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Change to specific video
  const changeVideo = (index: number) => {
    if (index === currentVideoIndex || isTransitioning) return;

    setIsTransitioning(true);
    setCurrentVideoIndex(index);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);

    // Reset interval
    stopInterval();
    startInterval();
  };

  // Navigation controls
  const nextVideo = () => {
    changeVideo((currentVideoIndex + 1) % videos.length);
  };

  const prevVideo = () => {
    changeVideo((currentVideoIndex - 1 + videos.length) % videos.length);
  };

  // Handle hover and focus events
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);
  const handleFocus = () => setIsPaused(true);
  const handleBlur = () => setIsPaused(false);

  // Initialize interval on mount
  useEffect(() => {
    startInterval();
    return () => stopInterval();
  }, [isPaused]);

  return (
    <div className="mx-auto w-full max-w-6xl rounded-lg bg-gray-900 p-4 text-white">
      {/* Input Section */}
      {/* <div className="mb-6 space-y-3">
        <h2 className="mb-4 text-xl font-bold">YouTube Video Carousel</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {inputValues.map((value, index) => (
            <div key={index} className="flex flex-col">
              <label className="mb-1 text-sm text-gray-300">
                Video {index + 1} URL
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div> */}

      {/* Main Carousel */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Main Video Player */}
        <div className="flex-1">
          <div
            // ref={mainVideoRef}
            className="relative aspect-video overflow-hidden rounded-lg bg-black"
            // className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
            tabIndex={0}
          >
            <div
              className={`inset-0 transition-all duration-500 ease-in-out ${
                isTransitioning
                  ? "translate-x-4 opacity-0"
                  : "translate-x-0 opacity-100"
              }`}
            >
              {/* <iframe
                // src={`https://www.youtube.com/embed/${videos[currentVideoIndex]?.id}?autoplay=1&mute=1&controls=1&rel=0`}
                src={`https://www.youtube.com/embed/${videos[currentVideoIndex]?.id}?controls=1&rel=0`}
                title={videos[currentVideoIndex]?.title}
                className="size-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              /> */}
              <Player src={videos[currentVideoIndex]?.url as string} />
            </div>

            {/* Navigation Controls */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-between p-4 opacity-0 transition-opacity duration-300 hover:opacity-100">
              <button
                onClick={prevVideo}
                className="rounded-full bg-black bg-opacity-50 p-2 text-white transition-all duration-200 hover:bg-opacity-70"
                disabled={isTransitioning}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextVideo}
                className="rounded-full bg-black bg-opacity-50 p-2 text-white transition-all duration-200 hover:bg-opacity-70"
                disabled={isTransitioning}
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Pause Indicator */}
            {isPaused && (
              <div className="absolute right-4 top-4 rounded-full bg-black bg-opacity-50 p-2">
                <Pause size={16} />
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="mt-4 flex justify-center space-x-2">
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => changeVideo(index)}
                className={`size-2 rounded-full transition-all duration-300 ${
                  index === currentVideoIndex
                    ? "bg-blue-500"
                    : "bg-gray-600 hover:bg-gray-500"
                }`}
                disabled={isTransitioning}
              />
            ))}
          </div>
        </div>

        {/* Thumbnail Previews */}
        <div className="flex flex-row gap-3 lg:w-52 lg:flex-col">
          {videos.map((video, index) => (
            <div
              key={video.id}
              className={`relative flex-1 cursor-pointer transition-all duration-300 lg:flex-none ${
                index === currentVideoIndex
                  ? "opacity-100 ring-2 ring-blue-500"
                  : "opacity-70 hover:opacity-100"
              }`}
              onClick={() => changeVideo(index)}
            >
              <div className="aspect-video overflow-hidden rounded-lg bg-black">
                <img
                  src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                  alt={video.title}
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-black bg-opacity-50 p-2 text-white transition-all duration-200 hover:bg-opacity-70">
                    <Play size={20} />
                  </div>
                </div>
              </div>
              <div className="mt-2 text-center text-sm text-gray-300 lg:text-left">
                {video.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      {/* <div className="mt-6 flex items-center justify-center space-x-4">
        <button
          onClick={prevVideo}
          className="rounded-lg bg-gray-800 px-4 py-2 text-white transition-colors duration-200 hover:bg-gray-700"
          disabled={isTransitioning}
        >
          Previous
        </button>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`rounded-lg px-4 py-2 transition-colors duration-200 ${
            isPaused
              ? "bg-green-600 hover:bg-green-500"
              : "bg-red-600 hover:bg-red-500"
          } text-white`}
        >
          {isPaused ? "Resume" : "Pause"} Auto-cycle
        </button>
        <button
          onClick={nextVideo}
          className="rounded-lg bg-gray-800 px-4 py-2 text-white transition-colors duration-200 hover:bg-gray-700"
          disabled={isTransitioning}
        >
          Next
        </button>
      </div> */}
    </div>
  );
};

export default VideoCarousel;
