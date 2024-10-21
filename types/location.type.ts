import { Id } from "@/lib/database";
import { ICountry } from "./utils/country.type";

export interface ILocation {
  id: Id | string;
  country: ICountry;
  user_id: Id | string;
  created_at: Date;
  updated_at: Date;
}
