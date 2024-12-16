import { NextRequest, NextResponse } from "next/server";
import { getCommentsByUserId } from "@/database/comment/comment.repository";
import {
  checkFollowing,
  getFollowersByUserId,
  getFollowingsByUserId,
} from "@/database/following/following.repository";
import PostModel from "@/database/post/post.model";
import UserModel from "@/database/user/user.model";
import { connectToDatabase } from "@/lib/database";
import { validateRequest } from "@/lib/auth/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } },
) {
  try {
    await connectToDatabase();

    const { user: currentUser } = await validateRequest();
    let isFollowing = false;

    // Get basic user info
    const user = await UserModel.findOne({
      username: params.username,
    }).select("username email role display_name avatar bio");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (currentUser && (await checkFollowing(currentUser.id, user._id))) {
      isFollowing = true;
    }

    // Get recent articles
    const articles = (
      await PostModel.find({
        author_id: user._id,
        published: true,
      })
        .sort({ published_at: -1 })
        .limit(5)
        .select("title description published_at ttr reactions image_url")
    ).map((article) => article.toObject());

    const comments = await getCommentsByUserId(user._id);

    const followersCount = (await getFollowersByUserId(user._id)).length || 0;
    const followingCount = (await getFollowingsByUserId(user._id)).length || 0;

    // Get writer stats
    //   const stats = await getWriterStats(user._id);

    //   // Get popular articles
    //   const popularArticles = await Article.find({
    //     author: user._id,
    //     status: 'published'
    //   })
    //   .sort({ viewCount: -1 })
    //   .limit(3)
    //   .select('title slug viewCount likeCount');

    return NextResponse.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        display_name: user.display_name,
        followersCount,
        followingCount,
      },
      articles,
      comments,
      isFollowing,
      // profile: profile ? {
      //   bio: profile.bio,
      //   avatar: profile.avatar,
      //   coverImage: profile.coverImage,
      //   socialLinks: profile.socialLinks,
      //   expertise: profile.expertise,
      //   badgeLevel: profile.badgeLevel
      // } : null,
      // stats,
      // content: {
      //   recentArticles,
      //   popularArticles
      // }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
