import { NextRequest, NextResponse } from "next/server";
import Categories from "@/categories";
import InstallModel from "@/database/install/install.model";
import PostModel from "@/database/post/post.model";
import UserModel from "@/database/user/user.model";
import { flattenCategories } from "@/utils/category.utils";
// import { PwaInstall } from '@/models/PwaInstall';
// import { FlaggedContent } from '@/models/FlaggedContent';

type TimeRange = "24h" | "6d" | "30d" | "90d";
type TimeConfig = {
  intervalHours: number;
  totalIntervals: number;
};

const TIME_CONFIGS: Record<TimeRange, TimeConfig> = {
  "24h": { intervalHours: 4, totalIntervals: 6 },
  "6d": { intervalHours: 24, totalIntervals: 6 },
  "30d": { intervalHours: 120, totalIntervals: 6 }, // 5 days
  "90d": { intervalHours: 360, totalIntervals: 6 }, // 15 days
};

// const CATEGORIES = ["Technology", "Science", "Arts", "Business", "Lifestyle"];
const CATEGORIES = flattenCategories(Categories)
  .filter((c) => c !== "For you")
  .map((cat) => [cat]);
const ROLES = ["user", "admin", "writer"];
const EVENT_TYPES = ["prompt_accepted", "prompt_shown", "prompt_dismissed"];

export async function GET(request: NextRequest) {
  try {
    const timeRange = request.nextUrl.searchParams.get(
      "timeRange",
    ) as TimeRange;

    if (!timeRange || !TIME_CONFIGS[timeRange]) {
      return NextResponse.json(
        { error: "Invalid time range" },
        {
          status: 400,
        },
      );
    }

    const { intervalHours, totalIntervals } = TIME_CONFIGS[timeRange];

    const now = new Date();

    const intervals = Array.from({ length: totalIntervals }, (_, i) => {
      const end = new Date(now.getTime() - i * intervalHours * 3600 * 1000);
      const start = new Date(end.getTime() - intervalHours * 3600 * 1000);

      return { start, end };
    }).reverse();

    const [
      userStats,
      postStats,
      //   flaggedStats,
      pwaStats,
      roleDistribution,
      categoryDistribution,
      installEventDistribution,
    ] = await Promise.all([
      // Total users over time
      UserModel.aggregate([
        {
          $match: {
            created_at: { $gte: intervals[0]!.start },
          },
        },
        {
          $bucket: {
            groupBy: "$created_at",
            boundaries: [intervals[0]?.start, ...intervals.map((i) => i.end)],
            default: "older",
            output: {
              count: { $sum: 1 },
            },
          },
        },
      ]),

      // Total posts over time
      PostModel.aggregate([
        {
          $match: {
            created_at: {
              $gte: intervals[0]!.start,
            },
          },
        },
        {
          $bucket: {
            groupBy: "$created_at",
            boundaries: [intervals[0]?.start, ...intervals.map((i) => i.end)],
            default: "older",
            output: {
              count: { $sum: 1 },
            },
          },
        },
      ]),

      // Flagged content over time
      //   FlaggedContent.aggregate([
      //     {
      //       $match: {
      //         flaggedAt: { $gte: intervals[0].start }
      //       }
      //     },
      //     {
      //       $bucket: {
      //         groupBy: '$flaggedAt',
      //         boundaries: intervals.map(i => i.start),
      //         default: 'older',
      //         output: {
      //           count: { $sum: 1 }
      //         }
      //       }
      //     }
      //   ]),

      // PWA installs over time
      InstallModel.aggregate([
        {
          $match: {
            eventType: "prompt_accepted",
            created_at: { $gte: intervals[0]!.start },
          },
        },
        {
          $bucket: {
            groupBy: "$created_at",
            boundaries: [intervals[0]?.start, ...intervals.map((i) => i.end)],
            default: "older",
            output: {
              count: { $sum: 1 },
            },
          },
        },
      ]),

      // Role distribution
      UserModel.aggregate([
        {
          $match: {
            role: { $in: ROLES },
          },
        },
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ]),

      // Category distribution
      PostModel.aggregate([
        {
          $match: {
            category: { $in: CATEGORIES },
            created_at: {
              $gte: intervals[0]!.start,
              $lte: intervals[intervals.length - 1]!.end,
            },
          },
        },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
      ]),

      InstallModel.aggregate([
        {
          $match: {
            eventType: { $in: EVENT_TYPES },
            created_at: {
              $gte: intervals[0]!.start,
              $lte: intervals[intervals.length - 1]!.end,
            },
          },
        },
        {
          $group: {
            _id: "$eventType",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Format time series data
    const formatTimeSeries = (data: typeof postStats | typeof userStats) => {
      if (data[0]?._id === "older") {
        data.shift();
      }
      return intervals.map((interval) => ({
        start: interval.start,
        end: interval.end,
        count:
          data.find(
            (d) => d?._id.toISOString() === interval?.start?.toISOString(),
          )?.count || 0,
      }));
    };

    // Format distribution data
    const formatDistribution = (
      data:
        | typeof roleDistribution
        | typeof categoryDistribution
        | typeof installEventDistribution,
      categories: string[] | string[][],
    ) => {
      return categories.map((category) => ({
        category: typeof category === "object" ? category[0] : category,
        count:
          data.find((d) =>
            typeof d._id === "string"
              ? d._id === category
              : d._id[0] === category[0],
          )?.count || 0,
      }));
    };

    return new Response(
      JSON.stringify({
        users: {
          timeSeries: formatTimeSeries(userStats),
          total: userStats.reduce((acc, curr) => acc + curr.count, 0),
        },
        posts: {
          timeSeries: formatTimeSeries(postStats),
          total: postStats.reduce((acc, curr) => acc + curr.count, 0),
        },
        //   flaggedContent: {
        //     timeSeries: formatTimeSeries(flaggedStats),
        //     total: flaggedStats.reduce((acc, curr) => acc + curr.count, 0)
        //   },
        pwaInstalls: {
          timeSeries: formatTimeSeries(pwaStats),
          total: pwaStats.reduce((acc, curr) => acc + curr.count, 0),
        },
        roleDistribution: formatDistribution(roleDistribution, ROLES),
        categoryDistribution: formatDistribution(
          categoryDistribution,
          CATEGORIES,
        ),
        installEventDistribution: formatDistribution(
          installEventDistribution,
          EVENT_TYPES,
        ),
        intervals: intervals.map((interval) => interval.end),
      }),
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Analytics API Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
  });
}
