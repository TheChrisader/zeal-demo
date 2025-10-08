import DraftModel from "@/database/draft/draft.model";
import { redirect } from "@/i18n/routing";
import { validateRequest } from "@/lib/auth/auth";
import PostScheduled from "./_components/PostScheduled";
import { Types } from "mongoose";

const ScheduledPage = async ({ params }: { params: { id: string } }) => {
  const { user } = await validateRequest();
  if (!user || user.role === "user")
    return redirect({
      href: "/",
      locale: "en",
    });

  if (!params.id) return redirect({ href: "/", locale: "en" });

  if (!Types.ObjectId.isValid(params.id))
    return redirect({ href: "/", locale: "en" });

  const draft = await DraftModel.findById(params.id);

  if (!draft) return redirect({ href: "/", locale: "en" });

  if (draft?.user_id.toString() !== user.id.toString())
    return redirect({ href: "/", locale: "en" });

  if (!draft.isScheduled) {
    return redirect({ href: `/editor/${params.id}`, locale: "en" });
  }

  if (draft.moderationStatus === "published") {
    return redirect({ href: "/", locale: "en" });
  }

  return <PostScheduled article={draft} />;
};

export default ScheduledPage;