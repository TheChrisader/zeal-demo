import { Id } from "@/lib/database";

import {
  CampaignStatus,
  ICampaign,
  ICampaignDataSnapshotMeta,
} from "@/types/campaign.type";

import CampaignModel from "./campaign.model";
import PostModel from "../post/post.model";

export type SortParams<C> = Partial<Record<keyof C, -1 | 1>>;

export type QueryOptions<C> = {
  sort?: SortParams<C>;
  skip?: number;
  limit?: number;
};

// create campaign
export const createCampaign = async (
  campaign: Partial<ICampaign>,
): Promise<ICampaign> => {
  try {
    const newCampaignDoc = await CampaignModel.create({
      ...campaign,
      status: campaign.status || "draft",
      stats: {
        sent: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
        ...campaign.stats,
      },
    });
    const createdCampaign = newCampaignDoc.toObject();
    return createdCampaign;
  } catch (error) {
    throw error;
  }
};

// update campaign
export const updateCampaign = async (
  campaign: Partial<ICampaign>,
): Promise<ICampaign | null> => {
  try {
    const updatedCampaignDoc = await CampaignModel.findByIdAndUpdate(
      campaign.id,
      { $set: { ...campaign } },
      {
        new: true,
        runValidators: true,
      },
    );
    const updatedCampaign = updatedCampaignDoc?.toObject() || null;
    return updatedCampaign;
  } catch (error) {
    throw error;
  }
};

// get campaign by id
export const getCampaignById = async (
  campaignId: string | Id,
): Promise<ICampaign | null> => {
  try {
    const campaignDoc = await CampaignModel.findById(campaignId)
      .populate(
        "articleIds",
        "title slug description image_url category published_at",
      )
      .populate("lastProcessedId", "email_address");
    const campaign = campaignDoc?.toObject() || null;
    return campaign;
  } catch (error) {
    throw error;
  }
};

// get campaign with full article data
export const getCampaignWithArticles = async (
  campaignId: string | Id,
): Promise<ICampaign | null> => {
  try {
    const campaignDoc = await CampaignModel.findById(campaignId)
      .populate("articleIds")
      .populate("lastProcessedId", "email_address");
    const campaign = campaignDoc?.toObject() || null;
    return campaign;
  } catch (error) {
    throw error;
  }
};

// delete campaign
export const deleteCampaignById = async (
  campaignId: string | Id,
): Promise<ICampaign | null> => {
  try {
    const deletedCampaignDoc =
      await CampaignModel.findByIdAndDelete(campaignId);
    const deletedCampaign = deletedCampaignDoc?.toObject() || null;
    return deletedCampaign;
  } catch (error) {
    throw error;
  }
};

// get all campaigns
export const getCampaigns = async (): Promise<ICampaign[]> => {
  try {
    const campaigns = await CampaignModel.find()
      .populate("articleIds", "title slug image_url")
      .sort({ created_at: -1 });
    return campaigns.map((campaign) => campaign.toObject());
  } catch (error) {
    throw error;
  }
};

// get campaigns by status
export const getCampaignsByStatus = async (
  status: CampaignStatus,
  options: QueryOptions<ICampaign> = {},
): Promise<ICampaign[]> => {
  try {
    const { sort = { created_at: -1 }, skip = 0, limit = 20 } = options;

    const campaigns = await CampaignModel.find({ status })
      .populate("articleIds", "title slug image_url")
      .sort(sort)
      .skip(skip)
      .limit(limit);
    return campaigns.map((campaign) => campaign.toObject());
  } catch (error) {
    throw error;
  }
};

// get campaigns with filters
export const getCampaignsByFilters = async (filters: {
  status?: CampaignStatus[];
  query?: string;
  template_id?: "custom" | "standard";
  segment?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  skip?: number;
  sort?: SortParams<ICampaign>;
}): Promise<ICampaign[]> => {
  try {
    const queryFilters: {
      status?: { $in: CampaignStatus[] };
      template_id?: "custom" | "standard";
      segment?: string;
      created_at?: { $gte?: Date; $lte?: Date };
      $text?: { $search: string };
    } = {};

    // Status filter
    if (filters.status && filters.status.length > 0) {
      queryFilters.status = { $in: filters.status };
    }

    // Template filter
    if (filters.template_id) {
      queryFilters.template_id = filters.template_id;
    }

    // Segment filter
    if (filters.segment) {
      queryFilters.segment = filters.segment;
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      queryFilters.created_at = {};
      if (filters.startDate) {
        queryFilters.created_at.$gte = filters.startDate;
      }
      if (filters.endDate) {
        queryFilters.created_at.$lte = filters.endDate;
      }
    }

    // Text search
    if (filters.query) {
      queryFilters.$text = { $search: filters.query };
    }

    const campaigns = await CampaignModel.find(queryFilters)
      .populate("articleIds", "title slug image_url")
      .sort(filters.sort || { created_at: -1 })
      .skip(filters.skip || 0)
      .limit(filters.limit || 20);

    return campaigns.map((campaign) => campaign.toObject());
  } catch (error) {
    throw error;
  }
};

