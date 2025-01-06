import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import {
  checkFollowing,
  createFollowing,
} from "@/database/following/following.repository";
import UserModel from "@/database/user/user.model";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase, newId } from "@/lib/database";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUserId }: { targetUserId: string } = await req.json();

    // Validate input
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

    // Check if already following
    if (await checkFollowing(currentUser._id, targetUserId)) {
      return NextResponse.json(
        { error: "Already following this user" },
        { status: 400 },
      );
    }

    // Start a session for atomic operations
    const sess = await (await mongoose)!.startSession();
    sess.startTransaction();

    try {
      // Update following list for current user
      await createFollowing(currentUser._id, newId(targetUserId), sess);
      //   await UserModel.findByIdAndUpdate(
      //     currentUser._id,
      //     {
      //       $push: { following: targetUserId },
      //       $inc: { followingCount: 1 },
      //     },
      //     { session: sess },
      //   );

      // Update followers list for target user
      //   await UserModel.findByIdAndUpdate(
      //     targetUserId,
      //     {
      //       $push: { followers: currentUser._id },
      //       $inc: { followersCount: 1 },
      //     },
      //     { session: sess },
      //   );

      await sess.commitTransaction();
    } catch (error) {
      await sess.abortTransaction();
      throw error;
    } finally {
      sess.endSession();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
