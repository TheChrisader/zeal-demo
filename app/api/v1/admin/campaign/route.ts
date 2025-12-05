import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import CampaignModel from "@/database/campaign/campaign.model";
import { connectToDatabase, newId } from "@/lib/database";
import {
  CampaignSegments,
  CampaignStatus,
  CampaignTemplates,
} from "@/types/campaign.type";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const query = searchParams.get("search") || "";
    const status = searchParams.get("status");

    // Validate status parameter
    const validStatuses: CampaignStatus[] = [
      "draft",
      "sending",
      "completed",
      "failed",
    ];
    const statusFilter =
      status && validStatuses.includes(status as CampaignStatus)
        ? [status as CampaignStatus]
        : undefined;

    // Build query filters
    const queryFilters: {
      $text?: { $search: string };
      status?: { $in: CampaignStatus[] };
    } = {};

    if (statusFilter) {
      queryFilters.status = { $in: statusFilter };
    }
    if (query) {
      queryFilters.$text = { $search: query };
    }

    // Get campaigns and total count in parallel
    const [campaigns, total] = await Promise.all([
      CampaignModel.find(queryFilters)
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CampaignModel.countDocuments(queryFilters),
    ]);

    // Format response campaigns
    const formattedCampaigns = campaigns.map((campaign) => ({
      id: campaign._id.toHexString(),
      subject: campaign.subject,
      status: campaign.status,
      stats: {
        sent: campaign.stats?.sent || 0,
      },
      created_at: campaign.created_at,
      started_at: campaign.started_at,
      completed_at: campaign.completed_at,
    }));

    // Get summary counts for all statuses
    const [draftCount, sendingCount, completedCount, failedCount] =
      await Promise.all([
        CampaignModel.countDocuments({ status: "draft" }),
        CampaignModel.countDocuments({ status: "sending" }),
        CampaignModel.countDocuments({ status: "completed" }),
        CampaignModel.countDocuments({ status: "failed" }),
      ]);

    return NextResponse.json({
      campaigns: formattedCampaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: {
        draft: draftCount,
        sending: sendingCount,
        completed: completedCount,
        failed: failedCount,
      },
    });
  } catch (error) {
    console.error("Campaigns GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// Campaign creation validation schema
const CreateCampaignSchema = z
  .object({
    internal_name: z
      .string()
      .min(1, "Internal name is required")
      .max(200, "Internal name too long"),
    subject: z
      .string()
      .min(1, "Subject is required")
      .max(200, "Subject too long"),
    preheader: z.string().max(500, "Preheader too long").optional(),
    template_id: z.enum(CampaignTemplates).default("standard"),
    segment: z.enum([...CampaignSegments]).default("ALL_NEWSLETTER"),
    article_ids: z.array(z.string()).optional(),
    body_content: z.string().max(50000, "Body content too long").optional(),
  })
  .refine(
    (data) => {
      if (data.template_id === "standard" && !data.article_ids?.length) {
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

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();

    // Validate request body
    const validatedData = CreateCampaignSchema.parse(body);

    // Create campaign
    const newCampaign = await CampaignModel.create({
      internal_name: validatedData.internal_name,
      subject: validatedData.subject,
      preheader: validatedData.preheader,
      template_id: validatedData.template_id,
      segment: validatedData.segment,
      articleIds: validatedData.article_ids,
      body_content: validatedData.body_content,
      status: "draft",
      stats: {
        sent: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
      },
    });

    // Populate article data if provided
    const populatedCampaign = await CampaignModel.findById(
      newCampaign._id,
    ).populate("articleIds", "title slug description category image_url");

    if (!populatedCampaign) {
      throw new Error("Failed to retrieve created campaign");
    }

    return NextResponse.json({
      campaign: {
        id: populatedCampaign._id.toHexString(),
        internal_name: populatedCampaign.internal_name,
        subject: populatedCampaign.subject,
        preheader: populatedCampaign.preheader,
        template_id: populatedCampaign.template_id,
        segment: populatedCampaign.segment,
        articleIds: populatedCampaign.articleIds,
        body_content: populatedCampaign.body_content,
        status: populatedCampaign.status,
        stats: populatedCampaign.stats,
        created_at: populatedCampaign.created_at,
      },
    });
  } catch (error) {
    console.error("Create campaign error:", error);

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

// Schema for validating DELETE request body with array of campaign IDs
const DeleteCampaignsSchema = z.object({
  campaign_ids: z.array(z.string()).min(1, "At least one campaign ID is required"),
});

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = DeleteCampaignsSchema.parse(body);

    // Convert string IDs to ObjectIds
    const campaignObjectIds = validatedData.campaign_ids.map(id => newId(id));

    // Check which campaigns exist and their current status
    const existingCampaigns = await CampaignModel.find({
      _id: { $in: campaignObjectIds },
    }).select("_id status");

    if (existingCampaigns.length === 0) {
      return NextResponse.json(
        { error: "No campaigns found with the provided IDs" },
        { status: 404 },
      );
    }

    // Find campaigns that are currently sending (cannot be deleted)
    const sendingCampaigns = existingCampaigns.filter(
      campaign => campaign.status === "sending"
    );

    if (sendingCampaigns.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete campaigns that are currently sending",
          sending_campaigns: sendingCampaigns.map(c => c._id.toHexString())
        },
        { status: 400 },
      );
    }

    // Delete campaigns from database
    const deleteResult = await CampaignModel.deleteMany({
      _id: { $in: campaignObjectIds },
      status: { $ne: "sending" } // Extra safety check
    });

    return NextResponse.json({
      message: "Campaigns deleted successfully",
      deleted_count: deleteResult.deletedCount,
      requested_count: validatedData.campaign_ids.length,
    });
  } catch (error) {
    console.error("Delete campaigns error:", error);

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
