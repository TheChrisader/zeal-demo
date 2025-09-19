import { Suspense } from "react";
import { Playlist } from "./_components/Playlist";
import { VideoPlayer } from "./_components/VideoPlayer";
import { getChannelVideos, getVideoDetails } from "./services/server";

interface WatchPageProps {
  searchParams: { v?: string };
}

export const revalidate = 0.5 * 60;

export default async function WatchPage({ searchParams }: WatchPageProps) {
  const playlistData = await getChannelVideos();

  let videoId = searchParams.v;

  if (!videoId && playlistData.videos.length > 0) {
    videoId = playlistData.videos[0]?.id;
  }

  videoId = videoId || "WtPm3A839-s";

  const videoDetails = await getVideoDetails(videoId);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main Video Player */}
        <div className="w-full lg:w-2/3">
          <VideoPlayer
            videoId={videoId}
            title={videoDetails.title}
            channelTitle={videoDetails.channelTitle}
            viewCount={videoDetails.viewCount}
            publishDate={videoDetails.publishDate}
          />

          {/* <div className="mt-4">
            <h1 className="text-xl font-bold text-foreground">
              {videoDetails.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <span className="font-bold text-white">
                    {videoDetails.channelTitle?.charAt(0) || "C"}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {videoDetails.channelTitle}
                  </p>
                  <p className="text-sm text-muted-alt">
                    {videoDetails.subscriberCount
                      ? `${parseInt(videoDetails.subscriberCount).toLocaleString()} subscribers`
                      : "0 subscribers"}
                  </p>
                </div>
                <button className="ml-4 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  Subscribe
                </button>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 rounded-full bg-subtle-bg px-4 py-2 transition-colors hover:bg-subtle-bg/80">
                  <span>👍</span>
                  <span>
                    {videoDetails.likeCount
                      ? parseInt(videoDetails.likeCount).toLocaleString()
                      : "0"}
                  </span>
                </button>
                <button className="flex items-center gap-2 rounded-full bg-subtle-bg px-4 py-2 transition-colors hover:bg-subtle-bg/80">
                  <span>👎</span>
                </button>
                <button className="rounded-full bg-subtle-bg px-4 py-2 transition-colors hover:bg-subtle-bg/80">
                  Share
                </button>
                <button className="rounded-full bg-subtle-bg px-4 py-2 transition-colors hover:bg-subtle-bg/80">
                  Save
                </button>
              </div>
            </div>
          </div> */}

          {/* <div className="mt-6 rounded-lg bg-subtle-bg p-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium">
                {videoDetails.viewCount
                  ? `${parseInt(videoDetails.viewCount).toLocaleString()} views`
                  : "0 views"}
              </span>
              <span>{videoDetails.publishDate}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-foreground-alt-p">
              {videoDetails.description}
            </p>
          </div> */}
        </div>

        {/* Playlist Section */}
        <div className="w-full lg:w-1/3">
          <Suspense fallback={<PlaylistSkeleton />}>
            <Playlist
              initialVideos={playlistData.videos}
              initialNextPageToken={playlistData.nextPageToken}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function PlaylistSkeleton() {
  return (
    <div className="w-full">
      <h2 className="mb-4 text-lg font-bold text-foreground">Playlist</h2>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex animate-pulse gap-2 rounded-lg bg-subtle-bg p-2"
          >
            <div className="h-18 bg-subtle-bg-alt w-32 rounded" />
            <div className="flex-1">
              <div className="bg-subtle-bg-alt mb-2 h-4 rounded"></div>
              <div className="bg-subtle-bg-alt mb-1 h-3 w-3/4 rounded"></div>
              <div className="bg-subtle-bg-alt h-3 w-1/2 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
