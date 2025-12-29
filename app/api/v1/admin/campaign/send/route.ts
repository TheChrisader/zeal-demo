import { render } from "@react-email/render";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import CampaignModel from "@/database/campaign/campaign.model";
import { connectToDatabase, Id, newId } from "@/lib/database";
import {
  CampaignSegments,
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
    segment: z.enum(CampaignSegments).default("ALL_SUBSCRIBERS"),
    article_ids: z.record(z.string(), z.array(z.string())).optional(),
    subject: z
      .string()
      .min(1, "Subject is required")
      .max(200, "Subject too long"),
    preheader: z.string().max(500, "Preheader too long").optional(),
    body_content: z.string().max(50000, "Body content too long").optional(),
  })
  .refine(
    (data) => {
      const totalObjectSize = Object.values(data?.article_ids || {}).flat()
        .length;
      if (data.template_id === "standard" && totalObjectSize <= 0) {
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

    let htmlSnapshot: string | undefined;
    let snapshotPlaintext: string | undefined;
    const dataSnapshot: IDataSnapshot = {
      meta: {
        subject,
        preheader: preheader || "",
        unsubscribeUrl: "{{UNSUBSCRIBE_URL}}",
      },
    };

    if (template_id === "standard") {
    } else {
      htmlSnapshot = await render(
        ZealCustomBroadcast(dataSnapshot as CustomDataSnapshot),
      );

      snapshotPlaintext = await render(
        ZealCustomBroadcast(dataSnapshot as CustomDataSnapshot),
        { plainText: true },
      );
    }

    // let campaignDataSnapshot = undefined;

    // if (Object.keys(dataSnapshot.articles || {}).length === 0) {
    //   campaignDataSnapshot = {
    //     meta: {
    //       subject,
    //       preheader,
    //       unsubscribeUrl: "{{UNSUBSCRIBE_URL}}",
    //     },
    //   } as ICampaignDataSnapshot;
    // } else {
    //   campaignDataSnapshot = {
    //     meta: {
    //       subject,
    //       preheader,
    //       unsubscribeUrl: "{{UNSUBSCRIBE_URL}}",
    //     },
    //   } as ICampaignDataSnapshot;
    // }

    // Save campaign with upsert logic
    const campaignData: Partial<ICampaign> = {
      internal_name,
      subject,
      preheader,
      template_id,
      segment,
      article_ids: Object.keys(article_ids || {}).reduce(
        (acc: Record<string, Id[]>, key: string) => {
          if (!article_ids || !article_ids[key]) return acc;
          acc[key] = article_ids[key].map((id) => newId(id));
          return acc;
        },
        {},
      ),
      body_content,
      htmlSnapshot,
      snapshotPlaintext,
      dataSnapshot,
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
