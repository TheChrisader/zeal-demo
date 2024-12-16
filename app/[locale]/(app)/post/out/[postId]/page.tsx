import { getPostById } from "@/database/post/post.repository";
import { redirect } from "@/i18n/routing";
import { connectToDatabase } from "@/lib/database";

export default async function OutboundPage({
  params,
}: {
  params: { postId: string };
}) {
  await connectToDatabase();
  // const newsFetcher = new NewsDataAPiClient(process.env.NEWSDATA_API_KEY!);
  const article_id = params.postId;

  const post = await getPostById(article_id);

  if (!post) {
    return redirect({ href: `/post/${article_id}`, locale: "en" });
  }

  if (!post?.link) {
    return redirect({ href: `/post/${article_id}`, locale: "en" });
  }

  return (
    <iframe
      src={post.link}
      style={{ height: "calc(100vh - 62px)" }}
      width={"100%"}
    />
  );
}
