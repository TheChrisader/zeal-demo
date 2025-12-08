import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { createCampaign } from "@/database/campaign/campaign.repository";
import { connectToDatabase, newId } from "@/lib/database";
import { CampaignSegments, CampaignTemplates } from "@/types/campaign.type";

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
    article_ids: z.array(z.string()).optional(),
    body_content: z.string().max(50000, "Body content too long").optional(),
  })
  .refine(
    (data) => {
      if (
        data.template_id === "standard" &&
        (!data.article_ids || data.article_ids.length === 0) &&
        data.body_content
      ) {
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

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validatedData = CampaignSaveRequestSchema.parse(body);

    await connectToDatabase();

    // Prepare campaign data
    const campaignData = {
      internal_name: validatedData.internal_name,
      subject: validatedData.subject,
      preheader: validatedData.preheader,
      template_id: validatedData.template_id,
      segment: validatedData.segment,
      articleIds:
        validatedData.template_id === "standard"
          ? validatedData.article_ids?.map((id) => newId(id))
          : undefined,
      body_content:
        validatedData.template_id === "custom"
          ? validatedData.body_content
          : undefined,
    };

    // Use the repository function to create the campaign
    const campaign = await createCampaign(campaignData);

    return NextResponse.json({
      success: true,
      message: "Campaign saved successfully",
      id: campaign._id,
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

    // Handle duplicate key errors (e.g., duplicate internal_name)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Campaign with this internal name already exists",
        },
        { status: 409 },
      );
    }

    console.error("Error saving campaign:", error);
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
