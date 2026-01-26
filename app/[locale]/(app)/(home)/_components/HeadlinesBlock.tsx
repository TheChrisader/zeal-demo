import { unstable_cache } from "next/cache";
import PostModel from "@/database/post/post.model";
import { cacheManager } from "@/lib/cache";
import { IPost } from "@/types/post.type";
import { deduplicateByKey } from "@/utils/object.utils";
import ArticlesContainer from "./ArticlesContainer";
import { FEATURED_TIME_WINDOW_MS } from "./constants";
import Headlines from "./Headlines";
import ScrollContainer from "./ScrollContainer";
import { loadMoreHeadlines } from "../actions";

const HEADLINE_POST_FIELDS =
  "_id title image_url slug description category ttr source prominence_score";

type SortOptions = { prominence_score?: -1; published_at: -1 } | { published_at: -1 };

interface HeadlinesBlockConfig {
  categories: string[];
  sort: SortOptions;
  limit: number;
  filters?: Record<string, unknown>;
  selectFields?: string;
  cacheTags?: string[];
  featuredRevalidate?: number;
}

interface HeadlinesBlockProps {
  category: string;
  config: HeadlinesBlockConfig;
  loadMoreAction?: (offset: number, category: string) => Promise<IPost[]>;
}

const defaultSelectFields = HEADLINE_POST_FIELDS;

export async function getHeadlinesPosts(config: HeadlinesBlockConfig) {
  const {
    categories,
    sort,
    limit,
    filters = {},
    selectFields = defaultSelectFields,
  } = config;

  return PostModel.find({
    category: { $in: categories },
    image_url: { $ne: null },
    ...filters,
  })
    .sort(sort)
    .limit(limit)
    .select(selectFields)
    .exec();
}

export async function getFeaturedPosts(
  categories: string[],
  featuredDate: Date,
) {
  return PostModel.find({
    category: { $in: categories },
    image_url: { $ne: null },
    top_feature: { $gt: featuredDate },
  })
    .sort({ published_at: -1 })
    .select(defaultSelectFields)
    .exec();
}

export default async function HeadlinesBlock({
  category,
  config,
  loadMoreAction = loadMoreHeadlines,
}: HeadlinesBlockProps) {
  if (!category) return null;

  const {
    categories,
    sort,
    limit,
    filters = {},
    selectFields = defaultSelectFields,
    cacheTags = [],
    featuredRevalidate = 60 * 60,
  } = config;

  const headlinesPosts = await unstable_cache(
    () =>
      getHeadlinesPosts({
        categories,
        sort,
        limit,
        filters,
        selectFields,
      }),
    [category, ...cacheTags],
    {
      revalidate: 60 * 60,
      tags: [category, ...cacheTags],
    },
  )();

  if (!headlinesPosts?.length) {
    return null;
  }

  const featuredDate = new Date(Date.now() - FEATURED_TIME_WINDOW_MS);

  const featured = await cacheManager({
    fetcher: async (): Promise<IPost[]> => {
      return getFeaturedPosts(categories, featuredDate);
    },
    key: `${category}-featured`,
    options: {
      revalidate: featuredRevalidate,
    },
  });

  const deduplicatedPosts = deduplicateByKey(
    [...featured, ...headlinesPosts],
    "_id",
  );

  return (
    <ArticlesContainer title={category}>
      <Headlines headlines={deduplicatedPosts} />
      <ScrollContainer loadMoreAction={loadMoreAction} category={category}>
        <></>
      </ScrollContainer>
    </ArticlesContainer>
  );
}
