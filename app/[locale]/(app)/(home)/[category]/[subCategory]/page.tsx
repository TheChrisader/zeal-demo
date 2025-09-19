import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { getCategoryByPath } from "@/categories";
import FrontpagePromotion from "@/components/promotion/frontpage";
import PostModel from "@/database/post/post.model";
import { cacheManager } from "@/lib/cache";
import { connectToDatabase } from "@/lib/database";
import { IPost } from "@/types/post.type";
import { deduplicateByKey } from "@/utils/object.utils";
import ArticleCard from "../../_components/ArticleCard";
import ArticlesContainer from "../../_components/ArticlesContainer";
import Headlines from "../../_components/Headlines";
import ScrollContainer from "../../_components/ScrollContainer";

const loadMoreHeadlines = async (offset: number, category: string) => {
  "use server";

  const HeadlinesPosts = await (async () => {
    return await PostModel.find({
      category: {
        $in: [category],
      },
      image_url: {
        $ne: null,
      },
    })
      .sort({
        published_at: -1,
      })
      .skip(offset * 5 + 13)
      .limit(5)
      .select("-content")
      .exec();
  })();

  return (
    <>
      {HeadlinesPosts.map((article) => {
        article.id = article._id.toString();
        return (
          <ArticleCard
            className={"w-full"}
            article={article}
            key={article._id.toString()}
          />
        );
      })}
    </>
  );
};

const HeadlinesBlock = async ({ category }: { category: string }) => {
  if (!category) return null;

  let HeadlinesPosts: IPost[] = await unstable_cache(
    async () => {
      return await PostModel.find({
        category: {
          $in: [category],
        },
        image_url: {
          $ne: null,
        },
      })
        .sort({ published_at: -1 })
        .limit(13)
        .select("-content")
        .exec();
    },
    [category],
    {
      revalidate: 60 * 60,
      tags: [category],
    },
  )();

  if (!HeadlinesPosts) {
    return <></>;
  }

  const featureDate = new Date(new Date().setHours(new Date().getHours() - 2));

  const featured = await cacheManager({
    fetcher: async (): Promise<IPost[]> => {
      return await PostModel.find({
        category: {
          $in: [category],
        },
        image_url: {
          $ne: null,
        },
        top_feature: {
          $gt: featureDate,
        },
      });
    },
    key: `${category}-featured`,
    options: {
      revalidate: 2,
    },
  });

  HeadlinesPosts = deduplicateByKey([...featured, ...HeadlinesPosts], "_id");

  return (
    <ArticlesContainer title={category}>
      <Headlines headlines={HeadlinesPosts} />
      <ScrollContainer loadMoreAction={loadMoreHeadlines} category={category}>
        <></>
      </ScrollContainer>
    </ArticlesContainer>
  );
};

export default async function SubCategoryPage({
  params,
}: {
  params: { subCategory: string };
}) {
  await connectToDatabase();

  const category = getCategoryByPath(params.subCategory);

  if (!category) {
    notFound();
  }

  return (
    <main className="flex min-h-[calc(100vh-62px)] flex-col gap-7">
      <HeadlinesBlock category={category.name} />
      <FrontpagePromotion />
    </main>
  );
}
