import { NextRequest, NextResponse } from "next/server";
import HistoryModel from "@/database/history/history.model";

export const GET = async () => {
  try {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const todayEvent = await HistoryModel.find({ date: `${month}/${day}` });

    return NextResponse.json(todayEvent);
  } catch (error) {
    console.error("Error getting today's event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const url = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/selected/${month}/${day}`;

    const response = await fetch(url, {
      headers: {
        Authorization: process.env.WIKIMEDIA_ACCESS_TOKEN as string,
        "Api-User-Agent": process.env.WIKIMEDIA_USER_AGENT as string,
      },
    });

    const data = await response.json();

    const events = [];

    for (const item of data.selected) {
      events.push(
        await HistoryModel.create({
          date: `${month}/${day}`,
          year: item.year,
          event: item.text,
        }),
      );
    }

    // const event = await HistoryModel.create({
    //   date: `${month}/${day}`,
    //   year: data.selected[0].year,
    //   event: data.selected[0].text,
    // });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error creating today's event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};
