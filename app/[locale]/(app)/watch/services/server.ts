import { YouTubeService } from "../services/youtube.service";
import { Video, VideoDetails } from "../services/types";

interface PlaylistResponse {
  videos: Video[];
  nextPageToken?: string;
}

export async function getChannelVideos(pageToken?: string): Promise<PlaylistResponse> {
  try {
    return await YouTubeService.fetchChannelVideos(pageToken);
  } catch (error) {
    console.error("Error fetching channel videos:", error);
    return { videos: [] };
  }
}

export async function getVideoDetails(videoId: string): Promise<VideoDetails> {
  try {
    return await YouTubeService.getVideoDetails(videoId);
  } catch (error) {
    console.error("Error fetching video details:", error);
    // Return fallback data
    return {
      id: videoId,
      title: "Video Title",
      channelTitle: "Channel Name",
      viewCount: "0",
      publishDate: "Unknown date",
      description: "No description available.",
      subscriberCount: "0",
      likeCount: "0",
      dislikeCount: "0"
    };
  }
}