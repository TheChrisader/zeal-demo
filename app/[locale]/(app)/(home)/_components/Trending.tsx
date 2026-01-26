import PostModel from "@/database/post/post.model";
import { connectToDatabase } from "@/lib/database";
import { IPost } from "@/types/post.type";
import ArticleCard from "./ArticleCard";
import ScrollContainer from "./ScrollContainer";

const PAGE_SIZE = 4;

interface TrendingProps {
  articles: IPost[];
  category?: string;
}

async function getNextPosts(offset: number, category: string): Promise<IPost[]> {
  "use server";
  try {
    await connectToDatabase();

    const posts = await PostModel.find({
      category,
    })
      .sort({ published_at: -1 })
      .skip(offset * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean()
      .exec();

    return JSON.parse(JSON.stringify(posts)) as IPost[];
  } catch (error) {
    console.error("Error loading more posts:", error);
    return [];
  }
}

const Trending = ({ articles, category }: TrendingProps) => {
  if (articles.length === 0) {
    return (
      <span className="text-lg">There are no posts under this category.</span>
    );
  }

  if (category) {
    return (
      <div className="flex flex-wrap gap-5">
        <ScrollContainer category={category} loadMoreAction={getNextPosts}>
          {articles.map((article) => (
            <ArticleCard
              className="min-w-[50%] flex-1 basis-2/5"
              article={article}
              key={String(article.id)}
            />
          ))}
        </ScrollContainer>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-5">
      {articles.map((article) => (
        <ArticleCard
          className="min-w-[calc(40vw-20px)] flex-1 basis-[calc(40vw-20px)] max-[750px]:min-w-full"
          article={article}
          key={String(article.id)}
        />
      ))}
    </div>
  );
};

export default Trending;
