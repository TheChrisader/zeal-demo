import PostModel from "@/database/post/post.model";
import { redirect } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const post = await PostModel.findOne({
    short_url: `zealnews.africa/en/r/${params.id}`,
  });

  return {
    title: post?.title,
    description: post?.description,
    openGraph: {
      title: post?.title,
      description: post?.description,
      images: post?.image_url,
      type: "article",
    },
  };
}

export default async function RPage({ params }: { params: { id: string } }) {
  const post = await PostModel.findOne({
    short_url: `zealnews.africa/en/r/${params.id}`,
  });

  if (post) {
    return redirect({ href: `/post/${post.slug}`, locale: "en" });
  }

  return redirect({ href: "/", locale: "en" });
}
