import { NextResponse } from "next/server";
import FollowingModel from "@/database/following/following.model";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";

export async function GET() {
  try {
    await connectToDatabase();

    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [followCount, followerCount] = await Promise.all([
      FollowingModel.countDocuments({ user_id: user.id }),
      FollowingModel.countDocuments({ following_id: user.id }),
    ]);

    return NextResponse.json({ followCount, followerCount });
  } catch (error) {
    console.error("Follow Count error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
