import { Id } from "@/lib/database";

export interface IHistory {
  _id?: Id;
  date: string;
  year: string;
  event: string;
}
