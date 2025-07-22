import PostModel from "@/database/post/post.model";
import { redirect } from "@/i18n/routing";
import { validateRequest } from "@/lib/auth/auth";
import PostAwaitingApproval from "./_components/PostAwaitingApproval";
import { Types } from "mongoose";
import DraftModel from "@/database/draft/draft.model";

const AwaitingApprovalPage = async ({ params }: { params: { id: string } }) => {
  const { user } = await validateRequest();
  if (!user || user.role === "user")
    return redirect({
      href: "/",
      locale: "en",
    });

  if (!params.id) return redirect({ href: "/", locale: "en" });

  if (!Types.ObjectId.isValid(params.id))
    return redirect({ href: "/", locale: "en" });

  const post = await DraftModel.findById(params.id);

  if (!post) return redirect({ href: "/", locale: "en" });

  if (post?.user_id.toString() !== user.id.toString())
    return redirect({ href: "/", locale: "en" });

  if (post.moderationStatus === "published") {
    const publishedPost = await PostModel.findOne({ draft_id: post._id });
    if (!publishedPost) return redirect({ href: "/", locale: "en" });
    return redirect({ href: `/published/${publishedPost._id}`, locale: "en" });
  } else if (post.moderationStatus === "rejected") {
    return redirect({ href: `/editor/${params.id}`, locale: "en" });
  }

  return <PostAwaitingApproval article={post} />;
};

export default AwaitingApprovalPage;
