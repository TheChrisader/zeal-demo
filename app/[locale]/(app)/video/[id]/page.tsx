import VideoInterface from "../../(home)/[category]/_components/VideoInterface";

const VideoPage = async ({ params }: { params?: { id: string } }) => {
  return <VideoInterface videoId={params?.id} />;
};

export default VideoPage;
