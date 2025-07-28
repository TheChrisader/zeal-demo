import { Id } from "@/lib/database";

import { IArticle } from "@/types/article.type";
import { SlugGenerator } from "@/lib/slug";
import { IDraft } from "@/types/draft.type";

import ArticleModel from "./article.model";
import UserModel from "../user/user.model";
import { generateRandomString } from "@/lib/utils";
import { calculateReadingTime } from "@/utils/post.utils";

export type SortParams<D> = Partial<Record<keyof D, -1 | 1>>;

export type QueryOptions<D> = {
  sort?: SortParams<D>;
  skip?: number;
  limit?: number;
};

// create article
export const createArticle = async (article: Partial<IArticle>): Promise<IArticle> => {
  try {
    const newArticleDoc = await ArticleModel.create(article);
    const createdArticle = newArticleDoc.toObject();
    return createdArticle;
  } catch (error) {
    throw error;
  }
};

export const createArticleFromDraft = async (draft: IDraft): Promise<IArticle> => {
  try {
    const slugGenerator = new SlugGenerator();
    const slug = slugGenerator.generate(draft.title);

    const user = await UserModel.findById(draft.user_id);

    if (!user) {
      throw new Error("User not found");
    }

    const source = {
      id: user.username,
      name: user.display_name,
      icon: user.avatar,
      url: "",
    };

    const newArticleDoc = await ArticleModel.create({
      ...draft,
      slug,
      author_id: user._id.toString(),
      status: "active",
      external: false,
      country: ["Nigeria"],
      published: true,
      source,
      published_at: new Date().toISOString(),
      generatedBy: "user",
      language: "English",
      link: `httyd://${generateRandomString(10)}`,
      ttr: calculateReadingTime(draft.content),
      draft_id: draft._id,
    });
    const createdArticle = newArticleDoc.toObject();
    return createdArticle;
  } catch (error) {
    throw error;
  }
};

// update article
export const updateArticle = async (article: IArticle): Promise<IArticle | null> => {
  try {
    const updatedArticleDoc = await ArticleModel.findByIdAndUpdate(
      article.id,
      { $set: { ...article } },
      {
        new: true,
      },
    );
    const updatedArticle = updatedArticleDoc?.toObject() || null;
    return updatedArticle;
  } catch (error) {
    throw error;
  }
};

// get article
export const getArticleById = async (
  articleId: string | Id,
): Promise<IArticle | null> => {
  try {
    const articleDoc = await ArticleModel.findById(articleId);
    const article = articleDoc?.toObject() || null;
    return article;
  } catch (error) {
    throw error;
  }
};

export const getArticleBySlug = async (slug: string): Promise<IArticle | null> => {
  try {
    const articleDoc = await ArticleModel.findOne({ slug });
    const article = articleDoc?.toObject() || null;
    return article;
  } catch (error) {
    throw error;
  }
};

// delete article
export const deleteArticleById = async (
  articleId: string | Id,
): Promise<IArticle | null> => {
  try {
    const deletedArticleDoc = await ArticleModel.findByIdAndDelete(articleId);
    const deletedArticle = deletedArticleDoc?.toObject() || null;
    return deletedArticle;
  } catch (error) {
    throw error;
  }
};

// create articles
export const createArticles = async (
  articles: Partial<IArticle>[],
): Promise<IArticle[]> => {
  try {
    const createdArticles = await ArticleModel.insertMany(articles, {
      ordered: false,
    });

    const articlesToReturn = createdArticles.map((article) => article.toObject());

    return articlesToReturn;
  } catch (error) {
    throw error;
  }
};

// get articles
export const getArticles = async (): Promise<IArticle[]> => {
  try {
    const articles = await ArticleModel.find();
    return articles.map((article) => article.toObject());
  } catch (error) {
    throw error;
  }
};

