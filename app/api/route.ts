import { NextResponse } from "next/server";
import SubscriberModel from "@/database/subscriber/subscriber.model";
import { isMongooseDuplicateKeyError } from "@/utils/mongoose.utils";

export async function POST() {
  try {
    await SubscriberModel.create({
      email_address: "florenceidimone@gmail.com",
    });

    return NextResponse.json({
      message: `posts updated`,
    });
  } catch (err) {
    if (isMongooseDuplicateKeyError(err)) {
      return NextResponse.json({ message: "You're gonna make this right." });
    }

    return NextResponse.json({ err });
  }
}
