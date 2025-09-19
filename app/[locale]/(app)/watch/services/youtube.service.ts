// YouTube API service implementing the actual YouTube API logic
import { Video, VideoDetails } from "./types";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";
const CHANNEL_ID = "UCBYiM6nO9SkQylmZsetVs5g";

interface PlaylistResponse {
  videos: Video[];
  nextPageToken?: string;
}

export class YouTubeService {
  static async fetchChannelVideos(pageToken?: string): Promise<PlaylistResponse> {
    if (!YOUTUBE_API_KEY) {
      throw new Error("YouTube API key is not configured");
    }

    try {
      const response = await fetch(
        `${BASE_URL}/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=10&order=date&type=video&key=${YOUTUBE_API_KEY}${pageToken ? `&pageToken=${pageToken}` : ""}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Fetch video details to get duration and view count
      const videoIds = data.items.map((item: any) => item.id.videoId).join(",");
      const detailsResponse = await fetch(
        `${BASE_URL}/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
      );
      
      const detailsData = await detailsResponse.json();
      
      // Combine search results with video details
      const videos: Video[] = data.items.map((item: any) => {
        const videoDetail = detailsData.items.find((detail: any) => detail.id === item.id.videoId);
        
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          viewCount: videoDetail?.statistics?.viewCount 
            ? parseInt(videoDetail.statistics.viewCount).toLocaleString() 
            : "0",
          publishedAt: formatPublishedAt(item.snippet.publishedAt),
          duration: formatDuration(videoDetail?.contentDetails?.duration || "PT0S"),
          thumbnailUrl: item.snippet.thumbnails.medium.url
        };
      });

      const result: PlaylistResponse = {
        videos,
        nextPageToken: data.nextPageToken
      };
      
      return result;
    } catch (error) {
      console.error("Error fetching YouTube videos:", error);
      throw new Error("Failed to fetch videos from YouTube");
    }
  }

  static async getVideoDetails(videoId: string): Promise<VideoDetails> {
    if (!videoId) {
      throw new Error("Video ID is required");
    }

    if (!YOUTUBE_API_KEY) {
      throw new Error("YouTube API key is not configured");
    }

    try {
      // Fetch video details
      const response = await fetch(
        `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.items.length === 0) {
        throw new Error("Video not found");
      }
      
      const item = data.items[0];
      
      // Fetch channel details for subscriber count
      const channelResponse = await fetch(
        `${BASE_URL}/channels?part=statistics&id=${item.snippet.channelId}&key=${YOUTUBE_API_KEY}`
      );
      
      const channelData = await channelResponse.json();
      const channelStats = channelData.items[0]?.statistics;
      
      const result: VideoDetails = {
        id: item.id,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        viewCount: parseInt(item.statistics.viewCount).toLocaleString(),
        publishDate: formatPublishedAt(item.snippet.publishedAt),
        description: item.snippet.description,
        subscriberCount: channelStats?.subscriberCount 
          ? parseInt(channelStats.subscriberCount).toLocaleString() 
          : "0",
        likeCount: parseInt(item.statistics.likeCount).toLocaleString(),
        dislikeCount: "0" // YouTube API no longer provides dislike count
      };

      return result;
    } catch (error) {
      console.error("Error fetching YouTube video details:", error);
      throw new Error("Failed to fetch video details from YouTube");
    }
  }
}

function formatDuration(duration: string): string {
  // Convert ISO 8601 duration to MM:SS format
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatPublishedAt(publishedAt: string): string {
  const date = new Date(publishedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
}