// update campaign status
export const updateCampaignStatus = async (
  campaignId: string | Id,
  status: CampaignStatus,
  additionalData?: {
    started_at?: Date;
    completed_at?: Date;
    htmlSnapshot?: string;
    snapshotPlaintext?: string;
    dataSnapshot?: {
      articles?: Id[];
      body_content?: string;
      meta: ICampaignDataSnapshotMeta;
    };
  },
): Promise<ICampaign | null> => {
  try {
    const updateData: { status: CampaignStatus } = { status };

    if (additionalData) {
      Object.assign(updateData, additionalData);
    }

    const updatedCampaignDoc = await CampaignModel.findByIdAndUpdate(
      campaignId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      },
    );
    const updatedCampaign = updatedCampaignDoc?.toObject() || null;
    return updatedCampaign;
  } catch (error) {
    throw error;
  }
};

// update campaign stats
export const updateCampaignStats = async (
  campaignId: string | Id,
  stats: Partial<ICampaign["stats"]>,
): Promise<ICampaign | null> => {
  try {
    const updatedCampaignDoc = await CampaignModel.findByIdAndUpdate(
      campaignId,
      {
        $inc: stats, // Use $inc for incrementing numeric values
      },
      {
        new: true,
        runValidators: true,
      },
    );
    const updatedCampaign = updatedCampaignDoc?.toObject() || null;
    return updatedCampaign;
  } catch (error) {
    throw error;
  }
};

// get campaigns ready for sending (draft with appropriate content)
export const getCampaignsReadyForSending = async (): Promise<ICampaign[]> => {
  try {
    const campaigns = await CampaignModel.find({
      status: "draft",
      $or: [
        // Standard template with articles
        {
          template_id: "standard",
          articleIds: { $exists: true, $ne: [] },
        },
        // Custom template with body content
        {
          template_id: "custom",
          body_content: { $exists: true, $ne: "" },
        },
      ],
    })
      .populate("articleIds", "title slug description category image_url")
      .sort({ created_at: -1 });
    return campaigns.map((campaign) => campaign.toObject());
  } catch (error) {
    throw error;
  }
};

// get campaigns that are currently sending and need to be resumed
export const getCampaignToResume = async (): Promise<ICampaign | null> => {
  try {
    const campaign = await CampaignModel.findOne({
      status: "sending",
    }).sort({ started_at: 1 });

    return campaign?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

// generate campaign snapshot (when starting to send)
export const generateCampaignSnapshot = async (
  campaignId: string | Id,
): Promise<ICampaign | null> => {
  try {
    const campaign = await getCampaignWithArticles(campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Validate template-specific content requirements
    if (
      campaign.template_id === "standard" &&
      (!campaign.articleIds || campaign.articleIds.length === 0)
    ) {
      throw new Error("Standard template requires at least one article");
    }

    if (campaign.template_id === "custom" && !campaign.body_content?.trim()) {
      throw new Error("Custom template requires body content");
    }

    const meta: ICampaignDataSnapshotMeta = {
      subject: campaign.subject,
      preheader: campaign.preheader || "",
      unsubscribeUrl: "{{UNSUBSCRIBE_URL}}",
    };

    const dataSnapshot: {
      articles?: Id[];
      bodyContent?: string;
      meta: ICampaignDataSnapshotMeta;
    } = {
      meta,
    };

    if (campaign.template_id === "standard") {
      // Get the actual article documents for standard templates
      const articles = await PostModel.find({
        _id: { $in: campaign.articleIds },
      });
      if (articles.length === 0 || !articles[0]) {
        throw new Error("No articles found for this campaign");
      }

      const articles_ids = articles.map((article) => article.toObject()._id);
      dataSnapshot.articles = articles_ids;
    } else if (campaign.template_id === "custom") {
      // For custom templates, store the body content
      dataSnapshot.bodyContent = campaign.body_content;
    }

    const updatedCampaign = await updateCampaignStatus(campaignId, "sending", {
      dataSnapshot,
      started_at: new Date(),
    });

    return updatedCampaign;
  } catch (error) {
    throw error;
  }
};

// get campaign analytics
export const getCampaignAnalytics = async (campaignId: string | Id) => {
  try {
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const stats = campaign.stats;
    const totalSent = stats.sent;

    // Calculate rates
    const openRate = totalSent > 0 ? (stats.opened / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (stats.clicked / totalSent) * 100 : 0;
    const bounceRate = totalSent > 0 ? (stats.bounced / totalSent) * 100 : 0;
    const unsubscribeRate =
      totalSent > 0 ? (stats.unsubscribed / totalSent) * 100 : 0;

    return {
      ...stats,
      openRate: Math.round(openRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
      bounceRate: Math.round(bounceRate * 100) / 100,
      unsubscribeRate: Math.round(unsubscribeRate * 100) / 100,
      completionRate: campaign.status === "completed" ? 100 : 0,
    };
  } catch (error) {
    throw error;
  }
};

// get overall campaign summary
export const getCampaignSummary = async () => {
  try {
    const [
      totalCampaigns,
      draftCampaigns,
      sendingCampaigns,
      completedCampaigns,
      failedCampaigns,
    ] = await Promise.all([
      CampaignModel.countDocuments(),
      CampaignModel.countDocuments({ status: "draft" }),
      CampaignModel.countDocuments({ status: "sending" }),
      CampaignModel.countDocuments({ status: "completed" }),
      CampaignModel.countDocuments({ status: "failed" }),
    ]);

    return {
      total: totalCampaigns,
      draft: draftCampaigns,
      sending: sendingCampaigns,
      completed: completedCampaigns,
      failed: failedCampaigns,
    };
  } catch (error) {
    throw error;
  }
};
