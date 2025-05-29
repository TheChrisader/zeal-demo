import PostModel from "@/database/post/post.model";
import { redirect } from "@/i18n/routing";
import { validateRequest } from "@/lib/auth/auth";
import PostPublish from "./_components/PostPublish";
import { Types } from "mongoose";

const PublishedPage = async ({ params }: { params: { id: string } }) => {
  const { user } = await validateRequest();
  if (!user || user.role === "user")
    return redirect({
      href: "/",
      locale: "en",
    });

  if (!params.id) return redirect({ href: "/", locale: "en" });

  if (!Types.ObjectId.isValid(params.id))
    return redirect({ href: "/", locale: "en" });

  const post = await PostModel.findById(params.id);

  if (post?.author_id !== user.id.toString())
    return redirect({ href: "/", locale: "en" });

  return <PostPublish article={post} />;
};

export default PublishedPage;
