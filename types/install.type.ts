import { Id } from "@/lib/database";

export interface IInstall {
  _id?: Id;
  user_id?: Id;
  eventType: "prompt_shown" | "prompt_accepted" | "prompt_dismissed";
  deviceInfo: {
    platform: string;
    os: string;
    device: string;
  };
}
