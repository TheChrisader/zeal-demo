import { render } from "@react-email/render";
import Bottleneck from "bottleneck";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { MailOptions } from "@/lib/mailer";
import { CampaignSegments, CampaignTemplates } from "@/types/campaign.type";
import { StandardDataSnapshot } from "@/types/newsletter.type";
import { sendEmail } from "@/utils/email";
import ZealNewsletterCampaign from "@/utils/email/templates/NewsletterCampaign";
import {
  prepareCampaignView,
  selectPostIdsFromCategories,
} from "@/utils/newsletter.utils";

const CampaignSaveRequestSchema = z
  .object({
    internal_name: z
      .string()
      .min(1, "Internal name is required")
      .max(200, "Internal name too long")
      .trim(),
    subject: z
      .string()
      .min(1, "Subject is required")
      .max(200, "Subject too long")
      .trim(),
    preheader: z.string().max(500, "Preheader too long").optional(),
    template_id: z.enum(CampaignTemplates).default("standard"),
    segment: z.enum(CampaignSegments).default("ALL_SUBSCRIBERS"),
    article_ids: z.record(z.string(), z.array(z.string())).optional(),
    body_content: z.string().max(50000, "Body content too long").optional(),
  })
  .refine(
    (data) => {
      // const totalObjectSize = Object.values(data?.article_ids || {}).flat()
      //   .length;
      if (data.template_id === "standard" && data.body_content) {
        return false;
      }
      if (
        data.template_id === "custom" &&
        !data.body_content?.trim() &&
        data.article_ids
      ) {
        return false;
      }
      if (data.template_id === "standard" && data.segment === "ALL_USERS") {
        return false;
      }
      if (
        data.template_id === "custom" &&
        !["ALL_USERS", "ALL_SUBSCRIBERS"].includes(data.segment)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Template-specific content requirements not met",
      path: ["template_id"],
    },
  );

type MockSubscriber = {
  subscriber_id: string;
  email_address: string;
  subscriptions: string[];
};

const generateUnsubscribeUrl = (id: string) => {
  return `https://zealnews.africa/api/v1/newsletter/unsubscribe/${id}`;
};

// Mock test subscriber collections
const MOCK_SUBSCRIBERS: Record<string, MockSubscriber[]> = {
  base: [
    {
      subscriber_id: "507f1f77bcf86cd799439011-test",
      email_address: "chris1bobsy@gmail.com",
      subscriptions: ["Technology", "AI", "Fintech"],
    },
    {
      subscriber_id: "507f1f77bcf86cd799439012-test",
      email_address: "ikeochristopher99@gmail.com",
      subscriptions: ["Business", "Startup", "Economy/Finance"],
    },
    {
      subscriber_id: "507f1f77bcf86cd799439013-test",
      email_address: "mark.odigie@techmall.com.ng",
      subscriptions: ["Movies", "AI", "Global", "Local"],
    },
    {
      subscriber_id: "507f1f77bcf86cd799439014-test",
      email_address: "mark.odigie@techmall.com.ng",
      subscriptions: ["Movies", "AI", "Global", "Local"],
    },
  ],
  super: [
    {
      subscriber_id: "507f1f77bcf86cd799439010-test",
      email_address: "chris1bobsy@gmail.com",
      subscriptions: ["Global", "AI", "Fintech", "Business", "Startup"],
    },
  ],
};

export const POST = async (req: NextRequest) => {
  try {
    // Get collection from query param (default: "base")
    const { searchParams } = new URL(req.url);
    const collection = searchParams.get("collection") || "base";

    // Validate collection exists
    if (!MOCK_SUBSCRIBERS[collection]) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid collection: "${collection}". Use "base" or "super".`,
        },
        { status: 400 },
      );
    }

    // Validate request body
    const body = await req.json();
    const validatedData = CampaignSaveRequestSchema.parse(body);

    // Additional validation: standard template requires article_ids
    if (
      validatedData.template_id === "standard" &&
      (!validatedData.article_ids ||
        Object.keys(validatedData.article_ids).length === 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Standard template requires at least one article_id",
        },
        { status: 400 },
      );
    }

    const recipients = MOCK_SUBSCRIBERS[collection];

    // Rate limiter for sending emails
    const limiter = new Bottleneck({
      maxConcurrent: 1,
      minTime: 100,
    });

    const htmlSnapshotMap: Record<string, string> = {};
    const snapshotPlaintextMap: Record<string, string> = {};

    const tasks = recipients.map(async (recipient) => {
      let htmlSnapshot: string;
      let snapshotPlaintext: string;

      if (
        validatedData.template_id === "standard" &&
        validatedData.article_ids
      ) {
        const recipientsSubList = recipient.subscriptions.sort().join(",");

        if (
          htmlSnapshotMap[recipientsSubList] &&
          snapshotPlaintextMap[recipientsSubList]
        ) {
          htmlSnapshot = htmlSnapshotMap[recipientsSubList];
          snapshotPlaintext = snapshotPlaintextMap[recipientsSubList];
        } else {
          // Personalize content based on subscriber's subscriptions
          const article_ids = selectPostIdsFromCategories(
            recipient.subscriptions,
            validatedData.article_ids,
          );

          const { articles } = await prepareCampaignView(
            article_ids || {},
            true,
            "test-campaign",
          );

          const dataSnapshot = {
            articles,
            meta: {
              subject: validatedData.subject,
              preheader: validatedData.preheader || "",
              unsubscribeUrl: "{{UNSUBSCRIBE_URL}}",
            },
          };

          htmlSnapshot = await render(
            ZealNewsletterCampaign(dataSnapshot as StandardDataSnapshot),
          );

          snapshotPlaintext = await render(
            ZealNewsletterCampaign(dataSnapshot as StandardDataSnapshot),
            { plainText: true },
          );
        }
      } else {
        // Custom template - use body_content directly
        htmlSnapshot = validatedData.body_content || "";
        snapshotPlaintext = "";
      }

      const unsubscribeUrl = generateUnsubscribeUrl(recipient.subscriber_id);

      const subscriberMail = htmlSnapshot.replaceAll(
        "{{UNSUBSCRIBE_URL}}",
        unsubscribeUrl,
      );

      const plaintext =
        snapshotPlaintext?.replaceAll("{{UNSUBSCRIBE_URL}}", unsubscribeUrl) ||
        "";

      const headers: MailOptions["headers"] = {
        "X-SES-MESSAGE-TAGS":
          `test-campaign=${validatedData.internal_name},subscriber=${recipient.subscriber_id}`.trim(),
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      };

      return limiter.schedule(async () => {
        await sendEmail(
          recipient.email_address,
          [],
          [],
          validatedData.subject,
          plaintext,
          subscriberMail,
          [],
          headers,
          "newsletter",
        );
      });
    });

    const results = await Promise.allSettled(tasks);

    // const sentCount = results.filter((r) => r.status === "fulfilled").length;
    const errorCount = results.filter((r) => r.status === "rejected").length;

    // Optional: Log errors for debugging
    if (errorCount > 0) {
      console.error(`${errorCount} emails failed to send in this batch.`);
      const errors = results
        .map((r, i) => ({
          recipient: recipients[i]?.email_address,
          status: r.status,
          reason: r.status === "rejected" ? r.reason : undefined,
        }))
        .filter((e) => e.status === "rejected");
      console.error("Failed recipients:", errors);
    }

    return NextResponse.json({
      success: true,
      message: "Test campaign sent",
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input",
          errors: error.errors,
        },
        { status: 422 },
      );
    }

    console.error("Error sending test campaign:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
};
