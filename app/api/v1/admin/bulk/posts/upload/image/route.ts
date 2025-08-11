import { NextRequest, NextResponse } from "next/server";
import { uploadImageToS3 } from "@/lib/bucket"; // Assuming this path, adjust if different
import { connectToDatabase } from "@/lib/database";
import {
  AUTHORIZED_IMAGE_MIME_TYPES,
  AUTHORIZED_IMAGE_SIZE,
  ImageValidationError,
  validateAndUploadImage,
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
      try {
        const key = await validateAndUploadImage(file, "posts/");
        image_url = `${process.env.CLOUDFRONT_BASE_URL}/${key}`;
      } catch (error) {
        console.error(`Error uploading image: ${error}`);
        if (error instanceof ImageValidationError) {
          return NextResponse.json(
            { message: error.message },
            { status: error.status },
          );
        }
        return NextResponse.json(
          { message: "Error uploading image" },
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
