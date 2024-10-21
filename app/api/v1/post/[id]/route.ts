import { NextRequest, NextResponse } from "next/server";
import {
  NewsDataAPiClient,
  NewsDataHTTPError,
  NewsDataProcessingError,
} from "@/lib/newsdata/utils/NewsDataClient";
import { fetchAndParseURL } from "@/lib/parser";
import { buildError, sendError } from "@/utils/error";
import { INTERNAL_ERROR } from "@/utils/error/error-codes";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    const newsFetcher = new NewsDataAPiClient(process.env.NEWSDATA_API_KEY!);
    const article_id = params.id;

    const externalSingularPost =
      await newsFetcher.fetchSingularArticle(article_id);

    if (!externalSingularPost) {
      return sendError(
        buildError({
          code: INTERNAL_ERROR,
          message: "TODO.",
          status: 500,
          data: null,
        }),
      );
    }

    const parsedArticle = await fetchAndParseURL(
      externalSingularPost.results[0].link,
    );

    return NextResponse.json(parsedArticle);
  } catch (error: unknown) {
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
