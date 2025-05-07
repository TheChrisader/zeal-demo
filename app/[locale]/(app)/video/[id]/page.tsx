import VideoFeed from "../../(home)/[category]/_components/VideoFeed";

const VideoPage = async ({ params }: { params?: { id: string } }) => {
  return <VideoFeed videoId={params?.id} />;
};

export default VideoPage;
