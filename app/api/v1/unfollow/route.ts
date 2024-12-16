import { NextRequest, NextResponse } from "next/server";
import {
  checkFollowing,
  deleteFollowing,
} from "@/database/following/following.repository";
import UserModel from "@/database/user/user.model";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import FollowingModel from "@/database/following/following.model";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 },
      );
    }

    const currentUser = await UserModel.findOne({ email: user.email });
    const targetUser = await UserModel.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if not following
    if (!(await checkFollowing(currentUser._id, targetUserId))) {
      return NextResponse.json(
        { error: "Already following this user" },
        { status: 400 },
      );
    }

    const sess = await (await mongoose.conn)!.startSession();
    sess.startTransaction();

    try {
      // Remove from following list
      await deleteFollowing(currentUser._id, targetUserId, sess);

      // await FollowingModel.findByIdAndUpdate(
      //   currentUser._id,
      //   {
      //     $pull: { following: targetUserId },
      //     $inc: { followingCount: -1 }
      //   },
      //   { session: sess }
      // );

      // // Remove from followers list
      // await FollowingModel.findByIdAndUpdate(
      //   targetUserId,
      //   {
      //     $pull: { followers: currentUser._id },
      //     $inc: { followersCount: -1 }
      //   },
      //   { session: sess }
      // );

      await sess.commitTransaction();
    } catch (error) {
      await sess.abortTransaction();
      throw error;
    } finally {
      sess.endSession();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unfollow error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
