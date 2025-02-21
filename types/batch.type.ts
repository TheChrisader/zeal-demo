import { Id } from "@/lib/database";

export interface IBatchArticle {
  id: Id | string;
  title: string;
  slug: string;
  source_url: string;
  source_name: string;
  source_icon: string;
}

export interface IBatch {
  _id?: Id;
  id?: Id | string;
  name: string;
  summary?: string;
  related?: Id[];
  articles: IBatchArticle[];
  created_at: Date;
  updated_at: Date;
}
