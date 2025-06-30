import MailerLite from "@mailerlite/mailerlite-nodejs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const params = {
      name: "Alert on Unsubscribe",
      events: ["subscriber.unsubscribed", "subscriber.deleted"],
      url: "https://zealnews.africa/api/v1/newsletter/mailerlite/webhook/unsubscribe",
      batchable: true,
    };

    const mailerlite = new MailerLite({
      api_key: process.env.MAILERLITE_API_KEY as string,
    });

    await mailerlite.webhooks.create(params);

    return NextResponse.json({ message: "Webhook created successfully" });
  } catch (error) {
    console.log(`Error creating webhook: ${error}`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
