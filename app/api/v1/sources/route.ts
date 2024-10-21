import lookup from "country-code-lookup";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import {
  NewsDataHTTPError,
  NewsDataProcessingError,
} from "@/lib/newsdata/utils/NewsDataClient";
import { buildError, sendError } from "@/utils/error";
import { INTERNAL_ERROR } from "@/utils/error/error-codes";

export const GET = async (req: NextRequest): Promise<NextResponse> => {
  try {
    await connectToDatabase();

    // get country from url params
    const url = new URL(req.url);
    const country = url.searchParams.get("country") || "Nigeria";

    const countryCode = lookup.byCountry(country)?.iso2;

    const sourcesUrl = `https://newsdata.io/api/1/sources?apikey=${process.env.NEWSDATA_API_KEY}&country=${countryCode}`;

    const newsSources = await fetch(sourcesUrl);
    const newsSourcesData = await newsSources.json();

    return NextResponse.json(newsSourcesData);
  } catch (error) {
    if (error instanceof NewsDataHTTPError) {
      return sendError(
        buildError({
          code: error.code,
          message: error.message,
          status: error.status,
          data: error,
        }),
      );
    }

    if (error instanceof NewsDataProcessingError) {
      return sendError(
        buildError({
          code: error.code,
          message: error.message,
          data: error,
        }),
      );
    }

    return sendError(
      buildError({
        code: INTERNAL_ERROR,
        message: error instanceof Error ? error.message : "An error occured.",
        status: 500,
        data: error,
      }),
    );
  }
};
