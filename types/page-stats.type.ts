import { Document } from "mongodb";

export interface IPageStats extends Document {
  slug: string;
  category: string;
  date: string; // Format: YYYY-MM-DD
  views: number;
}