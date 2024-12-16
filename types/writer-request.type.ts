import { Document } from "mongoose";
import { Id } from "@/lib/database";

export interface IWriterRequest extends Document {
  user_id: Id;
  name: string;
  brand_name: string;
  social_platforms: {
    platform: string;
    url: string;
  }[];
  is_publisher: boolean;
  is_freelancer: boolean;
  will_upload_media: boolean;
}
