import { connectToDatabase } from "@/lib/database";
import UserProfilePage from "./_components/UserProfilePage";
import { validateRequest } from "@/lib/auth/auth";
import UserModel from "@/database/user/user.model";
import {
  checkFollowing,
  getFollowersByUserId,
  getFollowingsByUserId,
} from "@/database/following/following.repository";
import PostModel from "@/database/post/post.model";
import { getCommentsByUserId } from "@/database/comment/comment.repository";
import { redirect } from "@/i18n/routing";

export default async function ProfilePage({
  params: { username },
}: {
  params: { username: string };
}) {
  await connectToDatabase();
  const { user: currentUser } = await validateRequest();

  if (currentUser?.username === username) {
    redirect({
      href: "/settings/profile",
      locale: "en",
    });
  }

  let isFollowing = false;

  // Get basic user info
  const user = await UserModel.findOne({
    username: username,
  }).select("username email role display_name avatar bio");

  if (!user) {
    return <>This user does not exist</>;
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
  return (
    <UserProfilePage
      fetchedUser={{
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        display_name: user.display_name,
        followersCount,
        followingCount,
      }}
      fetchedArticles={articles}
      fetchedComments={comments}
      fetchedIsFollowing={isFollowing}
    />
  );
}
