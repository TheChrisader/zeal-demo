import { Id } from "@/lib/database";
import { IReaction } from "./reaction.type";
// import { ICountries } from "./utils/country.type";
import { Language } from "./utils/language.type";
import { IPostSource } from "./utils/postsource.type";

export interface IPost {
  _id?: Id;
  id: Id | string;
  title: string;
  slug: string;
  cluster_id?: string;
  bookmarked?: boolean;
  headline?: boolean;
  author_id: Id | string;
  content: string;
  description: string;
  ttr: number;
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
  top_feature?: string;
  status?: "active" | "removed" | "flagged";
  published_at: Date | string;
  created_at: string;
  updated_at: string;
}
