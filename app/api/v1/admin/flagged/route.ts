import { NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import { connectToDatabase } from "@/lib/database";

export const GET = async () => {
  try {
    await connectToDatabase();

    const flaggedPosts = await PostModel.aggregate([
      {
        $match: {
          status: "flagged",
        },
      },
      {
        $sort: {
          created_at: -1,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          created_at: 1,
        },
      },
      {
        $lookup: {
          from: "reports",
          localField: "_id",
          foreignField: "post",
          pipeline: [
            {
              $project: {
                _id: 1,
                created_at: 1,
                reason: 1,
                description: 1,
              },
            },
          ],
          as: "reports",
        },
      },
      {
        $addFields: {
          reportsCount: {
            $size: "$reports",
          },
        },
      },
      //   {
      //     $merge: {
      //       into: "posts",
      //       on: "_id",
      //       whenMatched: "merge",
      //       // whenNotMatched: "discard",
      //     },
      //   },
    ]);

    return NextResponse.json(flaggedPosts);
  } catch (error) {
    console.log(`Flagged API error: ${error}`);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 },
    );
  }
};
