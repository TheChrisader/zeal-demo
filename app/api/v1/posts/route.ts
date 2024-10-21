import { NextRequest, NextResponse } from "next/server";
import {
  NewsDataAPiClient,
  NewsDataHTTPError,
  NewsDataProcessingError,
} from "@/lib/newsdata/utils/NewsDataClient";
import { buildError, sendError } from "@/utils/error";
import { INTERNAL_ERROR } from "@/utils/error/error-codes";
import { FetchPostsResponse } from "@/hooks/post/useFetchPosts";

export const GET = async (request: NextRequest) => {
  try {
    const newsFetcher = new NewsDataAPiClient(process.env.NEWSDATA_API_KEY!);

    const options = newsFetcher.parseURL(request.url);
    const externalPostData = await newsFetcher.fetchLatestNews(options);

    if (!externalPostData) {
      return sendError(
        buildError({
          code: INTERNAL_ERROR,
          message: "An error occured.",
          status: 500,
          data: null,
        }),
      );
    }

    const response: FetchPostsResponse = {
      posts: externalPostData.results.map(
        (post: (typeof externalPostData.results)[number]) => {
          const source = {
            id: post.source_id,
            url: post.source_url,
            icon: post.source_icon,
            name: post.source_name,
            priority: post.source_priority,
          };

          post.source = source;
          post.id = post.article_id;
          post.published_at = post.pubDate as string;
          return post;
        },
      ),
      next_cursor: externalPostData.nextPage,
      previous_cursor: null,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof NewsDataHTTPError) {
      return sendError(
        buildError({
          code: error.code,
          message: error.message,
          status: error.status,
        }),
      );
    }

    if (error instanceof NewsDataProcessingError) {
      return sendError(
        buildError({
          code: error.code,
          message: error.message,
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
