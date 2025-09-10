import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { DEFAULT_WHITELIST } from "@/constants/roles";
import NotificationModel from "@/database/notification/notification.model";
import PostModel from "@/database/post/post.model";

// Import required modules
import {
  deleteSubscription,
  findSubscriptionsByUserId,
} from "@/database/subscription/subscription.repository";
import UserModel from "@/database/user/user.model";
import connectionManager from "@/lib/connection-manager";
import { connectToDatabase } from "@/lib/database";
import { Id, newId } from "@/lib/database";
import { webPush } from "@/lib/web-push";
import { INotification, NotificationContent } from "@/types/notification.type";

// Helper function to create recommendation notification
async function createRecommendationNotification(
  recipientId: Id,
  postId: Id,
  content: NotificationContent,
  slug: string,
): Promise<INotification> {
  return await NotificationModel.create({
    recipient: recipientId,
    type: "RECOMMENDATION",
    subtype: "TRENDING_CONTENT",
    actors: [], // No actors for system recommendations
    targetObject: {
      model: "Post",
      id: postId,
      slug,
    },
    content,
    status: {
      isRead: false,
      isArchived: false,
    },
    priority: "NORMAL",
  });
}

// Helper function to get active users
const getActiveUsers = async () => {
  const users = await UserModel.find({
    role: {
      $in: DEFAULT_WHITELIST,
    },
  })
    .select("_id location")
    .exec();
  return users.map((user) => user._id.toString());
};

export async function POST(request: NextRequest) {
  // Secure the cron job with a secret key stored in your environment variables
  // const { searchParams } = new URL(request.url);
  // if (searchParams.get('secret') !== process.env.CRON_SECRET) {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }

  await connectToDatabase();

  try {
    // Fetch posts from the last 4 hours
    const fourHoursAgo = new Date();
    fourHoursAgo.setHours(fourHoursAgo.getHours() - 6);

    // Find posts from the last 4 hours, sorted by prominence_score descending
    const trendingPost = await PostModel.findOne(
      {
        published_at: { $gte: fourHoursAgo },
        source_type: "user",
        status: "active",
      },
      "_id title description image_url link slug prominence_score",
    )
      .sort({ prominence_score: -1 })
      .lean();

    if (!trendingPost) {
      return NextResponse.json({
        success: true,
        message: "No trending posts found in the last 4 hours.",
      });
    }

    // Get active users
    const activeUsers = await getActiveUsers();

    // Send notifications to all active users
    for (const user of activeUsers) {
      const notification = await createRecommendationNotification(
        newId(user),
        newId(trendingPost._id.toString()),
        {
          title: trendingPost.title,
          body: trendingPost.description,
          thumbnail: trendingPost.image_url ?? undefined,
          url: trendingPost.link ?? undefined,
        },
        trendingPost.slug,
      );

      // Send to connection manager
      connectionManager?.sendNotification(user, notification);

      // Send push notifications
      const pushSubscription = await findSubscriptionsByUserId(user);

      for (const subscription of pushSubscription) {
        try {
          await webPush.sendNotification(
            {
              endpoint: subscription.endpoint,
              expirationTime: subscription.expirationTime,
              keys: subscription.keys,
            },
            JSON.stringify({
              ...notification.content,
              id: notification._id?.toString(),
              postSlug: trendingPost.slug,
            }),
          );
        } catch (error) {
          console.log(
            "Push notification error:",
            (error as { body?: unknown }).body,
          );
          if ((error as { statusCode?: number }).statusCode === 410) {
            await deleteSubscription(subscription.endpoint);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Notification sent for trending post",
      post: {
        id: trendingPost._id.toString(),
        title: trendingPost.title,
        prominence_score: trendingPost.prominence_score,
      },
    });
  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json(
      { success: false, message: "Cron job failed." },
      { status: 500 },
    );
  }
}
