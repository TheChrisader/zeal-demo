import { NextRequest, NextResponse } from "next/server";
// import { flagPost } from '@/lib/flagging';
import PostModel from "@/database/post/post.model";
import ReportModel from "@/database/report/report.model";
import { validateRequest } from "@/lib/auth/auth";
import { Id, newId } from "@/lib/database";
import { IReport } from "@/types/report.type";

export async function flagPost(
  postId: string,
  userId: Id,
  reason: IReport["reason"],
  description?: string,
) {
  const session = await (await mongoose.conn!).startSession();
  session.startTransaction();

  try {
    const report = await ReportModel.create(
      [
        {
          post: newId(postId),
          reporter: userId,
          reason,
          description: description ? description : undefined,
        },
      ],
      { session },
    );

    const post = await PostModel.findById(postId).session(session);

    if (!post) throw new Error("Post not found");

    if (post.status === "active") {
      post.status = "flagged";
    }

    await post.save();
    await session.commitTransaction();

    return { report, post };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { postID, reason, description } = body;

    const result = await flagPost(postID, user.id as Id, reason, description);

    return NextResponse.json(result);
  } catch (error) {
    console.log(`Error flagging post: ${error}`);
    return NextResponse.json({ error: "Failed to flag post" }, { status: 500 });
  }
}
