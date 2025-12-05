import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getCampaignById,
  updateCampaign,
} from "@/database/campaign/campaign.repository";
import { connectToDatabase, newId } from "@/lib/database";
import {
  CampaignTemplate,
  CampaignSegment,
  ICampaign,
} from "@/types/campaign.type";

// Schema for validating campaignId parameter
const CampaignIdSchema = z.string().min(1, "Campaign ID is required");

export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string } },
) {
  try {
    await connectToDatabase();

    // Validate campaignId parameter
    const { campaignId } = params;
    const validatedCampaignId = CampaignIdSchema.parse(campaignId);

    // Get campaign by ID using repository function
    const campaign = await getCampaignById(validatedCampaignId);

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    // Format campaign response
    const formattedCampaign = {
      id: campaign._id.toHexString(),
      internal_name: campaign.internal_name,
      subject: campaign.subject,
      preheader: campaign.preheader,
      template_id: campaign.template_id,
      segment: campaign.segment,
      articleIds: campaign.articleIds,
      body_content: campaign.body_content,
      htmlSnapshot: campaign.htmlSnapshot,
      dataSnapshot: campaign.dataSnapshot,
      status: campaign.status,
      lastProcessedId: campaign.lastProcessedId,
      started_at: campaign.started_at,
      completed_at: campaign.completed_at,
      stats: campaign.stats,
      created_at: campaign.created_at,
      updated_at: campaign.updated_at,
    };

    return NextResponse.json(formattedCampaign);
  } catch (error) {
    console.error("Get campaign by ID error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation Error", details: error.errors },
        { status: 422 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// Schema for validating PUT request body
const UpdateCampaignSchema = z.object({
  internal_name: z.string().min(1, "Internal name is required").optional(),
  subject: z.string().min(1, "Subject is required").optional(),
  preheader: z.string().optional(),
  template_id: z.enum(["custom", "standard"]).optional(),
  segment: z.string().optional(),
  article_ids: z.array(z.string()).optional(),
  body_content: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { campaignId: string } },
) {
  try {
    await connectToDatabase();

    // Validate campaignId parameter
    const { campaignId } = params;
    const validatedCampaignId = CampaignIdSchema.parse(campaignId);

    // Parse and validate request body
    const body = await request.json();
    const validatedBody = UpdateCampaignSchema.parse(body);

    // Check if campaign exists
    const existingCampaign = await getCampaignById(validatedCampaignId);
    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    // Prevent updates to campaigns that are already sending or completed
    if (
      existingCampaign.status === "sending" ||
      existingCampaign.status === "completed" ||
      existingCampaign.status === "failed"
    ) {
      return NextResponse.json(
        { error: "Cannot update campaign that is sending or completed" },
        { status: 400 },
      );
    }

    const { article_ids, ...rest } = validatedBody;
    const validatedBodyWithoutArticleIds = rest;

    // Prepare update data
    const updateData: Partial<ICampaign> = {
      id: validatedCampaignId,
      ...validatedBodyWithoutArticleIds,
    };

    // Convert string IDs to ObjectId for articleIds if present
    if (article_ids) {
      updateData.articleIds = article_ids.map((id) => newId(id));
    }

    // Update campaign using repository function
    const updatedCampaign = await updateCampaign(updateData);

    if (!updatedCampaign) {
      return NextResponse.json(
        { error: "Failed to update campaign" },
        { status: 500 },
      );
    }

    // Format campaign response
    const formattedCampaign = {
      id: updatedCampaign._id.toHexString(),
      internal_name: updatedCampaign.internal_name,
      subject: updatedCampaign.subject,
      preheader: updatedCampaign.preheader,
      template_id: updatedCampaign.template_id,
      segment: updatedCampaign.segment,
      articleIds: updatedCampaign.articleIds,
      body_content: updatedCampaign.body_content,
      htmlSnapshot: updatedCampaign.htmlSnapshot,
      dataSnapshot: updatedCampaign.dataSnapshot,
      status: updatedCampaign.status,
      lastProcessedId: updatedCampaign.lastProcessedId,
      started_at: updatedCampaign.started_at,
      completed_at: updatedCampaign.completed_at,
      stats: updatedCampaign.stats,
      created_at: updatedCampaign.created_at,
      updated_at: updatedCampaign.updated_at,
    };

    return NextResponse.json(formattedCampaign);
  } catch (error) {
    console.error("Update campaign error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation Error", details: error.errors },
        { status: 422 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200 });
}