// get many articles
export const getArticlesByIds = async (
  articleIds: string[],
  sort?: SortParams<IArticle>,
): Promise<IArticle[]> => {
  try {
    if (!sort) {
      sort = {
        published_at: -1,
      };
    }
    const articles = await ArticleModel.find({ _id: { $in: articleIds } }).sort({
      ...sort,
    });
    return articles.map((article) => article.toObject());
  } catch (error) {
    throw error;
  }
};

export const getArticlesBySlugs = async (
  slugs: string[],
  sort: SortParams<IArticle> = {},
): Promise<IArticle[]> => {
  try {
    if (!sort) {
      sort = {
        published_at: -1,
      };
    }
    const articles = await ArticleModel.find({ slug: { $in: slugs } }).sort({
      ...sort,
    });
    return articles.map((article) => article.toObject());
  } catch (error) {
    throw error;
  }
};

// get many articles by filters
/* {filters.query
    ? {
        $or: [
          { title: { $regex: filters.query, $options: "i" } },
          { description: { $regex: filters.query, $options: "i" } },
        ],
      }
    : {},
  filters.categories
    ? { category: { $in: filters.categories } }
    : {},
  filters.authors
    ? { author_id: { $in: filters.authors } }
    : {},} */
export const getArticlesByFilters = async (filters: {
  query?: string;
  categories?: string[];
  domain?: string;
  keywords?: string[];
  country?: string[];
  image?: boolean;
  limit?: number;
  cluster?: string;
  skip?: number;
  sort?: SortParams<IArticle>;
}): Promise<IArticle[]> => {
  const queryFilters = filters.query
    ? {
        $or: [
          { title: { $regex: filters.query.trim(), $options: "i" } },
          { description: { $regex: filters.query, $options: "i" } },
        ],
      }
    : {};

  let categoriesFilters = filters.categories
    ? { category: { $in: filters.categories } }
    : {};

  const domainFilters = filters.domain?.length
    ? { "source.name": filters.domain }
    : {};

  const keywordsFilters = filters.keywords
    ? { keywords: { $in: filters.keywords } }
    : {};

  const countryFilters = filters.country
    ? { country: { $in: filters.country } }
    : {};

  const imageFilters = !filters.image ? {} : { image_url: { $ne: null } };

  const clusterFilters = filters.cluster ? { cluster_id: filters.cluster } : {};

  if (filters.query) {
    categoriesFilters = {};
  }

  // console.log({
  //   ...queryFilters,
  //   ...categoriesFilters,
  //   ...domainFilters,
  //   ...keywordsFilters,
  //   ...countryFilters,
  //   ...imageFilters,
  //   ...clusterFilters,
  // });

  try {
    const articles = await ArticleModel.find({
      ...queryFilters,
      ...categoriesFilters,
      ...domainFilters,
      ...keywordsFilters,
      ...countryFilters,
      ...imageFilters,
      ...clusterFilters,
    })
      .skip(filters.skip || 0)
      .limit(filters.limit || 20)
      .sort(
        filters.sort || {
          published_at: -1,
        },
      );
    return articles.map((article) => article.toObject());
  } catch (error) {
    throw error;
  }
};

export const getArticlesByCategories = async (
  categories: string[],
): Promise<IArticle[]> => {
  try {
    const articles = await ArticleModel.find({ category: { $in: categories } });
    return articles.map((article) => article.toObject());
  } catch (error) {
    throw error;
  }
};

interface ArticleQueryOptions {
  limit?: number;
  skip?: number;
}

export const getArticlesByAuthorId = async (
  authorId: string | Id,
  options: ArticleQueryOptions = {},
): Promise<IArticle[]> => {
  try {
    const skip = options.skip || 0;
    const limit = options.limit || 5;

    const articles = await ArticleModel.find({ author_id: authorId })
      .skip(skip)
      .limit(limit);
    return articles.map((article) => article.toObject());
  } catch (error) {
    throw error;
  }
};

export const getArticlesByKeyword = async (keyword: string): Promise<IArticle[]> => {
  try {
    const articles = await ArticleModel.find({
      title: { $regex: keyword, $options: "i" },
    });
    return articles.map((article) => article.toObject());
  } catch (error) {
    throw error;
  }
};
