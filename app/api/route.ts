import { NextResponse } from "next/server";

export async function POST() {
  try {
    return NextResponse.json({
      message: `posts updated`,
    });
  } catch (err) {
    // if (isMongooseDuplicateKeyError(err)) {
    //   return NextResponse.json({ message: "You're gonna make this right." });
    // }

    return NextResponse.json({ err });
  }
}
