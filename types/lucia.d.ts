import { lucia } from "@/lib/auth/auth";
import { Id } from "@/lib/database";
import { IUser } from "./user.type";

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Partial<IUser>;
    UserId: Id | string;
  }
}
