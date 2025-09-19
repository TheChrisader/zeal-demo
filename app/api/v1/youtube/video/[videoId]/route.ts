import { NextRequest, NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

export async function GET(request: NextRequest, { params }: { params: { videoId: string } }) {
  const { videoId } = params;
  
  if (!videoId) {
    return NextResponse.json(
      { error: "Video ID is required" },
      { status: 400 }
    );
  }

  if (!YOUTUBE_API_KEY) {
    return NextResponse.json(
      { error: "YouTube API key is not configured" },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }
    
    const item = data.items[0];
    
    // Fetch channel details for subscriber count
    const channelResponse = await fetch(
      `${BASE_URL}/channels?part=statistics&id=${item.snippet.channelId}&key=${YOUTUBE_API_KEY}`
    );
    
    const channelData = await channelResponse.json();
    const channelStats = channelData.items[0]?.statistics;
    
    const result = {
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

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching YouTube video details:", error);
    return NextResponse.json(
      { error: "Failed to fetch video details from YouTube" },
      { status: 500 }
    );
  }
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