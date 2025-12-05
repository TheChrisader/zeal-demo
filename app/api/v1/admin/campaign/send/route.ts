import { render } from "@react-email/render";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import CampaignModel from "@/database/campaign/campaign.model";
import { connectToDatabase, newId } from "@/lib/database";
import {
  CampaignTemplates,
  ICampaign,
  ICampaignDataSnapshot,
} from "@/types/campaign.type";
import {
  CustomDataSnapshot,
  IDataSnapshot,
  StandardDataSnapshot,
} from "@/types/newsletter.type";
import { ZealCustomBroadcast } from "@/utils/email/templates/CustomBroadcast";
import ZealNewsletterCampaign from "@/utils/email/templates/NewsletterCampaign";
import { prepareCampaignView } from "@/utils/newsletter.utils";

const CampaignSendRequestSchema = z
  .object({
    campaign_id: z.string().min(1, "Campaign ID is required"),
    internal_name: z
      .string()
      .min(1, "Internal name is required")
      .max(200, "Internal name too long"),
    template_id: z.enum(CampaignTemplates).default("standard"),
    segment: z.string().default("ALL_NEWSLETTER"),
    article_ids: z.array(z.string()).optional(),
    subject: z
      .string()
      .min(1, "Subject is required")
      .max(200, "Subject too long"),
    preheader: z.string().max(500, "Preheader too long").optional(),
    body_content: z.string().max(50000, "Body content too long").optional(),
  })
  .refine(
    (data) => {
      if (
        data.template_id === "standard" &&
        (!data.article_ids || data.article_ids.length === 0)
      ) {
        return false;
      }
      if (data.template_id === "custom" && !data.body_content?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: "Template-specific content requirements not met",
      path: ["template_id"],
    },
  );

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const {
      campaign_id,
      internal_name,
      template_id,
      segment,
      article_ids,
      subject,
      preheader,
      body_content,
    } = CampaignSendRequestSchema.parse(body);
    await connectToDatabase();

    let htmlSnapshot: string;
    let dataSnapshot: IDataSnapshot;

    if (template_id === "standard") {
      // Standard template with articles
      const { articles } = await prepareCampaignView(
        article_ids || [],
        true,
        campaign_id,
      );

      dataSnapshot = {
        articles: articles,
        meta: {
          subject,
          preheader,
          unsubscribeUrl: "{{UNSUBSCRIBE_URL}}",
        },
      };

      htmlSnapshot = await render(
        ZealNewsletterCampaign(dataSnapshot as StandardDataSnapshot),
      );
    } else {
      // Custom template with body content
      dataSnapshot = {
        bodyContent: body_content || "",
        meta: {
          subject,
          preheader,
          unsubscribeUrl: "{{UNSUBSCRIBE_URL}}",
        },
      };

      htmlSnapshot = await render(
        ZealCustomBroadcast(dataSnapshot as CustomDataSnapshot),
      );
    }

    let campaignDataSnapshot = undefined;

    if (dataSnapshot.articles?.length === 0) {
      campaignDataSnapshot = {
        articles: article_ids?.map((id) => newId(id)),
        meta: {
          subject,
          preheader,
          unsubscribeUrl: "{{UNSUBSCRIBE_URL}}",
        },
      } as ICampaignDataSnapshot;
    } else {
      campaignDataSnapshot = {
        bodyContent: body_content || "",
        meta: {
          subject,
          preheader,
          unsubscribeUrl: "{{UNSUBSCRIBE_URL}}",
        },
      } as ICampaignDataSnapshot;
    }

    // Save campaign with upsert logic
    const campaignData: Partial<ICampaign> = {
      internal_name,
      subject,
      preheader,
      template_id,
      segment,
      articleIds: article_ids?.map((id) => newId(id)),
      body_content,
      htmlSnapshot,
      dataSnapshot: campaignDataSnapshot,
      status: "sending", // Set initial status
      started_at: new Date(), // Set started timestamp
    };

    await CampaignModel.findByIdAndUpdate(
      campaign_id,
      { $set: campaignData },
      {
        new: true,
        runValidators: true,
        upsert: true, // Create if doesn't exist
      },
    );

    return NextResponse.json({
      htmlSnapshot,
      template_id,
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      console.log(error);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input",
          errors: error.errors,
        },
        { status: 422 },
      );
    }
    console.error("Error generating campaign snapshot:", error);
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
