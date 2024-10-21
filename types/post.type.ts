import { Id } from "@/lib/database";
import { IReaction } from "./reaction.type";
import { TCategory } from "./utils/category.type";
// import { ICountries } from "./utils/country.type";
import { Language } from "./utils/language.type";
import { IPostSource } from "./utils/postsource.type";

export interface IPost {
  _id?: Id;
  id: Id | string;
  title: string;
  cluster_id?: string;
  bookmarked?: boolean;
  headline?: boolean;
  author_id: Id | string;
  content: string;
  description: string;
  ttr: number;
  // thumbnail: string;
  link: string | null;
  image_url: string | null;
  video_url: string | null;
  source: Partial<IPostSource>;
  keywords: string[];
  language: Language;
  country: string[];
  category: string[];
  published: boolean;
  reactions: IReaction;
  external: boolean;
  published_at: Date | string;
  created_at: Date;
  updated_at: Date;
}
