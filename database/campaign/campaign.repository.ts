import { Id } from "@/lib/database";

import {
  CampaignStatus,
  ICampaign,
  ICampaignDataSnapshot,
  ICampaignDataSnapshotMeta,
  ICampaignStats,
} from "@/types/campaign.type";
import { IPost } from "@/types/post.type";

import CampaignModel from "./campaign.model";
import PostModel from "../post/post.model";

export type SortParams<C> = Partial<Record<keyof C, -1 | 1>>;

export type QueryOptions<C> = {
  sort?: SortParams<C>;
  skip?: number;
  limit?: number;
};

// Type for article_ids populated with full post data
export type PopulatedArticleIds = Record<string, IPost[]>;

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
        complained: 0,
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
  statsToIncrement?: Partial<ICampaignStats>,
): Promise<ICampaign | null> => {
  // Validate required field
  if (!campaign.id) {
    throw new Error("Campaign ID is required for update");
  }

  // Prevent stats conflict
  if (campaign.stats && statsToIncrement) {
    throw new Error(
      "Cannot provide both campaign.stats and statsToIncrement - use one approach",
    );
  }

  const incrementQuery: {
    [key: string]: number;
  } = {};

  if (statsToIncrement?.sent) {
    incrementQuery["stats.sent"] = statsToIncrement.sent;
  }
  if (statsToIncrement?.opened) {
    incrementQuery["stats.opened"] = statsToIncrement.opened;
  }
  if (statsToIncrement?.clicked) {
    incrementQuery["stats.clicked"] = statsToIncrement.clicked;
  }
  if (statsToIncrement?.bounced) {
    incrementQuery["stats.bounced"] = statsToIncrement.bounced;
  }
  if (statsToIncrement?.unsubscribed) {
    incrementQuery["stats.unsubscribed"] = statsToIncrement.unsubscribed;
  }
  if (statsToIncrement?.complained) {
    incrementQuery["stats.complained"] = statsToIncrement.complained;
  }

  try {
    // Extract id for query, stats for separate handling, and rest for $set
    const { id, stats, ...campaignData } = campaign;

    const updateQuery: {
      $set: Partial<ICampaign>;
      $inc?: {
        [key: string]: number;
      };
    } = {
      $set: campaignData,
    };

    // Add increment only if there are fields to increment
    if (Object.keys(incrementQuery).length > 0) {
      updateQuery.$inc = incrementQuery;
    }

    // Handle campaign.stats if provided (and no increment)
    if (stats && !statsToIncrement) {
      updateQuery.$set.stats = stats;
    }

    const updatedCampaignDoc = await CampaignModel.findByIdAndUpdate(
      id,
      updateQuery,
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

// Helper function to populate articles for a campaign
const populateArticlesForCampaign = async (
  campaign: ICampaign,
  selectFields?: string,
): Promise<void> => {
  if (campaign.article_ids) {
    const populatedArticleIds: PopulatedArticleIds = {};

    for (const [category, articleIds] of Object.entries(campaign.article_ids)) {
      const query = PostModel.find({
        _id: { $in: articleIds },
      });

      if (selectFields) {
        query.select(selectFields);
      }

      const articles = await query;
      populatedArticleIds[category] = articles.map((article) =>
        article.toObject(),
      );
    }

    (campaign.article_ids as unknown) = populatedArticleIds;
  }
};

// get campaign by id
export const getCampaignById = async (
  campaignId: string | Id,
): Promise<ICampaign | null> => {
  try {
    const campaignDoc = await CampaignModel.findById(campaignId).populate(
      "lastProcessedId",
      "email_address",
    );
    const campaign = campaignDoc?.toObject() || null;

    // Populate articles for each category
    if (campaign?.article_ids) {
      await populateArticlesForCampaign(
        campaign,
        "title slug description image_url category published_at",
      );
    }

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
    const campaignDoc = await CampaignModel.findById(campaignId).populate(
      "lastProcessedId",
      "email_address",
    );
    const campaign = campaignDoc?.toObject() || null;

    // Populate articles for each category
    if (campaign?.article_ids) {
      await populateArticlesForCampaign(campaign);
    }

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
    const campaigns = await CampaignModel.find().sort({ created_at: -1 });
    const campaignsObj = campaigns.map((campaign) => campaign.toObject());

    // Populate articles for each campaign
    for (const campaign of campaignsObj) {
      if (campaign.article_ids) {
        await populateArticlesForCampaign(campaign, "title slug image_url");
      }
    }

    return campaignsObj;
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
      .sort(sort)
      .skip(skip)
      .limit(limit);
    const campaignsObj = campaigns.map((campaign) => campaign.toObject());

    // Populate articles for each campaign
    for (const campaign of campaignsObj) {
      if (campaign.article_ids) {
        await populateArticlesForCampaign(campaign, "title slug image_url");
      }
    }

    return campaignsObj;
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
      .sort(filters.sort || { created_at: -1 })
      .skip(filters.skip || 0)
      .limit(filters.limit || 20);
    const campaignsObj = campaigns.map((campaign) => campaign.toObject());

    // Populate articles for each campaign
    for (const campaign of campaignsObj) {
      if (campaign.article_ids) {
        await populateArticlesForCampaign(campaign, "title slug image_url");
      }
    }

    return campaignsObj;
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
    dataSnapshot?: ICampaignDataSnapshot;
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
          article_ids: { $exists: true, $ne: null },
        },
        // Custom template with body content
        {
          template_id: "custom",
          body_content: { $exists: true, $ne: "" },
        },
      ],
    }).sort({ created_at: -1 });
    const campaignsObj = campaigns.map((campaign) => campaign.toObject());

    // Filter out campaigns with empty article_ids and populate articles
    const result: ICampaign[] = [];
    for (const campaign of campaignsObj) {
      // Skip standard templates with empty article_ids
      if (
        campaign.template_id === "standard" &&
        (!campaign.article_ids || Object.keys(campaign.article_ids).length === 0)
      ) {
        continue;
      }

      if (campaign.article_ids) {
        await populateArticlesForCampaign(
          campaign,
          "title slug description category image_url",
        );
      }

      result.push(campaign);
    }

    return result;
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
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Validate template-specific content requirements
    if (
      campaign.template_id === "standard" &&
      (!campaign.article_ids || Object.keys(campaign.article_ids).length === 0)
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

    const dataSnapshot = {
      meta,
    };

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
