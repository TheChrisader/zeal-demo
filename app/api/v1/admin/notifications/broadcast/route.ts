import { NextRequest, NextResponse } from "next/server";
import NotificationModel from "@/database/notification/notification.model";
import { Id, newId } from "@/lib/database";
import { INotification, NotificationContent } from "@/types/notification.type";
import {
  deleteSubscription,
  deleteSubscriptionsByUserId,
  findSubscriptionsByUserId,
} from "@/database/subscription/subscription.repository";
import { webPush } from "@/lib/web-push";
import PostModel from "@/database/post/post.model";
import connectionManager from "@/lib/connection-manager";
import UserModel from "@/database/user/user.model";
import { DEFAULT_WHITELIST } from "@/constants/roles";

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
  try {
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // return NextResponse.json(await getActiveUsers());

    const post = await PostModel.findById(postId)
      .select("title description image_url link slug")
      .exec();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // const activeUsers = [
    //   "671661b98966f7cda7f5486a",
    //   // "67163f3a82227c356a86cb88",
    // ];

    const activeUsers = await getActiveUsers();

    // console.log(await getActiveUsers());
    // return NextResponse.json(null);

    for (const user of activeUsers) {
      const notification = await createRecommendationNotification(
        newId(user),
        newId(postId),
        {
          title: post.title,
          body: post.description,
          thumbnail: post.image_url ?? undefined,
          url: post.link ?? undefined,
        },
        post.slug,
      );

      connectionManager?.sendNotification(user, notification);

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
              postSlug: post.slug,
            }),
          );
        } catch (error) {
          console.log("Push notification error:", error.body);
          if (error.statusCode === 410) {
            await deleteSubscription(subscription.endpoint);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error broadcasting recommendations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
