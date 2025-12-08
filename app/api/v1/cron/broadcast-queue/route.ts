import Bottleneck from "bottleneck";
import { NextResponse } from "next/server";
import { CATEGORIES } from "@/categories/flattened";
import {
  getCampaignToResume,
  updateCampaign,
  updateCampaignStatus,
} from "@/database/campaign/campaign.repository";
import EmailSubscriptionModel from "@/database/email-subscription/email-subscription.model";
import SubscriberModel from "@/database/subscriber/subscriber.model";
import UserModel from "@/database/user/user.model";
import { connectToDatabase, Id, newId } from "@/lib/database";
import { MailOptions } from "@/lib/mailer";
import { IEmailSubscription } from "@/types/email-subscription.type";
import { ISubscriber } from "@/types/subscriber.type";
import { IUser } from "@/types/user.type";
import { sendEmail } from "@/utils/email";

const generateUnsubscribeUrl = (
  id: string,
  isDirectUserEmail: boolean = false,
) => {
  if (isDirectUserEmail) {
    return `https://zealnews.africa/api/v1/newsletter/unsubscribe/user/${id}`;
  }
  return `https://zealnews.africa/api/v1/newsletter/unsubscribe/${id}`;
};

export async function POST() {
  try {
    await connectToDatabase();
    let IS_DIRECT_USER_EMAIL = false;

    // Get the working campaign to resume
    const campaign = await getCampaignToResume();
    if (!campaign) {
      return NextResponse.json({
        success: true,
        message: "No campaigns to process",
      });
    }

    if (
      !campaign.htmlSnapshot ||
      !campaign.snapshotPlaintext ||
      !campaign.dataSnapshot ||
      !campaign.subject
    ) {
      return NextResponse.json({
        success: false,
        message: "Invalid campaign data",
      });
    }

    const { segment } = campaign;
    let recipients: {
      subscriber_id: string;
      email_address: string;
      name?: string;
    }[] = [];

    // Check if segment exists in categories and fetch from EmailSubscriptionModel
    if (segment && CATEGORIES.includes(segment)) {
      const query: {
        list_id: string;
        status: "subscribed";
        subscriber_id?: { $gt: Id };
      } = {
        list_id: segment,
        status: "subscribed",
      };

      // Add cursor filtering if lastProcessedId exists
      if (campaign.lastProcessedId) {
        query.subscriber_id = { $gt: campaign.lastProcessedId };
      }

      const emailSubscriptions = await EmailSubscriptionModel.find(query)
        .populate<{
          subscriber_id: { _id: Id; email_address: string; name: string };
        }>("subscriber_id", "_id email_address name")
        .sort({ subscriber_id: 1 })
        .limit(20)
        .lean();

      // Transform the data to match expected structure
      recipients = emailSubscriptions.map(
        (
          subscription: Omit<IEmailSubscription, "subscriber_id"> & {
            subscriber_id: { _id: Id; email_address: string; name: string };
          },
        ) => ({
          subscriber_id: subscription.subscriber_id._id.toHexString(),
          email_address: subscription.subscriber_id.email_address,
          name: subscription.subscriber_id.name,
        }),
      );
    }
    // Check if segment is ALL_SUBSCRIBERS
    else if (segment === "ALL_SUBSCRIBERS") {
      const query: {
        global_status: "active";
        _id?: {
          $gt: Id;
        };
      } = {
        global_status: "active",
      };

      // Add cursor filtering if lastProcessedId exists
      if (campaign.lastProcessedId) {
        query._id = { $gt: campaign.lastProcessedId };
      }

      const subscribers = await SubscriberModel.find(query)
        .sort({ _id: 1 })
        .select("_id email_address name")
        .limit(20)
        .lean({ virtuals: true });

      // Transform the data to match expected structure
      recipients = subscribers.map((subscriber: ISubscriber) => ({
        subscriber_id: subscriber.id,
        email_address: subscriber.email_address,
        name: subscriber.name,
      }));
    }
    // Check if segment is ALL_USERS
    else if (segment === "ALL_USERS") {
      IS_DIRECT_USER_EMAIL = true;

      const query: {
        has_email_verified: boolean;
        _id?: {
          $gt: Id;
        };
      } = { has_email_verified: true };

      // Add cursor filtering if lastProcessedUserId exists
      if (campaign.lastProcessedUserId) {
        query._id = { $gt: campaign.lastProcessedUserId };
      }

      const users = await UserModel.find(query)
        .sort({ _id: 1 })
        .select("_id email display_name")
        .limit(20)
        .lean({ virtuals: true });

      // Transform the data to match expected structure
      recipients = users.map((user: IUser) => ({
        subscriber_id: user.id as string,
        email_address: user.email,
        name: user.display_name,
      }));
    }

    if (recipients.length === 0) {
      // Mark the campaign as completed since there are no more recipients
      await updateCampaignStatus(campaign.id, "completed", {
        completed_at: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: "Campaign completed - no more subscribers to process",
      });
    }

    const limiter = new Bottleneck({
      maxConcurrent: 1,
      minTime: 100,
    });

    const tasks = recipients.map((recipient) => {
      const unsubscribeUrl = generateUnsubscribeUrl(
        recipient.subscriber_id,
        IS_DIRECT_USER_EMAIL,
      );

      const subscriberMail = (campaign.htmlSnapshot as string).replaceAll(
        "{{UNSUBSCRIBE_URL}}",
        unsubscribeUrl,
      );

      const plaintext =
        campaign.snapshotPlaintext?.replaceAll(
          "{{UNSUBSCRIBE_URL}}",
          unsubscribeUrl,
        ) || "";

      const headers: MailOptions["headers"] = {};
      if (!IS_DIRECT_USER_EMAIL) {
        headers["List-Unsubscribe"] = `<${unsubscribeUrl}>`;
        headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
      }

      return limiter.schedule(async () => {
        await sendEmail(
          recipient.email_address,
          [],
          [],
          campaign.subject,
          plaintext,
          subscriberMail,
          [],
          headers,
          "newsletter",
        );
      });
    });

    const results = await Promise.allSettled(tasks);

    const sentCount = results.filter((r) => r.status === "fulfilled").length;
    const errorCount = results.filter((r) => r.status === "rejected").length;

    // Optional: Log errors for debugging
    if (errorCount > 0) {
      console.error(`${errorCount} emails failed to send in this batch.`);
    }

    if (sentCount === 0 && errorCount > 0 && errorCount === recipients.length) {
      return NextResponse.json(
        {
          success: false,
          message: "All emails failed to send in this batch.",
        },
        { status: 500 },
      );
    }

    // Update cursor and sent count as the last step before returning
    if (recipients.length > 0) {
      const lastRecipient = recipients[recipients.length - 1];

      if (lastRecipient) {
        if (segment === "ALL_USERS") {
          await updateCampaign(
            {
              id: campaign.id,
              lastProcessedUserId: newId(lastRecipient.subscriber_id),
            },
            {
              sent: sentCount,
            },
          );
        } else {
          await updateCampaign(
            {
              id: campaign.id,
              lastProcessedId: newId(lastRecipient.subscriber_id),
            },
            {
              sent: sentCount,
            },
          );
        }
      }
    }

    // for (const recipient of recipients) {
    //   if (IS_DIRECT_USER_EMAIL) {
    //     await sendEmail(
    //       recipient.email_address,
    //       [],
    //       [],
    //       campaign.subject,
    //       "",
    //       campaign.htmlSnapshot.replaceAll(
    //         "{{UNSUBSCRIBE_URL}}",
    //         generateUnsubscribeUrl(
    //           recipient.subscriber_id,
    //           IS_DIRECT_USER_EMAIL,
    //         ),
    //       ),
    //     );
    //   } else {
    //     await sendEmail(
    //       recipient.email_address,
    //       [],
    //       [],
    //       campaign.subject,
    //       "",
    //       campaign.htmlSnapshot.replaceAll(
    //         "{{UNSUBSCRIBE_URL}}",
    //         generateUnsubscribeUrl(
    //           recipient.subscriber_id,
    //           IS_DIRECT_USER_EMAIL,
    //         ),
    //       ),
    //       [],
    //       {
    //         "List-Unsubscribe": `<${generateUnsubscribeUrl(recipient.subscriber_id, IS_DIRECT_USER_EMAIL)}>`,
    //         "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    //       },
    //     );
    //   }
    // }

    return NextResponse.json({
      success: true,
      message: "Queue processed successfully",
    });
  } catch (error) {
    console.error("Error processing broadcast queue:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
