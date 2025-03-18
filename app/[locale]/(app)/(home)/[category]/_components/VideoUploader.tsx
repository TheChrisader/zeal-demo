"use client";

import { Upload, X } from "lucide-react";
import type React from "react";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { VideoPost } from "./video-post";

interface VideoUploaderProps {
  onVideoUploaded: (newVideo: VideoPost) => void;
  onClose: () => void;
}

export function VideoUploader({
  onVideoUploaded,
  onClose,
}: VideoUploaderProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [audioTitle, setAudioTitle] = useState("Original Sound");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is a video
    if (!file.type.startsWith("video/")) {
      alert("Please upload a video file");
      return;
    }

    setVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreview(objectUrl);

    // Generate thumbnail when video is loaded
    if (videoRef.current) {
      videoRef.current.onloadeddata = () => {
        // Video is loaded and can be played
        console.log("Video loaded successfully");
      };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !videoPreview) return;

    setIsUploading(true);

    // Create a new video post object
    const newVideo: VideoPost = {
      id: `upload-${Date.now()}`,
      username: "You",
      userHandle: "@you",
      caption: caption || "My uploaded video",
      audioTitle: audioTitle || "Original Sound",
      likes: "0",
      comments: "0",
      shares: "0",
      bookmarks: "0",
      videoUrl: videoPreview,
      thumbnail: "",
      userAvatar: "/placeholder.svg?height=50&width=50",
    };

    // Add the new video to the videos array
    onVideoUploaded(newVideo);

    // Reset form
    setIsUploading(false);
    setVideoFile(null);
    setVideoPreview(null);
    setCaption("");
    setAudioTitle("Original Sound");
    onClose();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex max-h-screen items-center justify-center overflow-y-scroll bg-black/80">
      <div className="relative w-full max-w-md rounded-lg bg-gray-900 p-6 text-white">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        <h2 className="mb-4 text-xl font-bold">Upload Video</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!videoPreview ? (
            <div
              className="cursor-pointer rounded-lg border-2 border-dashed border-gray-600 p-8 text-center transition-colors hover:border-gray-400"
              onClick={triggerFileInput}
            >
              <Upload className="mx-auto mb-2 h-10 w-10" />
              <p>Click to upload a video</p>
              <p className="mt-1 text-xs text-gray-400">
                MP4, WebM or other video formats
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-[9/16] overflow-hidden rounded-lg bg-black">
                <video
                  ref={videoRef}
                  src={videoPreview}
                  className="h-full w-full object-contain"
                  controls
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 right-2"
                  onClick={triggerFileInput}
                >
                  Change
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  id="caption"
                  placeholder="Add a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="border-gray-700 bg-gray-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audio">Audio Title</Label>
                <Input
                  id="audio"
                  placeholder="Original Sound"
                  value={audioTitle}
                  onChange={(e) => setAudioTitle(e.target.value)}
                  className="border-gray-700 bg-gray-800"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!videoPreview || isUploading}
              className="bg-gradient-to-r from-blue-500 to-red-500 hover:opacity-90"
            >
              {isUploading ? "Uploading..." : "Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
