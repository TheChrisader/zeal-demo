import { NextRequest, NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";
const CHANNEL_ID = "UCBYiM6nO9SkQylmZsetVs5g";

interface PlaylistResponse {
  videos: any[];
  nextPageToken?: string;
}

export async function GET(request: NextRequest) {
  if (!YOUTUBE_API_KEY) {
    return NextResponse.json(
      { error: "YouTube API key is not configured" },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const pageToken = searchParams.get("pageToken") || undefined;
    
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
    const videos: any[] = data.items.map((item: any) => {
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
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos from YouTube" },
      { status: 500 }
    );
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