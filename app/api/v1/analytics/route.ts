import { NextRequest, NextResponse } from "next/server";
import { updateAnalytics } from "@/database/analytics/analytics.repository";
import { connectToDatabase } from "@/lib/database";

export const POST = async (request: NextRequest) => {
  try {
    await connectToDatabase();
    const metrics = await request.json();

    if (!metrics) {
      return NextResponse.json({ message: "Body cannot be empty" });
    }

    const { userId, postId, ...data } = metrics;
    await updateAnalytics(userId, postId, data);

    return NextResponse.json({ message: "Analytics updated" });
  } catch (error) {
    console.log("Analytics API error: ", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
};
