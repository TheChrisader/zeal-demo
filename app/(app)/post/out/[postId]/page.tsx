import { getPostById } from "@/database/post/post.repository";
import { connectToDatabase } from "@/lib/database";
import { NewsDataAPiClient } from "@/lib/newsdata/utils/NewsDataClient";
import { redirect } from "next/navigation";

export default async function OutboundPage({
  params,
}: {
  params: { postId: string };
}) {
  await connectToDatabase();
  // const newsFetcher = new NewsDataAPiClient(process.env.NEWSDATA_API_KEY!);
  const article_id = params.postId;

  const post = await getPostById(article_id);

  if (!post?.link) {
    redirect(`/post/${article_id}`);
  }

  return (
    <iframe
      src={post?.link}
      style={{ height: "calc(100vh - 62px)" }}
      width={"100%"}
    />
  );
}
