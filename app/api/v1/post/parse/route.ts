import { NextRequest, NextResponse } from "next/server";
import { fetchAndParseURL } from "@/lib/parser";

export const POST = async (request: NextRequest) => {
  try {
    const { url } = await request.json();

    const article = await fetchAndParseURL(url);

    if (!article) {
      return NextResponse.json({ message: "The article could not be parsed." });
    }

    return new Response(JSON.stringify(article), {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({ message: "The article could not be parsed." });
  }
};

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
  });
}
