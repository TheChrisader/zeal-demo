import { NextRequest, NextResponse } from "next/server";
import { uploadImageToS3 } from "@/lib/bucket"; // Assuming this path, adjust if different
import { connectToDatabase } from "@/lib/database";
import {
  AUTHORIZED_IMAGE_MIME_TYPES,
  AUTHORIZED_IMAGE_SIZE,
} from "@/utils/file.utils"; // Assuming this path, adjust if different

export async function POST(request: NextRequest) {
  try {
    // 3. Get formData
    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error("Error parsing FormData:", error);
      return NextResponse.json(
        { message: "Invalid request body. Could not parse FormData." },
        { status: 400 },
      );
    }

    if (!formData || formData.entries().next().done) {
      return NextResponse.json(
        { message: "Post body cannot be empty" },
        { status: 400 },
      );
    }

    // 4. Connect to DB (optional for direct S3 upload, but good practice if logging/metadata is involved)
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error("Database connection failed:", dbError);
      // Depending on requirements, you might allow upload even if DB connection fails for logging
      // For now, let's consider it a critical failure if DB is intended for use with uploads.
      // return NextResponse.json({ error: "Database connection failed." }, { status: 500 });
    }

    // 5. Process file
    const file = formData.get("image") as (Blob & { name: string }) | null;
    let image_url: string | undefined = undefined;

    if (file) {
      if (!AUTHORIZED_IMAGE_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            message: `Wrong file format. Received: ${file.type}. Authorized: ${AUTHORIZED_IMAGE_MIME_TYPES.join(", ")}`,
          },
          { status: 422 },
        );
      }

      if (file.size > AUTHORIZED_IMAGE_SIZE) {
        return NextResponse.json(
          {
            message: `File too large. Max size: ${AUTHORIZED_IMAGE_SIZE / 1024 / 1024}MB.`,
          },
          { status: 422 },
        );
      }

      try {
        const photoKey = await uploadImageToS3(file, "uploads/images/"); // Using a generic path

        if (!photoKey) {
          return NextResponse.json(
            { error: "Failed to upload image to S3." },
            { status: 500 },
          );
        }

        if (!process.env.CLOUDFRONT_BASE_URL) {
          console.error("CLOUDFRONT_BASE_URL environment variable is not set.");
          return NextResponse.json(
            { error: "Image URL configuration error." },
            { status: 500 },
          );
        }
        image_url = `${process.env.CLOUDFRONT_BASE_URL}/${photoKey}`;
      } catch (uploadError) {
        console.error("Error during S3 upload:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload image due to an internal error." },
          { status: 500 },
        );
      }
    } else {
      return NextResponse.json(
        { message: "No image file provided in the 'image' field." },
        { status: 400 },
      );
    }

    if (!image_url) {
      // This case should ideally be caught by earlier checks
      return NextResponse.json(
        { error: "Image processing failed unexpectedly." },
        { status: 500 },
      );
    }

    return NextResponse.json({ src: image_url }, { status: 200 });
  } catch (error) {
    console.log(`Error uploading image: ${error}`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
